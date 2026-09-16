# Production image for the NestJS monorepo.
# Runtime config (APP, PORT, secrets) comes from compose / `docker run -e`, not from this file.
#
#   APP=gateway | user-service | notification-service | user-migrate
#   docker run -e APP=gateway -e PORT=3000 -p 3000:3000 roomly-js

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY nest-cli.json tsconfig.json tsconfig.build.json tsconfig.typeorm.json webpack.config.js ./
COPY apps ./apps
COPY libs ./libs
RUN npm run build
# CLI DataSource + migrations (TypeORM JS, used by APP=user-migrate)
RUN npx tsc -p tsconfig.typeorm.json

FROM node:22-alpine AS runner
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-migrate ./dist-migrate
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
