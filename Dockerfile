# syntax=docker/dockerfile:1
# The site is static: Node builds it, then a bare Caddy serves the files.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY index.html tsconfig.json vite.config.ts ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM caddy:2-alpine
# Caddy keeps nothing worth saving here (no certificates, no admin API), so
# its data and config folders go to /tmp and it can run as nobody.
ENV XDG_CONFIG_HOME=/tmp XDG_DATA_HOME=/tmp
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
USER nobody
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD ["wget", "-qO-", "http://127.0.0.1:3000/healthz"]
