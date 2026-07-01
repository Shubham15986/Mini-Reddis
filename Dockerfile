FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose the web proxy port (Cloud providers will set PORT env var or use 3000 by default)
EXPOSE 3000

# Run both the TCP server and Web Proxy in the background
CMD ["npm", "start"]
