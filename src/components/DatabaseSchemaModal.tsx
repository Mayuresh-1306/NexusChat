import React from 'react';
import { X, Database, CheckCircle2, Link2, Key } from 'lucide-react';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const schemas = [
    {
      name: 'User Model (Mongoose)',
      desc: 'Stores registered user profiles, hashed passwords, roles, and online presence status.',
      fields: [
        { field: 'name', type: 'String', req: 'Required', desc: 'User full name (trimmed)' },
        { field: 'email', type: 'String', req: 'Required, Unique', desc: 'Lowercase user email' },
        { field: 'password', type: 'String', req: 'Required, Select: false', desc: 'Bcrypt hashed password' },
        { field: 'role', type: 'String', req: 'Enum [user, admin]', desc: 'Default: user' },
        { field: 'avatar', type: 'String', req: 'Optional', desc: 'DiceBear SVG or image URL' },
        { field: 'status', type: 'String', req: 'Enum [online, offline]', desc: 'Socket presence status' },
        { field: 'createdAt', type: 'Date', req: 'Default: Date.now', desc: 'Registration timestamp' }
      ]
    },
    {
      name: 'ChatRoom Model (Mongoose)',
      desc: 'Stores public and private chat rooms, member references, and creator details.',
      fields: [
        { field: 'name', type: 'String', req: 'Required', desc: 'Room title (trimmed)' },
        { field: 'description', type: 'String', req: 'Optional', desc: 'Room purpose description' },
        { field: 'isPrivate', type: 'Boolean', req: 'Default: false', desc: 'Restricts member access' },
        { field: 'members', type: 'Array of ObjectId', req: 'Ref: User', desc: 'Relationship linking User documents' },
        { field: 'createdBy', type: 'ObjectId', req: 'Ref: User, Required', desc: 'Room creator reference' },
        { field: 'createdAt', type: 'Date', req: 'Default: Date.now', desc: 'Creation timestamp' }
      ]
    },
    {
      name: 'Message Model (Mongoose)',
      desc: 'Stores chat messages, room references, sender references, attachments, and read receipts.',
      fields: [
        { field: 'room', type: 'ObjectId', req: 'Ref: ChatRoom, Required', desc: 'Parent room reference' },
        { field: 'sender', type: 'ObjectId', req: 'Ref: User, Required', desc: 'Sender user reference' },
        { field: 'content', type: 'String', req: 'Required', desc: 'Message text content' },
        { field: 'attachments', type: 'Array of String', req: 'Optional', desc: 'Image attachment URLs' },
        { field: 'readBy', type: 'Array of ObjectId', req: 'Ref: User', desc: 'Read receipt tracking' },
        { field: 'createdAt', type: 'Date', req: 'Default: Date.now', desc: 'Message timestamp' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">MongoDB & Mongoose Schemas</h2>
              <p className="text-xs text-slate-500">Database schema designs, validation rules, and document relationships</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="p-4 bg-violet-950/30 border border-violet-500/20 rounded-xl">
            <h3 className="text-xs font-semibold text-violet-300 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Mongoose Implementation Checklist
            </h3>
            <p className="text-xs text-slate-300">
              Mongoose schemas enforce strict data validation, uniqueness constraints, automated timestamps, and relational population (`.populate('members')`, `.populate('sender')`) to link User, ChatRoom, and Message documents.
            </p>
          </div>

          <div className="space-y-6">
            {schemas.map((sch, idx) => (
              <div key={idx} className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-violet-500" />
                    {sch.name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    Mongoose Model
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{sch.desc}</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                        <th className="pb-2 font-semibold">Field</th>
                        <th className="pb-2 font-semibold">Type</th>
                        <th className="pb-2 font-semibold">Validation / Constraints</th>
                        <th className="pb-2 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-slate-700 dark:text-slate-300">
                      {sch.fields.map((f, fIdx) => (
                        <tr key={fIdx}>
                          <td className="py-2 font-mono font-semibold text-indigo-600 dark:text-indigo-400">{f.field}</td>
                          <td className="py-2 font-mono text-slate-500">{f.type}</td>
                          <td className="py-2 text-amber-600 dark:text-amber-400">{f.req}</td>
                          <td className="py-2 text-slate-500 dark:text-slate-400">{f.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
