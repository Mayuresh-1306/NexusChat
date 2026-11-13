import React, { useState } from 'react';
import { X, Container, FileCode, CheckCircle2, Copy, Check, Terminal } from 'lucide-react';

interface DockerDevOpsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DockerDevOpsGuide: React.FC<DockerDevOpsGuideProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dockerfileContent = `# 1. Base Node Image
FROM node:20-alpine

# 2. Working Directory
WORKDIR /app

# 3. Install Dependencies
COPY package*.json ./
RUN npm install

# 4. Copy Source Code
COPY . .

# 5. Build Vite React Frontend & TypeScript Server
RUN npm run build

# 6. Expose Port
EXPOSE 3000

# 7. Start Application
CMD ["npm", "run", "dev"]`;

  const dockerComposeContent = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - MONGO_URI=mongodb://mongo:27017/nexus_chat
      - JWT_SECRET=nexus_chat_secure_secret_2026
    depends_on:
      - mongo
    restart: always

  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: always

volumes:
  mongo_data:`;

  const demoCommands = `# 1. Build the Docker Image locally:
docker build -t nexus-chat:latest .

# 2. Run the Docker Container standalone:
docker run -p 3000:3000 nexus-chat:latest

# 3. Run multi-container app + MongoDB using Docker Compose:
docker compose up --build

# 4. Push Image to Docker Hub (for your final deliverables link):
docker tag nexus-chat:latest your-dockerhub-username/nexus-chat:latest
docker push your-dockerhub-username/nexus-chat:latest`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl h-[90vh] sm:h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20 flex-shrink-0">
              <Container className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">Docker & DevOps Viva Guide</h2>
              <p className="text-xs text-slate-500 truncate">How to build, run, and demonstrate Docker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="p-4 bg-cyan-950/30 border border-cyan-500/20 rounded-xl">
            <h3 className="text-xs font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              How to Show Docker to Your Evaluator (Step-by-Step)
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300 mt-2">
              <li>Open your project folder in VS Code to show the physical <code className="text-cyan-400 font-mono">Dockerfile</code> and <code className="text-cyan-400 font-mono">docker-compose.yml</code> in your project root.</li>
              <li>Open your terminal and run <code className="text-cyan-400 font-mono">docker build -t nexus-chat .</code> to demonstrate building the Docker image.</li>
              <li>Run <code className="text-cyan-400 font-mono">docker compose up</code> to show multi-container orchestration (App + MongoDB).</li>
              <li>Show Docker Desktop to demonstrate your running container and image size!</li>
            </ol>
          </div>

          {/* Demo Commands */}
          <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-500" />
                Terminal Commands for Your Presentation
              </h3>
              <button
                onClick={() => handleCopy(demoCommands, 'commands')}
                className="flex items-center gap-1 px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 transition"
              >
                {copiedKey === 'commands' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'commands' ? 'Copied!' : 'Copy Commands'}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto">
              {demoCommands}
            </pre>
          </div>

          {/* Dockerfile */}
          <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-500" />
                Your Physical Dockerfile
              </h3>
              <button
                onClick={() => handleCopy(dockerfileContent, 'dockerfile')}
                className="flex items-center gap-1 px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 transition"
              >
                {copiedKey === 'dockerfile' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'dockerfile' ? 'Copied!' : 'Copy Dockerfile'}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto">
              {dockerfileContent}
            </pre>
          </div>

          {/* Docker Compose */}
          <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-500" />
                Your Physical docker-compose.yml
              </h3>
              <button
                onClick={() => handleCopy(dockerComposeContent, 'compose')}
                className="flex items-center gap-1 px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 transition"
              >
                {copiedKey === 'compose' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'compose' ? 'Copied!' : 'Copy docker-compose.yml'}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto">
              {dockerComposeContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
