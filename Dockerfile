# base node image
FROM node:16-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3 git

# Install Python for node iconv pkg
RUN apt-get install build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev libsqlite3-dev wget libbz2-dev -y
RUN apt-get install python3 -y

# Install supervisor for running multiple processes
RUN apt-get install supervisor -y

# Install pnpm
RUN npm install -g pnpm

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

ADD package.json pnpm-lock.yaml .npmrc ./
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

# Finally, build the production image with minimal footprint
FROM base

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
COPY --from=build /myapp/start.sh /myapp/start.sh
COPY --from=build /myapp/prisma /myapp/prisma

ENTRYPOINT supervisord -c /myapp/supervisor.conf
