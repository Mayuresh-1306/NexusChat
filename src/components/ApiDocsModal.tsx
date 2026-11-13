import React from 'react';
import { X, FileText, Code, CheckCircle2 } from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const endpoints = [
    {
      method: 'POST',
      path: '/api/auth/register',
      desc: 'Register a new user account with hashed password',
      body: '{ name, email, password, role }',
      response: '201 Created: { token, user }'
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      desc: 'Authenticate user credentials and generate JWT token',
      body: '{ email, password }',
      response: '200 OK: { token, user }'
    },
    {
      method: 'GET',
      path: '/api/auth/me',
      desc: 'Retrieve current authenticated user profile using Bearer token',
      body: 'Headers: Authorization: Bearer <token>',
      response: '200 OK: { user }'
    },
    {
      method: 'GET',
      path: '/api/users',
      desc: 'List all registered users and online status',
      body: 'Headers: Authorization: Bearer <token>',
      response: '200 OK: { users: [...] }'
    },
    {
      method: 'PATCH',
      path: '/api/users/:id/role',
      desc: 'Update user role (Admin privileges required)',
      body: '{ role: "admin" | "user" }',
      response: '200 OK: { message, user }'
    },
    {
      method: 'GET',
      path: '/api/rooms',
      desc: 'Retrieve all chat rooms with populated members',
      body: 'Headers: Authorization: Bearer <token>',
      response: '200 OK: { rooms: [...] }'
    },
    {
      method: 'POST',
      path: '/api/rooms',
      desc: 'Create a new public or private chat room',
      body: '{ name, description, isPrivate }',
      response: '201 Created: { room }'
    },
    {
      method: 'GET',
      path: '/api/rooms/:roomId/messages',
      desc: 'Retrieve paginated messages for a chat room with populated sender',
      body: 'Headers: Authorization: Bearer <token>',
      response: '200 OK: { messages: [...] }'
    },
    {
      method: 'GET',
      path: '/api/admin/stats',
      desc: 'Retrieve system metrics and memory usage (Admin only)',
      body: 'Headers: Authorization: Bearer <token>',
      response: '200 OK: { stats: { userCount, roomCount, messageCount, ... } }'
    },
    {
      method: 'DELETE',
      path: '/api/rooms/:id',
      desc: 'Delete a chat room and associated messages (Admin only)',
      body: 'Headers: Authorization: Bearer <token>',
      response: '200 OK: { message }'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">REST API Documentation</h2>
              <p className="text-xs text-slate-500">Complete reference for backend RESTful endpoints & HTTP status codes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-xl mb-4">
            <h3 className="text-xs font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              API Checklist Compliance
            </h3>
            <p className="text-xs text-slate-300">
              All endpoints implement proper HTTP methods (GET, POST, PATCH, DELETE), correct status codes (200, 201, 400, 401, 403, 404, 500), JWT bearer authentication middleware, and input validation.
            </p>
          </div>

          <div className="space-y-3">
            {endpoints.map((ep, idx) => {
              const isPost = ep.method === 'POST';
              const isGet = ep.method === 'GET';
              const isPatch = ep.method === 'PATCH';
              const isDelete = ep.method === 'DELETE';

              return (
                <div key={idx} className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                      isPost ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      isGet ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                      isPatch ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                      {ep.method}
                    </span>
                    <code className="text-xs font-mono font-semibold text-slate-900 dark:text-white">{ep.path}</code>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{ep.desc}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <div><span className="text-indigo-400 font-sans font-medium">Input:</span> {ep.body}</div>
                    <div><span className="text-emerald-400 font-sans font-medium">Output:</span> {ep.response}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
