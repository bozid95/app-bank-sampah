FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY . .

ARG ALLOWED_DOMAINS=localhost,127.0.0.1
ENV ALLOWED_DOMAINS=${ALLOWED_DOMAINS}
ENV ASTRO_ADAPTER=node
ENV NODE_ENV=production

RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 4321

CMD ["sh", "-c", "npx prisma migrate deploy && node ./dist/server/entry.mjs"]

