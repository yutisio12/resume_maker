FROM node:20-alpine AS builder
WORKDIR /app

# pnpm version is pinned in package.json ("packageManager").
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Pages Functions are not available in a plain static container, so
# /verify-turnstile would 404. Keep the gate disabled unless you proxy it.
ARG NEXT_PUBLIC_TURNSTILE_DISABLED=true
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
ENV NEXT_PUBLIC_TURNSTILE_DISABLED=$NEXT_PUBLIC_TURNSTILE_DISABLED
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

RUN pnpm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
