# Use Node.js 20 as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files to install dependencies first (better for caching)
COPY ./backend/package*.json ./

# Install the dependencies
RUN npm install

# Copy the entire backend source files into the container
COPY ./backend/ ./

# Expose the port that the app runs on
EXPOSE 5000

# Start the application
CMD [ "npm", "run", "dev" ]
