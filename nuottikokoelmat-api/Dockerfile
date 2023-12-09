ARG BUILD_IMAGE=node:19.2.0
ARG RUN_IMAGE=node:19.2.0-slim



FROM $BUILD_IMAGE AS build-env
COPY . /app
WORKDIR /app

RUN npm ci && npm run build
FROM $BUILD_IMAGE AS deps-env
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM $RUN_IMAGE AS run-env

# also used as an environment variable in the app
ARG FASTIFY_PORT 
ENV FASTIFY_PORT=$FASTIFY_PORT

WORKDIR /usr/app
COPY --from=deps-env /node_modules ./node_modules
COPY --from=build-env /app/build ./build
COPY package.json ./

ENV NODE_ENV="production"
EXPOSE $FASTIFY_PORT

CMD ["build/index.js"]