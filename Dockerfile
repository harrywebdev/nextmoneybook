# base node image
FROM node:16-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

# Install supervisor for running multiple processes
RUN apt-get install supervisor -y

# Install pnpm
RUN npm install -g pnpm

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

ADD package.json pnpm-lock.yaml .npmrc ./

# Install Python for node iconv pkg
RUN apt-get install build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev libsqlite3-dev wget libbz2-dev -y
RUN apt-get install python3 -y

RUN pnpm install --production=false

# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD package.json pnpm-lock.yaml .npmrc ./
ADD supervisor.conf ./
RUN pnpm prune --production

# Build the app
FROM base as build

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD prisma .
RUN pnpx prisma generate

ADD . .
RUN pnpm run build

# build the prod base with chromium browser
FROM base as prod-base

WORKDIR /myapp

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# finally, build the production image with minimal footprint
FROM prod-base

ENV DATABASE_URL=file:/data/sqlite.db
ENV PORT="8080"
ENV NODE_ENV="production"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=production-deps /myapp/supervisor.conf /myapp/supervisor.conf

# this doesn't work with PNPM - the actual generated files are in a different location
# e.g. `node_modules/.pnpm/@prisma+client@4.12.0_prisma@4.12.0/node_modules/.prisma`
#COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma

COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/public /myapp/public
COPY --from=build /myapp/package.json /myapp/package.json
COPY --from=build /myapp/start_remix.sh /myapp/start_remix.sh
COPY --from=build /myapp/start_botapp.sh /myapp/start_botapp.sh
COPY --from=build /myapp/prisma /myapp/prisma
COPY --from=build /myapp/botapp /myapp/botapp

# set up storage
COPY --from=build /myapp/storage /myapp/storage
RUN chmod 755 /myapp/storage

ENTRYPOINT supervisord -c /myapp/supervisor.conf
