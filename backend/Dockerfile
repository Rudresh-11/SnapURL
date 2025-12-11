# STEP 1: Base Image
FROM node:18-alpine

# STEP 2: Create app directory
WORKDIR /app

# STEP 3: Copy package files
COPY package*.json ./

# STEP 4: Install only production dependencies
RUN npm install

# STEP 5: Copy source code
COPY . .

# STEP 6: Expose port
EXPOSE 5000

# STEP 7: Start the server
CMD ["npm", "start",]
