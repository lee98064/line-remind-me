FROM node:20-alpine AS base

FROM base AS build
WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install

FROM base AS production

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY . .
RUN yarn prisma generate

CMD ["yarn", "start"]