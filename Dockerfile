#---------stage 1: install production dependencies only----------
FROM node:22-alpine AS deps

WORKDIR /app

#copy only package file first

COPY package.json package-lock.json ./

# clean, reproducible install without dev dependencies
RUN npm ci --omit=dev && npm cache clean --force

#----------stage 2: small runtime image---------
FROM node:22-alpine AS runner

#Build-time value,set by Jenkins later (e.g. build number)

ARG APP_VERSION=dev

LABEL org.opencontainers.image.title="calculator-devops" \
      org.opencontainers.image.version="${APP_VERSION}"

ENV NODE_ENV=production \
    PORT=3000 \
    APP_VERSION=${APP_VERSION}

WORKDIR /app

#copy dependencies from deps stage 1 and app source

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public

#Never run as root onside the container

USER node

EXPOSE 3000

#Docker checks this every 30s;container becomes "unhealthy" if it fails 3 times in a row
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries= \
  CMD wget -q0 http://localhost:3000/health || exit 1
  
CMD ["node","src/server.js"]