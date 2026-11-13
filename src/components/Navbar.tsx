import React, { useState } from 'react';
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
  Wifi,
  WifiOff,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="h-16 px-3 sm:px-4 flex items-center justify-between">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight flex items-center gap-1.5 sm:gap-2 truncate">
              <span>NexusChat</span>
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20 flex-shrink-0">
                MERN
              </span>
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                {isConnected ? (
                  <span className="flex items-center gap-1 text-emerald-500 font-medium">
                    <Wifi className="w-3 h-3" /> Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-500 font-medium">
                    <WifiOff className="w-3 h-3" /> Offline
                  </span>
                )}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Evaluation Suite</span>
            </div>
          </div>
        </div>

        {/* Right Desktop: Evaluation & Quick Tools */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
          <button
            onClick={onOpenChecklist}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition"
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
            <span>API Docs</span>
          </button>

          <button
            onClick={onOpenDbSchema}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="MongoDB Mongoose Schemas"
          >
            <Database className="w-4 h-4 text-violet-500" />
            <span>Database</span>
          </button>

          <button
            onClick={onOpenDockerGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="Docker & DevOps Process"
          >
            <Container className="w-4 h-4 text-cyan-500" />
            <span>Docker</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition"
              title="Admin Dashboard"
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
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
            <div className="text-left">
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

        {/* Right Mobile / Tablet Toolbar */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Quick Checklist Button on mobile */}
          <button
            onClick={onOpenChecklist}
            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            title="Checklist"
          >
            <CheckSquare className="w-4 h-4" />
          </button>

          {/* User Avatar */}
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover bg-slate-800"
          />

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="Open Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-500" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-xl">
          <div className="pb-3 mb-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{user?.email} • {user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onOpenChecklist();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            >
              <CheckSquare className="w-4 h-4" />
              Checklist
            </button>

            <button
              onClick={() => {
                onOpenApiDocs();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <FileText className="w-4 h-4 text-indigo-500" />
              API Docs
            </button>

            <button
              onClick={() => {
                onOpenDbSchema();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <Database className="w-4 h-4 text-violet-500" />
              DB Schema
            </button>

            <button
              onClick={() => {
                onOpenDockerGuide();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <Container className="w-4 h-4 text-cyan-500" />
              Docker Guide
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
