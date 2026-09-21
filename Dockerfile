# syntax=docker/dockerfile:1

FROM node:26.8.2-alpine3.23 AS base
WORKDIR /workspace
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM dependencies AS build
COPY . .
RUN npm run build

FROM node:26.8.2-alpine3.23 AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=build --chown=nextjs:nodejs /workspace/package.json ./package.json
COPY --from=build --chown=nextjs:nodejs /workspace/package-lock.json ./package-lock.json
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build --chown=nextjs:nodejs /workspace/.next ./.next
USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start"]
