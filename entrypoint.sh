#!/bin/sh
set -e
node node_modules/prisma/build/index.js db push
node prisma/seed.js
exec node server.js
