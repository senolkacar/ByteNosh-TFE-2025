# Use Node.js 20 as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files to install dependencies first (better for caching)
COPY ./frontend/package*.json ./

# Install the dependencies
RUN npm ci && npm cache clean --force

# Copy the entire frontend source files into the container
COPY ./frontend/ ./

ENV NEXT_PUBLIC_ESLINT_IGNORE=true

# Build the Next.js application
RUN npm run build

# Expose the port that the app runs on
EXPOSE 3000

# Start the application
CMD [ "npm", "run", "start" ]