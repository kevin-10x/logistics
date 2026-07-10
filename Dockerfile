FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++

FROM base AS shared
WORKDIR /app
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/index.ts ./packages/shared/
COPY packages/shared/types ./packages/shared/types
COPY packages/shared/utils ./packages/shared/utils
RUN cd packages/shared && npm install

FROM base AS api-deps
WORKDIR /app
COPY packages/api/package.json ./
COPY --from=shared /app/packages/shared ./packages/shared
COPY packages/shared/package.json ./packages/shared/
RUN npm install --no-workspaces

FROM base AS api-build
WORKDIR /app
COPY --from=api-deps /app/node_modules ./node_modules
COPY --from=api-deps /app/packages/shared ./packages/shared
COPY packages/api/tsconfig.json ./packages/api/
COPY packages/api/src ./packages/api/src

FROM node:20-alpine AS api-runtime
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=api-deps /app/node_modules ./node_modules
COPY --from=api-deps /app/packages/shared ./packages/shared
COPY packages/api/package.json ./
COPY packages/api/tsconfig.json ./
COPY packages/api/src ./src
EXPOSE 3001
ENV NODE_ENV=production
CMD ["npx", "tsx", "src/index.ts"]
