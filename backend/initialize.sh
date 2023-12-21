#!/bin/bash

set -e

if [[ -f "./.soroban-vote-dapp/vote_id" ]]; then
  echo "Found existing './.soroban-vote-dapp' directory; already initialized."
  exit 0
fi

SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
SOROBAN_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
FRIENDBOT_URL="https://friendbot.stellar.org/"
NETWORK="Testnet"

echo "Using $NETWORK network"
echo "  RPC URL: $SOROBAN_RPC_URL"
echo "  Friendbot URL: $FRIENDBOT_URL"

echo Add the $NETWORK network to cli client
soroban config network add \
  --rpc-url "$SOROBAN_RPC_URL" \
  --network-passphrase "$SOROBAN_NETWORK_PASSPHRASE" "$NETWORK"

echo Add $NETWORK to .soroban-vote-dapp for use with npm scripts
mkdir -p .soroban-vote-dapp
echo $NETWORK > ./.soroban-vote-dapp/network
echo $SOROBAN_RPC_URL > ./.soroban-vote-dapp/rpc-url
echo "$SOROBAN_NETWORK_PASSPHRASE" > ./.soroban-vote-dapp/passphrase
echo "{ \"network\": \"$NETWORK\", \"rpcUrl\": \"$SOROBAN_RPC_URL\", \"networkPassphrase\": \"$SOROBAN_NETWORK_PASSPHRASE\" }" > ./shared/config.json

if !(soroban config identity ls | grep token-admin 2>&1 >/dev/null); then
  echo Create the token-admin identity
  soroban config identity generate token-admin
fi
ADMIN_ADDRESS="$(soroban config identity address token-admin)"

echo $ADMIN_ADDRESS > ./.soroban-vote-dapp/admin-address

# This will fail if the account already exists, but it'll still be fine.
echo Fund token-admin account from friendbot
curl --silent -X POST "$FRIENDBOT_URL?addr=$ADMIN_ADDRESS" >/dev/null

ARGS="--network $NETWORK --source token-admin"

echo Build contracts
make build

echo Deploy the voting contract
VOTE_ID="$(
  soroban contract deploy $ARGS \
    --wasm target/wasm32-unknown-unknown/release/soroban_vote_contract.wasm
)"
echo "Contract deployed succesfully with ID: $VOTE_ID"
echo -n "$VOTE_ID" > .soroban-vote-dapp/vote_id

echo "Initialize the voting contract"
soroban contract invoke \
  $ARGS \
  --id "$VOTE_ID" \
  -- \
  initialize

echo "Done"
