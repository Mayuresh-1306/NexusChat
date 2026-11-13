# 1. Base Node Image
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
CMD ["npm", "run", "dev"]
