# Developing the application

## Install:

- NPM
- MongoDB
- Navigate to project directory within a terminal and run `npm i` to install packages

## Configuration

- Set `DATABASE_URL` within `./.env` to your MonogDB connection string such as `mongodb://USERNAME:PASSWORD@localhost:27017/DATABASE_NAME?authSource=AUTH_DATABASE`
  - Words in all caps must be changed to the application value for your MongoDB instance.

## Run locally

- Run with live updates from your changes: `npm run dev`
