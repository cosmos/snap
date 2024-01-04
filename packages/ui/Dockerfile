# Use the official Node.js 18 image as a parent image
FROM node:18

ARG VITE_SNAP_VERSION
ENV VITE_SNAP_VERSION=0.1.17
ARG VITE_RHINO_API_KEY
ENV VITE_RHINO_API_KEY=${VITE_RHINO_API_KEY}
ARG VITE_NUMIA_API_KEY
ENV VITE_NUMIA_API_KEY=${VITE_NUMIA_API_KEY}
ARG VITE_DENO_SERVERLESS_URL
ENV VITE_DENO_SERVERLESS_URL=https://api.mysticlabs.xyz

# Change to the UI package directory
WORKDIR /app/packages/ui

# Copy the entire monorepo to the container
COPY . .

# Install the dependencies using Yarn
RUN yarn install

# Install PM2 globally
RUN npm i --global pm2

# Build the SvelteKit app
RUN yarn run build

# Set the environment to production
ENV NODE_ENV=production

# Expose the port that the app will run on
EXPOSE 5000

# Set the command to run the app using PM2 when the container starts
CMD ["npm", "run", "start"]