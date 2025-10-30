# ICT Eerbeek - Production Dockerfile
# Multi-stage build for optimized image size

################################################################################
# Stage 1: Build the application
################################################################################
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy patches directory (required by pnpm)
COPY patches ./patches

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application source
COPY . .

# Build the application
RUN pnpm build

################################################################################
# Stage 2: Production runtime
################################################################################
FROM node:22-alpine AS runner

# Install pnpm
RUN npm install -g pnpm

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy patches directory (required by pnpm)
COPY patches ./patches

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/server ./server
COPY --from=builder --chown=nodejs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared
COPY --from=builder --chown=nodejs:nodejs /app/storage ./storage

# Copy public assets
COPY --chown=nodejs:nodejs client/public ./client/public

# Switch to non-root user
USER nodejs

# Expose application port (Cloud Run uses PORT env variable)
EXPOSE 8080
ENV PORT=8080

# Health check
# Health check removed - Cloud Run handles this automatically

# Start the application
CMD ["node", "dist/index.js"]
