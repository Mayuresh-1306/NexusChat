import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Send, Paperclip, Hash, Lock, Users, Sparkles, Image as ImageIcon, ArrowLeft } from 'lucide-react';

interface ChatAreaProps {
  onBackToSidebar?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onBackToSidebar }) => {
  const { activeRoom, messages, sendMessage, typingUsers, startTyping, stopTyping } = useSocket();
  const { user } = useAuth();
  const [inputText, setInputText] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [showAttachmentInput, setShowAttachmentInput] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (activeRoom && user) {
      startTyping(activeRoom._id);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(activeRoom._id);
      }, 2000);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachmentUrl.trim()) return;

    sendMessage(inputText.trim(), attachmentUrl ? [attachmentUrl] : []);
    setInputText('');
    setAttachmentUrl('');
    setShowAttachmentInput(false);
    if (activeRoom) stopTyping(activeRoom._id);
  };

  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-900/20">
        {onBackToSidebar && (
          <button
            onClick={onBackToSidebar}
            className="md:hidden mb-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Rooms & Users
          </button>
        )}
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 border border-indigo-500/20">
          <Hash className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Room Selected</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          Choose a chat room from the sidebar or create a new one to start messaging in real-time with WebSockets.
        </p>
      </div>
    );
  }

  const currentTyping = typingUsers[activeRoom._id] || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 transition-colors overflow-hidden">
      {/* Chat Room Header */}
      <div className="h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onBackToSidebar && (
            <button
              onClick={onBackToSidebar}
              className="md:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Back to rooms"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
            {activeRoom.isPrivate ? <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> : <Hash className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-1.5 truncate">
              <span className="truncate">{activeRoom.name}</span>
              {activeRoom.isPrivate && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium border border-amber-500/20 flex-shrink-0">
                  Private
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[170px] sm:max-w-md">
              {activeRoom.description || 'Real-time chat room'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 sm:px-3 py-1.5 rounded-xl flex-shrink-0">
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
          <span className="hidden sm:inline">{activeRoom.members?.length || 1} Members</span>
          <span className="sm:hidden">{activeRoom.members?.length || 1}</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No messages yet</p>
            <p className="text-xs text-slate-500 mt-1">Be the first to start the conversation in {activeRoom.name}!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender?._id === user?.id || (msg.sender as any) === user?.id;
            const senderName = msg.sender?.name || 'User';
            const senderAvatar = msg.sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderName}`;

            return (
              <div key={msg._id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <img
                  src={senderAvatar}
                  alt={senderName}
                  className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 object-cover flex-shrink-0"
                />
                <div className={`max-w-[75%]`}>
                  <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{senderName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2">
                        <img
                          src={msg.attachments[0]}
                          alt="Attachment"
                          className="max-h-48 rounded-xl object-cover border border-white/20"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {currentTyping.length > 0 && (
        <div className="px-6 py-1 text-xs text-indigo-400 italic flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40">
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </span>
          {currentTyping.join(', ')} {currentTyping.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Attachment Input Box Popup */}
      {showAttachmentInput && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-indigo-500" />
          <input
            type="url"
            value={attachmentUrl}
            onChange={e => setAttachmentUrl(e.target.value)}
            placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={() => setShowAttachmentInput(false)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowAttachmentInput(!showAttachmentInput)}
          className={`p-2.5 rounded-xl transition ${
            showAttachmentInput
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Add Image Attachment"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={`Message #${activeRoom.name}...`}
          className="flex-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
        />

        <button
          type="submit"
          disabled={!inputText.trim() && !attachmentUrl.trim()}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
