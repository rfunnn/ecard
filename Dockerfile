########################################################################
# Stage 1 — deps
# Install all node_modules including native C++ addons.
# The mariadb package requires python3/make/g++ to compile its bindings.
########################################################################
FROM node:20-alpine AS deps

RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

########################################################################
# Stage 2 — migrator
# Lightweight image used only to run `prisma db push`.
# The docker-compose migrate service uses this stage.
########################################################################
FROM node:20-alpine AS migrator

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY package.json ./

# Pre-generate the Prisma client so the CLI works offline
# DATABASE_URL is required by prisma.config.ts even during generate (no DB connection is made)
RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate

ENTRYPOINT ["npx", "prisma", "db", "push"]

########################################################################
# Stage 3 — builder
# Compile the Next.js application (output: standalone).
########################################################################
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client matching the installed engine
# DATABASE_URL is required by prisma.config.ts even during generate (no DB connection is made)
RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

# STORAGE_PUBLIC_URL may be evaluated at build time by next.config.ts
# to add the MinIO hostname to image remotePatterns. Pass it as a build arg.
ARG STORAGE_PUBLIC_URL
ENV STORAGE_PUBLIC_URL=$STORAGE_PUBLIC_URL

# Inline dummy env vars so module-level validation passes without persisting
# values in the image layers. Runner stage starts fresh — real values come
# from docker-compose at runtime.
RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" \
    NEXTAUTH_SECRET="build-time-dummy" \
    NEXTAUTH_URL="http://localhost:3000" \
    STORAGE_ENDPOINT="http://localhost:9000" \
    STORAGE_ACCESS_KEY="dummy" \
    STORAGE_SECRET_KEY="dummy" \
    STORAGE_BUCKET="ecard" \
    TOYYIBPAY_SECRET_KEY="dummy" \
    TOYYIBPAY_CATEGORY_CODE="dummy" \
    npm run build

########################################################################
# Stage 4 — runner
# Minimal production image using the standalone server output.
# Final image size is typically 300-400 MB.
########################################################################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Static public files (uploads dir excluded via .dockerignore)
COPY --from=builder /app/public ./public

# Standalone server bundle — includes only the required server-side node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static

# Prisma CLI and schema for running migrations on startup
COPY --from=deps /app/node_modules/prisma      ./node_modules/prisma
COPY --from=deps /app/node_modules/@prisma     ./node_modules/@prisma
COPY prisma/schema.prisma                      ./prisma/schema.prisma
COPY prisma.config.ts                          ./
COPY package.json                              ./
COPY --chmod=755 entrypoint.sh                 ./

USER nextjs

EXPOSE 3000

# Built-in health check — Docker will mark the container unhealthy if the
# app fails to respond. Requires /api/health to return 200.
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["./entrypoint.sh"]
