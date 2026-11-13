import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'nexus_chat_super_secret_jwt_key_2026';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexus_chat';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

app.use(cors());
app.use(express.json());

// ==================== HYBRID DB & IN-MEMORY STORE ====================
let isMongoConnected = false;

const memoryDB = {
  users: [] as any[],
  rooms: [] as any[],
  messages: [] as any[]
};

async function initSeedData() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const adminId = 'u_admin_1';
  const userId = 'u_user_2';

  memoryDB.users = [
    {
      _id: adminId,
      id: adminId,
      name: 'System Admin',
      email: 'admin@chat.com',
      password: adminPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'online',
      createdAt: new Date()
    },
    {
      _id: userId,
      id: userId,
      name: 'Alex Johnson',
      email: 'user@chat.com',
      password: userPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'online',
      createdAt: new Date()
    }
  ];

  const roomId = 'r_general_1';
  memoryDB.rooms = [
    {
      _id: roomId,
      name: 'General Lounge',
      description: 'Main public chat room for everyone to connect and discuss projects.',
      isPrivate: false,
      members: [adminId, userId],
      createdBy: adminId,
      createdAt: new Date()
    }
  ];

  memoryDB.messages = [
    {
      _id: 'm_1',
      room: roomId,
      sender: adminId,
      content: 'Welcome to NexusChat MERN! Real-time WebSockets, Mongoose schemas, and JWT auth are fully operational.',
      attachments: [],
      readBy: [adminId],
      createdAt: new Date()
    }
  ];
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  status: { type: String, enum: ['online', 'offline', 'busy'], default: 'offline' },
  createdAt: { type: Date, default: Date.now }
});

const chatRoomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  isPrivate: { type: Boolean, default: false },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const ChatRoom = mongoose.models.ChatRoom || mongoose.model('ChatRoom', chatRoomSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

async function connectDB() {
  await initSeedData();
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    isMongoConnected = true;
    console.log('Connected to MongoDB Atlas successfully');

    // Force seed default admin & user into MongoDB Atlas if collection is empty
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding default documents into MongoDB Atlas...');
      for (const u of memoryDB.users) {
        await User.create({
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          avatar: u.avatar,
          status: u.status
        }).catch(err => console.log('Seed error item:', err.message));
      }
      
      const adminDoc = await User.findOne({ email: 'admin@chat.com' });
      const userDoc = await User.findOne({ email: 'user@chat.com' });
      if (adminDoc && userDoc) {
        const room = await ChatRoom.create({
          name: 'General Lounge',
          description: 'Main public chat room for everyone to connect and discuss projects.',
          isPrivate: false,
          members: [adminDoc._id, userDoc._id],
          createdBy: adminDoc._id
        });

        await Message.create({
          room: room._id,
          sender: adminDoc._id,
          content: 'Welcome to NexusChat MERN! Connected to MongoDB Atlas successfully.'
        });
      }
      console.log('MongoDB Atlas seeding completed.');
    }
  } catch (err: any) {
    console.warn('MongoDB note: Running in high-performance In-Memory Fallback mode.', err?.message);
    isMongoConnected = false;
  }
}

// ==================== AUTH & RBAC MIDDLEWARE ====================
interface AuthRequest extends express.Request {
  user?: { userId: string; role: string; email: string };
}

const authenticateToken = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};

