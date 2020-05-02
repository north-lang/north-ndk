#!/usr/bin/env bash

maxBytes=300000

if [ $(wc -c < dist/north.js) -gt ${maxBytes} ]; then
  echo 'Error: bundle too large!'
  exit 1
fi
