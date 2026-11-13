export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  createdAt?: string;
}

export interface ChatRoom {
  _id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  members: User[];
  createdBy: User | string;
  createdAt: string;
}

export interface Message {
  _id: string;
  room: string;
  sender: User;
  content: string;
  attachments?: string[];
  readBy?: string[];
  createdAt: string;
}

export interface AdminStats {
  userCount: number;
  roomCount: number;
  messageCount: number;
  onlineUsers: number;
  serverUptime: number;
  memoryUsage: number;
  nodeVersion: string;
}
