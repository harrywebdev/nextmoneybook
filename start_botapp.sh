#!/bin/sh

# Wait for the remix program to start up
sleep 10

remix_pid=$(supervisorctl -c /myapp/supervisor.conf pid remix)
if [ ! -d "/proc/$remix_pid" ]; then
    exit 1
fi

# Start the botapp program
pnpm prod:bot:start

