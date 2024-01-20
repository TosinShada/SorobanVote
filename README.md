# Soroban Vote DAPP

This is a Soroban Smart Contract project showing how to create a proposal and have other people vote on the proposal. It is built using [Soroban](https://soroban.stellar.org/), [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/).

## Overview
The project contains a Soroban Smart Contract and a frontend project. The Soroban Smart Contract project contains the smart contract required to mmanage the proposals and keep track of the votes for and against them. It is deployed on the Stellar Soroban Network. The frontend project contains the frontend code that interacts with the smart contract. It showcases how to create a proposal and have other people vote on the proposal. 

You can check out the blog post for this project [here](https://dev.to/shada/soroban-series-3-building-a-soroban-voting-contract-5638) as well as a video tutorial explaining the project [here](https://www.youtube.com/watch?v=FsD_Zx0y6tU).

### Demo
You can check out the demo of the project [here](https://soroban-vote.vercel.app/).

## Installation

Use yarn to install dependecies.

```bash
yarn
```

### Backend
Follow the steps below to set up the backend. 

```bash
cd backend
```

#### Run the Soroban Vote backend
-----------

Make sure to start from a clean setup:
```bash
yarn clean
```

##### Deploy on Testnet

0. Make sure you have soroban-cli installed, as explained above

1. Deploy the contracts and initialize them

       yarn setup

   This runs `./initialize.sh` behind the scenes, which will create a `token-admin` identity for you (`soroban config identity create token-admin`) and deploy the [vote contract](./contracts/vote), with this account as admin.

2. Select the Futurenet network in your Freighter browser extension

### Soroban Vote Frontend
Follow the steps beloww to setup and run the frontend for the Soroban Vote DAPP
```bash
cd frontend
```

#### Run the Soroban Vote frontend
You need to have deployed the smart contracts first. See above for more details
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Base structure
The project contains backend and frontend workspaces, together with packages, that can be used to extract some logic there.
```bash
backend/
frontend/
packages/
     .../
     .../
```

## License
[MIT](https://choosealicense.com/licenses/mit/)