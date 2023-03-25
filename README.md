# THOTH

Thoth is a multishot system builder. It leverages a visual coding style interface to allows game designers and developers to rapidly create powerful natural language systems and prototype games.

### Requirements
- Yarn or npm
- Docker
- Node.js 16 or higher
- [xvfb](https://www.geeksforgeeks.org/how-to-install-xvfb-on-ubuntu/)
- [chromium](https://www.chromium.org/getting-involved/download-chromium/)
- [ffmpeg](https://ffmpeg.org/download.html)

We use Docker to run a local Postgres database. You can skip the docker and install postgres directly, but you are almost always better off just using Docker.
For **Linux** and **MAC** users, **sleep** and **concurently** commands must be installed in the machine.

## Install

First, install dependencies

```
yarn install
OR
npm i
```

## Quickstart

In order to run the client and server use

```
yarn run dev
OR
npm run dev
```
If on Windows run:
```
yarn run dev:windows
```

### Local Development

You will need to modify environment variables by copying .env and renaming it .env.local and then input your api keys. (these files are safe from the .gitignore)

Go to client folder, and create a new file called .env.local -- copy any .env vars you want to set from .env there

Go to server folder, and create a new file called .env.local -- copy any .env vars you want to set from .env there

## Client Setup

1. Clone the repository
1. Navigate to the project root by running `cd thoth`
1. Run `yarn install` to install project dependencies
1. Run `yarn start` to start the @thothai/thoth-client app

## Core Local Setup

1. Core the contents of `core/.env.default` to `core/.env` and modify the secrets as necessary
1. Step 2 in Monorepo Development Setup

## Available Scripts

In the project directory, you can run:

### `yarn run dev`

Runs both server and client.\
Open [https://localhost:3001](https://localhost:3001) to view it in the browser.

### `yarn start`

Runs @thothai/client in the development mode.\
Open [http://localhost:3003](http://localhost:3003) to view it in the browser.

### `yarn build`

Builds the @thothai/thoth-client app for production to the `client/build` folder.

### `yarn build:core`

Builds the @thothai/core package for production to the `core/build` folder.
