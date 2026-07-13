#!/bin/sh
set -e
node node_modules/prisma/build/index.js db push --accept-data-loss
node prisma/seed.js
exec node server.js
