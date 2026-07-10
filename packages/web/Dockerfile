FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/index.ts ./packages/shared/
COPY packages/shared/types ./packages/shared/types
COPY packages/shared/utils ./packages/shared/utils
COPY packages/web/package.json ./
RUN npm install --no-workspaces

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared ./packages/shared
COPY packages/web/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
