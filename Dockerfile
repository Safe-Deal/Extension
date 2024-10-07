# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.14.0
FROM --platform=linux/amd64 node:${NODE_VERSION}-slim as base

WORKDIR /app
ENV NODE_ENV=development

FROM base as build
RUN apt-get update -qq && \
	apt-get install -y build-essential pkg-config python-is-python3 && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* 
COPY package.json yarn.lock ./
RUN yarn install --ignore-scripts --frozen-lockfile
COPY . .
RUN yarn brain:build 

FROM base
COPY --from=build /app /app

ENV NODE_ENV=production
RUN groupadd -r nodejs && useradd -m -r -g nodejs nodejs && chown -R nodejs:nodejs /app
USER nodejs

CMD ["yarn","brain:production"]

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node ./brain/serversHealthCheck.js
