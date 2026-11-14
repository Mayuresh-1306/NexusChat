import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { ChatRoom, Message } from '../types';

export interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'room' | 'info';
  timestamp: Date;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeRoom: ChatRoom | null;
  setActiveRoom: (room: ChatRoom | null) => void;
  messages: Message[];
  sendMessage: (content: string, attachments?: string[]) => void;
  rooms: ChatRoom[];
  setRooms: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
  typingUsers: { [roomId: string]: string[] };
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  fetchRooms: () => Promise<void>;
  fetchMessages: (roomId: string) => Promise<void>;
  notifications: NotificationToast[];
  dismissNotification: (id: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ [roomId: string]: string[] }>({});
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchRooms = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms);
        if (!activeRoom && data.rooms.length > 0) {
          setActiveRoom(data.rooms[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchMessages = async (roomId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchRooms();
  }, [token]);

  useEffect(() => {
    if (activeRoom && token) {
      fetchMessages(activeRoom._id);
    }
  }, [activeRoom?._id]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io({
      auth: { token, userId: user?.id }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket.IO connected successfully');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket.IO disconnected');
    });

    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => {
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });

      // Trigger real-time visual notification if sender is another user
      const isMe = message.sender?._id === user?.id || (message.sender as any) === user?.id;
      if (!isMe) {
        const toastId = 'notif_' + Date.now() + Math.random().toString(36).substring(2, 6);
        const newToast: NotificationToast = {
          id: toastId,
          title: `New Message from ${message.sender?.name || 'Someone'}`,
          message: message.content,
          type: 'message',
          timestamp: new Date()
        };
        setNotifications(prev => [newToast, ...prev].slice(0, 4));

        // Auto dismiss after 4.5 seconds
        setTimeout(() => {
          dismissNotification(toastId);
        }, 4500);
      }
    });

    newSocket.on('room_created', (newRoom: ChatRoom) => {
      setRooms(prev => [newRoom, ...prev]);

      const toastId = 'room_' + Date.now();
      const newToast: NotificationToast = {
        id: toastId,
        title: 'New Room Created',
        message: `Channel "${newRoom.name}" has been created.`,
        type: 'room',
        timestamp: new Date()
      };
      setNotifications(prev => [newToast, ...prev].slice(0, 4));

      setTimeout(() => {
        dismissNotification(toastId);
      }, 4500);
    });

    newSocket.on('room_deleted', (roomId: string) => {
      setRooms(prev => prev.filter(r => r._id !== roomId));
      setActiveRoom(prev => (prev?._id === roomId ? null : prev));
    });

    newSocket.on('user_typing', (data: { roomId: string; userName: string }) => {
      setTypingUsers(prev => {
        const current = prev[data.roomId] || [];
        if (current.includes(data.userName)) return prev;
        return { ...prev, [data.roomId]: [...current, data.userName] };
      });
    });

    newSocket.on('user_stop_typing', (data: { roomId: string; userName: string }) => {
      setTypingUsers(prev => {
        const current = prev[data.roomId] || [];
        return { ...prev, [data.roomId]: current.filter(name => name !== data.userName) };
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?.id]);

  useEffect(() => {
    if (socket && activeRoom) {
      socket.emit('join_room', activeRoom._id);
      return () => {
        socket.emit('leave_room', activeRoom._id);
      };
    }
  }, [socket, activeRoom?._id]);

  const sendMessage = (content: string, attachments?: string[]) => {
    if (!socket || !activeRoom || !user) return;
    socket.emit('send_message', {
      roomId: activeRoom._id,
      content,
      attachments: attachments || [],
      senderId: user.id
    });
  };

  const startTyping = (roomId: string) => {
    if (!socket || !user) return;
    socket.emit('typing_start', { roomId, userName: user.name });
  };

  const stopTyping = (roomId: string) => {
    if (!socket || !user) return;
    socket.emit('typing_stop', { roomId, userName: user.name });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activeRoom,
        setActiveRoom,
        messages,
        sendMessage,
        rooms,
        setRooms,
        typingUsers,
        startTyping,
        stopTyping,
        fetchRooms,
        fetchMessages,
        notifications,
        dismissNotification
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
