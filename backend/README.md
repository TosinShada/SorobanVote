Soroban Vote Backend
=================================

This is a Soroban Smart Contract project showing how to create a proposal and have other people vote on the proposal. It is built using [Soroban](https://soroban.stellar.org/), [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/).

Getting Started
===============

Install Dependencies
--------------------
1. `rustc` >= 1.71.0 with the `wasm32-unknown-unknown` target installed. See https://soroban.stellar.org/docs/getting-started/setup#install-rust . If you have already a lower version, the easiest way to upgrade is to uninstall (`rustup self uninstall`) and install it again.
2. `soroban-cli`. See https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli, but instead of `cargo install soroban-cli`, run `cargo install_soroban`. This is an alias set up in [.cargo/config.toml](./.cargo/config.toml), which pins the local soroban-cli to a specific version. If you add `./target/bin/` [to your PATH](https://linuxize.com/post/how-to-add-directory-to-path-in-linux/), then you'll automatically use this version of `soroban-cli` when you're in this directory.

## Run the Soroban Vote backend
-----------

Make sure to start from a clean setup:
```
yarn clean
```

### Deploy on Testnet

0. Make sure you have soroban-cli installed, as explained above

1. Deploy the contracts and initialize them

       yarn setup

   This runs `./initialize.sh` behind the scenes, which will create a `token-admin` identity for you (`soroban config identity create token-admin`) and deploy the [vote contract](./contracts/vote), with this account as admin.

2. Select the Testnet network in your Freighter browser extension