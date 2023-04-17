# base node image
FROM node:16-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

RUN apt-get update && apt-get upgrade

# Install openssl for Prisma
RUN apt-get install -yq openssl sqlite3

# Install supervisor for running multiple processes
RUN apt-get install supervisor -y

# Install Python for node iconv pkg
RUN apt-get install build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev libsqlite3-dev wget libbz2-dev -y
RUN apt-get install python3 -y

# Install PPTR dependencies
RUN apt-get install -y ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

# Install pnpm
RUN npm install -g pnpm

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

FROM base as builder

WORKDIR /nmbapp

RUN chown node:node ./
USER node

COPY --chown=node:node package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --production=false

COPY --chown=node:node app ./app
COPY --chown=node:node botapp ./botapp
COPY --chown=node:node cypress ./cypress
COPY --chown=node:node mocks ./mocks
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node public ./public
COPY --chown=node:node test ./test
COPY --chown=node:node .eslintrc.js ./.eslintrc.js
COPY --chown=node:node cypress.config.ts ./cypress.config.ts
COPY --chown=node:node remix.config.js ./remix.config.js
COPY --chown=node:node remix.env.d.ts ./remix.env.d.ts
COPY --chown=node:node tailwind.config.ts ./tailwind.config.ts
COPY --chown=node:node tsconfig.json ./tsconfig.json
COPY --chown=node:node vitest.config.ts ./vitest.config.ts

RUN pnpm exec prisma generate
RUN pnpm run build

FROM base as release

WORKDIR /nmbapp

RUN chown node:node ./
USER node

COPY --chown=node:node --from=builder /nmbapp/botapp /nmbapp/botapp
COPY --chown=node:node --from=builder /nmbapp/build /nmbapp/build

COPY --chown=node:node prisma ./prisma
COPY --chown=node:node public ./public

# install prod deps
COPY --chown=node:node package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod

COPY --chown=node:node start_remix.sh ./start_remix.sh
COPY --chown=node:node start_botapp.sh ./start_botapp.sh
COPY --chown=node:node supervisor.conf ./supervisor.conf

ENV DATABASE_URL=file:/data/sqlite.db
ENV PORT="8080"
ENV NODE_ENV="production"

# TODO: remove all unnecessary installed changes

ENTRYPOINT supervisord -c /nmbapp/supervisor.conf
