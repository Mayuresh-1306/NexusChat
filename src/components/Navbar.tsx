import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import {
  MessageSquare,
  Shield,
  FileText,
  Database,
  Container,
  CheckSquare,
  LogOut,
  Sun,
  Moon,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

interface NavbarProps {
  onOpenApiDocs: () => void;
  onOpenDbSchema: () => void;
  onOpenDockerGuide: () => void;
  onOpenChecklist: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenApiDocs,
  onOpenDbSchema,
  onOpenDockerGuide,
  onOpenChecklist,
  onOpenAdmin
}) => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2">
            NexusChat
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
              MERN + Socket.IO
            </span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              {isConnected ? (
                <span className="flex items-center gap-1 text-emerald-500 font-medium">
                  <Wifi className="w-3 h-3" /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-500 font-medium">
                  <WifiOff className="w-3 h-3" /> Connecting...
                </span>
              )}
            </span>
            <span>•</span>
            <span>Evaluation Suite</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Navigation / Evaluation Tools Buttons */}
        <button
          onClick={onOpenChecklist}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition"
          title="Project Checklist & Rubric"
        >
          <CheckSquare className="w-4 h-4" />
          Checklist
        </button>

        <button
          onClick={onOpenApiDocs}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title="REST API Documentation"
        >
          <FileText className="w-4 h-4 text-indigo-500" />
          <span className="hidden sm:inline">API Docs</span>
        </button>

        <button
          onClick={onOpenDbSchema}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title="MongoDB Mongoose Schemas"
        >
          <Database className="w-4 h-4 text-violet-500" />
          <span className="hidden sm:inline">Database</span>
        </button>

        <button
          onClick={onOpenDockerGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title="Docker & DevOps Process"
        >
          <Container className="w-4 h-4 text-cyan-500" />
          <span className="hidden sm:inline">Docker</span>
        </button>

        {user?.role === 'admin' && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition"
            title="Admin Dashboard"
          >
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title="Toggle Dark/Light Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <div className="flex items-center gap-2">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover bg-slate-800"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition ml-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
