# Use Official builder Node runtime as a parent image to build the app (STAGE 1)
FROM node:20.14.0 AS builder

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json into working directory
COPY package*.json ./

# Install dependency packages specified in package.json
RUN npm install

# Copy app source into the Docker image
COPY . .

# Build the app
RUN npm run build

# STAGE 2: PRODUCTION
FROM node:20.14.0

# Install ffmpeg in the Docker container
RUN apt-get update && apt-get install -y ffmpeg

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json into working directory
COPY package*.json ./

# Install production only node dependencies
RUN npm install --only=production

# Copy built app from builder stage 
COPY --from=builder /app/dist ./dist

# Make port 3000 avaliable outside this Docker container
EXPOSE 3000

# Defining terminal command to run the app 
CMD [ "npm", "run", "serve" ]