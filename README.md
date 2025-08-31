# Selfcord
FOSS utility-focused Discord selfbot
> [!WARNING]
> Selfbots are against Discords ToS!! I am in no way responsible if your account gets terminated.

## Features
- Message purger
- DM/Channel exporter
- Network lookup related commands
- A nitro sniper
- AI chatbot via OpenRouter
- And more!

## `.env` -> `config.json`
If you have Selfcord in the past, you know it used a `.env` file for configuration, I have replaced this with a JSON-based config instead. While there is still `.env` support, I will not continue to add `.env` support, see `config.example.jsonc` for an example config.

## Setup
### Building
- Requirements: git, NodeJS (Newer versions, above v18), npm/pnpm
```sh
$ git clone https://github.com/scaratech/selfcord
$ cd selfcord
$ pnpm i # or npm i
$ pnpm build # or npm run build
```
### Configuration
- See `config.example.jsonc` (Make sure your config file is `config.json`)

### Start It
```sh
$ pnpm start # or npm start
```

## Commands
See [here](./DOCS.md)