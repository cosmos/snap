# Use the official Node.js image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application code to the working directory
COPY . .

# Build the SvelteKit app using Yarn
RUN yarn build

# Copy the Node.js server file
COPY server.js .

# Expose the port on which your app will run (change it if needed)
EXPOSE 3000

# Set the command to run your app using Node.js
CMD ["node", "server.js"]