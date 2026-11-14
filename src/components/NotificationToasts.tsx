import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, MessageSquare, Hash, X } from 'lucide-react';

export const NotificationToasts: React.FC = () => {
  const { notifications, dismissNotification } = useSocket();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className="pointer-events-auto bg-slate-900/95 dark:bg-slate-900/95 border border-indigo-500/30 text-white rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-right-5 fade-in duration-200 transition"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-indigo-500/20">
            {notif.type === 'message' ? (
              <MessageSquare className="w-4 h-4" />
            ) : notif.type === 'room' ? (
              <Hash className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {notif.title}
              </h4>
              <button
                onClick={() => dismissNotification(notif.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
              {notif.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
