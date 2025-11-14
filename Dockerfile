# Use Node.js 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]

