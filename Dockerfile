# syntax=docker/dockerfile:1.6

### Stage 1: Cài deps
FROM node:20-alpine AS deps
WORKDIR /app
# copy đúng 2 file để cache npm
COPY package*.json ./
RUN npm ci

### Stage 2: Build
FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Nếu bạn dùng biến môi trường cho Vite, đảm bảo chúng có tiền tố VITE_
# ví dụ: ARG VITE_API_URL
# RUN --mount=type=cache,target=/root/.npm \
RUN npm run build

### Stage 3: Serve tĩnh bằng Nginx
FROM nginx:1.27-alpine AS runner
# file cấu hình nginx cho SPA
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# copy artifact
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