// ==================== REST API ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    let existingUser = null;
    if (isMongoConnected) {
      existingUser = await User.findOne({ email });
    } else {
      existingUser = memoryDB.users.find(u => u.email === email);
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user';
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    const newId = 'u_' + Date.now();

    let newUser: any = {
      _id: newId,
      id: newId,
      name,
      email,
      password: hashedPassword,
      role: userRole,
      avatar,
      status: 'online',
      createdAt: new Date()
    };

    if (isMongoConnected) {
      const created = await User.create({
        name,
        email,
        password: hashedPassword,
        role: userRole,
        avatar,
        status: 'online'
      });
      newUser._id = created._id.toString();
      newUser.id = created._id.toString();
    } else {
      memoryDB.users.push(newUser);
    }

    const token = jwt.sign({ userId: newUser._id || newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser._id || newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar, status: newUser.status }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user = null;
    let userPassword = '';

    if (isMongoConnected) {
      const found = await User.findOne({ email }).select('+password');
      if (found) {
        user = found.toObject ? found.toObject() : found;
        userPassword = found.password;
      }
    } else {
      const found = memoryDB.users.find(u => u.email === email);
      if (found) {
        user = found;
        userPassword = found.password;
      }
    }

    if (!user || !userPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, userPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = jwt.sign({ userId, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: userId, name: user.name, email: user.email, role: user.role, avatar: user.avatar, status: 'online' }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error during login' });
  }
});

// Get Current User
app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    let user = null;
    if (isMongoConnected) {
      user = await User.findById(req.user?.userId).select('-password');
    } else {
      user = memoryDB.users.find(u => u._id === req.user?.userId || u.id === req.user?.userId);
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    const userObj = isMongoConnected && typeof user.toObject === 'function' ? user.toObject() : user;
    res.json({ user: { id: userObj._id || userObj.id, ...userObj } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Users List
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    let users = [];
    if (isMongoConnected) {
      users = await User.find().select('-password').sort({ status: -1, name: 1 });
    } else {
      users = memoryDB.users.map(u => ({ ...u, _id: u._id || u.id }));
    }
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update User Role (Admin only)
app.patch('/api/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    let updatedUser = null;
    if (isMongoConnected) {
      updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
    } else {
      const u = memoryDB.users.find(user => user._id === userId || user.id === userId);
      if (u) {
        u.role = role;
        updatedUser = u;
      }
    }

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User role updated successfully', user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Chat Rooms
app.get('/api/rooms', authenticateToken, async (req: AuthRequest, res) => {
  try {
    let rooms = [];
    if (isMongoConnected) {
      rooms = await ChatRoom.find()
        .populate('members', 'name email avatar status')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
    } else {
      rooms = memoryDB.rooms.map(r => ({
        ...r,
        members: r.members.map((mId: string) => memoryDB.users.find(u => u._id === mId || u.id === mId) || { _id: mId, name: 'User' }),
        createdBy: memoryDB.users.find(u => u._id === r.createdBy || u.id === r.createdBy) || { name: 'Admin' }
      }));
    }
    res.json({ rooms });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Chat Room
app.post('/api/rooms', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, description, isPrivate, memberIds } = req.body;
    if (!name) return res.status(400).json({ error: 'Room name is required' });

    const members = memberIds ? [...memberIds, req.user?.userId] : [req.user?.userId];
    const roomId = 'r_' + Date.now();

    let createdRoom: any = {
      _id: roomId,
      name,
      description: description || '',
      isPrivate: !!isPrivate,
      members,
      createdBy: req.user?.userId,
      createdAt: new Date()
    };

    if (isMongoConnected) {
      const room = await ChatRoom.create({
        name,
        description: description || '',
        isPrivate: !!isPrivate,
        members,
        createdBy: req.user?.userId
      });
      createdRoom = await ChatRoom.findById(room._id)
        .populate('members', 'name email avatar status')
        .populate('createdBy', 'name');
    } else {
      memoryDB.rooms.unshift(createdRoom);
      createdRoom = {
        ...createdRoom,
        members: members.map((mId: string) => memoryDB.users.find(u => u._id === mId || u.id === mId)),
        createdBy: memoryDB.users.find(u => u._id === req.user?.userId || u.id === req.user?.userId)
      };
    }

    io.emit('room_created', createdRoom);
    res.status(201).json({ message: 'Room created successfully', room: createdRoom });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Messages for Room
app.get('/api/rooms/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    let messages = [];
    if (isMongoConnected) {
      messages = await Message.find({ room: roomId })
        .populate('sender', 'name email avatar')
        .sort({ createdAt: 1 })
        .limit(100);
    } else {
      messages = memoryDB.messages
        .filter(m => m.room === roomId)
        .map(m => ({
          ...m,
          sender: memoryDB.users.find(u => u._id === m.sender || u.id === m.sender) || { name: 'User' }
        }));
    }
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Stats & Logs
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userCount = isMongoConnected ? await User.countDocuments() : memoryDB.users.length;
    const roomCount = isMongoConnected ? await ChatRoom.countDocuments() : memoryDB.rooms.length;
    const messageCount = isMongoConnected ? await Message.countDocuments() : memoryDB.messages.length;
    const onlineUsers = isMongoConnected ? await User.countDocuments({ status: 'online' }) : memoryDB.users.filter(u => u.status === 'online').length;

    res.json({
      stats: {
        userCount,
        roomCount,
        messageCount,
        onlineUsers,
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage().heapUsed,
        nodeVersion: process.version
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Room (Admin only)
app.delete('/api/rooms/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const roomId = req.params.id;
    if (isMongoConnected) {
      await ChatRoom.findByIdAndDelete(roomId);
      await Message.deleteMany({ room: roomId });
    } else {
      memoryDB.rooms = memoryDB.rooms.filter(r => r._id !== roomId);
      memoryDB.messages = memoryDB.messages.filter(m => m.room !== roomId);
    }
    io.emit('room_deleted', roomId);
    res.json({ message: 'Room deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SOCKET.IO REAL-TIME HANDLERS ====================
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.token;
  if (!token) {
    socket.data.userId = socket.handshake.auth.userId || 'guest';
    return next();
  }
  jwt.verify(token as string, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return next(new Error('Authentication error'));
    socket.data.userId = decoded.userId;
    socket.data.role = decoded.role;
    next();
  });
});

io.on('connection', (socket: Socket) => {
  console.log(`Socket connected: ${socket.id} (User: ${socket.data.userId})`);

  if (socket.data.userId && socket.data.userId !== 'guest') {
    if (isMongoConnected) {
      User.findByIdAndUpdate(socket.data.userId, { status: 'online' }).exec().catch(() => {});
    } else {
      const u = memoryDB.users.find(user => user._id === socket.data.userId || user.id === socket.data.userId);
      if (u) u.status = 'online';
    }
    io.emit('user_status_changed', { userId: socket.data.userId, status: 'online' });
  }

  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
  });

  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
  });

  socket.on('send_message', async (data: { roomId: string; content: string; attachments?: string[]; senderId: string }) => {
    try {
      const { roomId, content, attachments, senderId } = data;
      const actualSenderId = socket.data.userId !== 'guest' ? socket.data.userId : senderId;

      if (!content || !roomId || !actualSenderId) return;

      const msgId = 'm_' + Date.now();
      let populatedMessage: any = {
        _id: msgId,
        room: roomId,
        sender: memoryDB.users.find(u => u._id === actualSenderId || u.id === actualSenderId) || { _id: actualSenderId, name: 'User' },
        content,
        attachments: attachments || [],
        createdAt: new Date()
      };

      if (isMongoConnected) {
        const message = await Message.create({
          room: roomId,
          sender: actualSenderId,
          content,
          attachments: attachments || []
        });
        populatedMessage = await Message.findById(message._id).populate('sender', 'name email avatar');
      } else {
        memoryDB.messages.push({
          _id: msgId,
          room: roomId,
          sender: actualSenderId,
          content,
          attachments: attachments || [],
          createdAt: new Date()
        });
      }

      io.to(roomId).emit('new_message', populatedMessage);
    } catch (err) {
      console.error('Error sending message via socket:', err);
    }
  });

  socket.on('typing_start', (data: { roomId: string; userName: string }) => {
    socket.to(data.roomId).emit('user_typing', data);
  });

  socket.on('typing_stop', (data: { roomId: string }) => {
    socket.to(data.roomId).emit('user_stop_typing', data);
  });

  socket.on('disconnect', () => {
    if (socket.data.userId && socket.data.userId !== 'guest') {
      if (isMongoConnected) {
        User.findByIdAndUpdate(socket.data.userId, { status: 'offline' }).exec().catch(() => {});
      } else {
        const u = memoryDB.users.find(user => user._id === socket.data.userId || user.id === socket.data.userId);
        if (u) u.status = 'offline';
      }
      io.emit('user_status_changed', { userId: socket.data.userId, status: 'offline' });
    }
  });
});

// ==================== VITE MIDDLEWARE & STARTUP ====================
async function startServer() {
  await connectDB();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`NexusChat server running on http://localhost:${PORT}`);
  });
}

startServer();
