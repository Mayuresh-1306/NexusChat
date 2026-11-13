# 1. Base Node Image
FROM node:20-alpine

# 2. Working Directory
WORKDIR /app

# 3. Install Dependencies
COPY package*.json ./
RUN npm install

# 4. Copy Source Code
COPY . .

# 5. Build Vite React Frontend
RUN npm run build

# 6. Expose Application Port
EXPOSE 3000

# 7. Start Application (Production Server)
CMD ["npm", "start"]
