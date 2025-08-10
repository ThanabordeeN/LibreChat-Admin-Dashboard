# admin-dashboard/Dockerfile

# Stage 1: Build the Vue.js application
FROM node:20-alpine AS build-stage
WORKDIR /app
# (Removed unused VITE_ADMIN_USERNAME / VITE_ADMIN_PASSWORD build args)
COPY package*.json ./
COPY . .
# Remove any potentially copied node_modules or package-lock.json from the host and install all dependencies
RUN rm -rf node_modules package-lock.json && npm install
# Build the app
RUN npm run build

# Stage 2: Serve the built application with http-server
FROM node:20-alpine AS production-stage
WORKDIR /app
# Install http-server globally
RUN npm install -g http-server
# Copy the built files from the build stage
COPY --from=build-stage /app/dist ./dist
# Expose the port http-server will use
EXPOSE 8080
# Start the http-server to serve the static files
CMD ["http-server", "./dist", "-p", "8080", "-a", "0.0.0.0", "--cors"]
