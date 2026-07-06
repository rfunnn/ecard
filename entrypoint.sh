#!/bin/sh
set -e
./node_modules/.bin/prisma db push --accept-data-loss
exec node server.js
