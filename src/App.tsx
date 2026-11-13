/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CreateRoomModal } from './components/CreateRoomModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ApiDocsModal } from './components/ApiDocsModal';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { DockerDevOpsGuide } from './components/DockerDevOpsGuide';
import { EvaluationChecklistModal } from './components/EvaluationChecklistModal';

const ResponsiveChatView: React.FC<{ onOpenCreateRoom: () => void }> = ({ onOpenCreateRoom }) => {
  const { activeRoom, setActiveRoom } = useSocket();

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
      {/* Sidebar: Full screen on mobile when no active room, fixed w-80 on desktop */}
      <div
        className={`w-full md:w-80 md:flex-shrink-0 flex-col h-full border-r border-slate-200 dark:border-slate-800 ${
          activeRoom ? 'hidden md:flex' : 'flex'
        }`}
      >
        <Sidebar onOpenCreateRoom={onOpenCreateRoom} />
      </div>

      {/* Chat Area: Full screen on mobile when active room selected, flex-1 on desktop */}
      <div
        className={`flex-1 flex-col h-full min-w-0 ${
          activeRoom ? 'flex' : 'hidden md:flex'
        }`}
      >
        <ChatArea onBackToSidebar={() => setActiveRoom(null)} />
      </div>
    </div>
  );
};

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState<boolean>(false);
  const [isDbSchemaOpen, setIsDbSchemaOpen] = useState<boolean>(false);
  const [isDockerGuideOpen, setIsDockerGuideOpen] = useState<boolean>(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-400">Loading NexusChat Evaluation Suite...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <SocketProvider>
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors">
        <Navbar
          onOpenApiDocs={() => setIsApiDocsOpen(true)}
          onOpenDbSchema={() => setIsDbSchemaOpen(true)}
          onOpenDockerGuide={() => setIsDockerGuideOpen(true)}
          onOpenChecklist={() => setIsChecklistOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        <ResponsiveChatView onOpenCreateRoom={() => setIsCreateRoomOpen(true)} />

        {/* Evaluation & Action Modals */}
        <CreateRoomModal isOpen={isCreateRoomOpen} onClose={() => setIsCreateRoomOpen(false)} />
        <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
        <ApiDocsModal isOpen={isApiDocsOpen} onClose={() => setIsApiDocsOpen(false)} />
        <DatabaseSchemaModal isOpen={isDbSchemaOpen} onClose={() => setIsDbSchemaOpen(false)} />
        <DockerDevOpsGuide isOpen={isDockerGuideOpen} onClose={() => setIsDockerGuideOpen(false)} />
        <EvaluationChecklistModal isOpen={isChecklistOpen} onClose={() => setIsChecklistOpen(false)} />
      </div>
    </SocketProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
