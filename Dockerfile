# Use Node.js 20
FROM node:20-alpine

# Set working directory to server
WORKDIR /app/server

# Copy package files first (for better caching)
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of server code
COPY server/ ./

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]

