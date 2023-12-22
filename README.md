# Soroban Vote DAPP

This project is a simple DAPP that allows users to stream payments to each other. It is built using [Soroban](https://soroban.stellar.org/), [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/).

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