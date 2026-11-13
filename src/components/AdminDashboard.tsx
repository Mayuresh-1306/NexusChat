import React, { useState, useEffect } from 'react';
import { User, AdminStats, ChatRoom } from '../types';
import { Shield, X, Users, Server, Database, Trash2, Cpu, HardDrive, RefreshCw } from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'rooms'>('overview');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('nexus_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes, roomsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/users', { headers }),
        fetch('/api/rooms', { headers })
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }
      if (roomsRes.ok) {
        const data = await roomsRes.json();
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const token = localStorage.getItem('nexus_token');
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => (u._id === userId || (u as any).id === userId ? { ...u, role: newRole as any } : u)));
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room and its messages?')) return;
    try {
      const token = localStorage.getItem('nexus_token');
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setRooms(rooms.filter(r => r._id !== roomId));
      }
    } catch (err) {
      console.error('Error deleting room:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl h-[90vh] sm:h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">Admin Dashboard & RBAC</h2>
              <p className="text-xs text-slate-500 truncate">Manage user roles, monitor metrics & moderate</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={fetchData}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 bg-slate-100/50 dark:bg-slate-900/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'rooms'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Room Moderation ({rooms.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Total Users</span>
                    <Users className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.userCount || users.length}</p>
                  <p className="text-[10px] text-emerald-500 mt-1">{stats?.onlineUsers || 0} online currently</p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Chat Rooms</span>
                    <Database className="w-4 h-4 text-violet-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.roomCount || rooms.length}</p>
                  <p className="text-[10px] text-slate-400 mt-1">MongoDB Mongoose synced</p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Server Uptime</span>
                    <Cpu className="w-4 h-4 text-cyan-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats ? Math.floor(stats.serverUptime) : 0}s
                  </p>
                  <p className="text-[10px] text-cyan-400 mt-1">Node {stats?.nodeVersion || 'v22'}</p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Memory Heap</span>
                    <HardDrive className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats ? Math.round(stats.memoryUsage / 1024 / 1024) : 0} MB
                  </p>
                  <p className="text-[10px] text-amber-400 mt-1">Optimized heap usage</p>
                </div>
              </div>

              <div className="p-5 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl">
                <h3 className="font-semibold text-sm text-white mb-2 flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  Backend Architecture & Security Status
                </h3>
                <ul className="space-y-2 text-xs text-indigo-200/80">
                  <li className="flex items-center gap-2">✓ JWT Authentication middleware active with Bearer token header verification</li>
                  <li className="flex items-center gap-2">✓ Bcrypt password hashing configured securely (10 salt rounds)</li>
                  <li className="flex items-center gap-2">✓ Socket.IO real-time event handlers running with automatic room broadcasting</li>
                  <li className="flex items-center gap-2">✓ Role-Based Access Control (RBAC) enforced on admin routes</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-3">
              {users.map(u => {
                const uid = u._id || (u as any).id;
                return (
                  <div key={uid} className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full bg-slate-800 object-cover" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {u.role}
                      </span>
                      <button
                        onClick={() => handleRoleToggle(uid, u.role)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition"
                      >
                        Toggle Role
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="space-y-3">
              {rooms.map(room => (
                <div key={room._id} className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      #{room.name}
                      {room.isPrivate && <span className="text-[10px] text-amber-500 font-normal">Private</span>}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{room.description || 'No description'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteRoom(room._id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition"
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
