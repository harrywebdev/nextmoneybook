#!/bin/sh

set -ex

# Wait for the remix program to start up
sleep 10

echo "Checking if remix is running..."

remix_pid=$(supervisorctl -c /nmbapp/supervisor.conf pid remix)
if [ ! -d "/proc/$remix_pid" ]; then
    exit 1
fi

echo "Starting botapp..."

export DEBUG="telegraf:*"

# Start the botapp program
node botapp/start_bot.js
