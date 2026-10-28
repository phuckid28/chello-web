# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.12.2

################################################################################
# Use node image for base image for build stages.
FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

################################################################################
# Create a stage for building the application.
FROM base as build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

COPY . .
ARG VITE_API_ROOT=http://localhost:8017
ENV VITE_API_ROOT=${VITE_API_ROOT}
RUN yarn run build

################################################################################
# Serve static build with Nginx in production
FROM nginx:stable-alpine as final

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
