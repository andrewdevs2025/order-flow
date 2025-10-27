FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/adl

# Expose port
EXPOSE 3001

# Set environment to development by default
ENV NODE_ENV=development

# Start the application
CMD ["npm", "run", "dev"]

