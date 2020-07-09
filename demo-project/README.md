# demo-project

Monorepo setup containing an application, library, theme-library and server.

## Getting started

Install and link dependencies with Yarn
```
yarn
```

Copy the example env file
```
cp packages/server/.env.example packages/server/.env
```

Create a [GitHub personal access token](https://github.com/settings/tokens/new) (read-only / no scopes required).  
Add your GitHub user and token to `packages/server/.env`

## Development
Run `yarn start` to serve and open the application in the browser

## Building
Run `yarn build` to build the app with all dependencies

## Deployment
Run `yarn serve-prod` to host a local webserver with the built application
