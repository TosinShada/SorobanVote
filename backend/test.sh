#!/bin/bash

set -e

if !(soroban config identity ls | grep token-admin 2>&1 >/dev/null); then
  echo Create the token-admin identity
fi

echo "Done"
