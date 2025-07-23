# Use a stable Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the project files
COPY . .

# Build the Next.js app
RUN npm run build

# Expose default port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
