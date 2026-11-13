import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { ChatRoom, User } from '../types';
import { Hash, Plus, Search, Users, Shield, Circle, Lock } from 'lucide-react';

interface SidebarProps {
  onOpenCreateRoom: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreateRoom }) => {
  const { rooms, activeRoom, setActiveRoom } = useSocket();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [tab, setTab] = useState<'rooms' | 'users'>('rooms');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('nexus_token');
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsersList(data.users);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    room.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <aside className="w-full h-full bg-slate-50 dark:bg-slate-900/50 flex flex-col transition-colors overflow-hidden">
      {/* Search & Tabs Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl w-full">
            <button
              onClick={() => setTab('rooms')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                tab === 'rooms'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Rooms ({rooms.length})
            </button>
            <button
              onClick={() => setTab('users')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                tab === 'users'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Users ({usersList.length})
            </button>
          </div>
          {tab === 'rooms' && (
            <button
              onClick={onOpenCreateRoom}
              className="ml-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-md shadow-indigo-500/20"
              title="Create Chat Room"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={tab === 'rooms' ? 'Search rooms...' : 'Search users...'}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {tab === 'rooms' ? (
          filteredRooms.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No rooms found</div>
          ) : (
            filteredRooms.map(room => {
              const isActive = activeRoom?._id === room._id;
              return (
                <button
                  key={room._id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full text-left p-3 rounded-xl transition flex items-start gap-3 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-indigo-500'}`}>
                    {room.isPrivate ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm truncate">{room.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                        {room.members?.length || 1}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {room.description || 'General discussion room'}
                    </p>
                  </div>
                </button>
              );
            })
          )
        ) : (
          filteredUsers.map(u => {
            const isOnline = u.status === 'online';
            return (
              <div
                key={u._id || u.email}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition"
              >
                <div className="relative">
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                    alt={u.name}
                    className="w-9 h-9 rounded-full bg-slate-800 object-cover border border-slate-700"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                      isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{u.name}</p>
                    {u.role === 'admin' && <Shield className="w-3 h-3 text-amber-400" />}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-indigo-500" />
          {usersList.length} Registered Users
        </span>
        <span className="font-semibold text-indigo-500">MongoDB Mongoose</span>
      </div>
    </aside>
  );
};
