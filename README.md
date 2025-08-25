# Selfcord
FOSS utility-focused Discord selfbot
> [!WARNING]
> Selfbots are against Discords ToS!! I am in no way responsible if your account gets terminated.

## Features
- [X] Message Purger
- [X] Exporter
- [X] IP Lookup
- [X] Subdomain Scanner

## Setup
### Building
```sh
$ git clone https://github.com/scaratech/selfcord
$ cd selfcord
$ pnpm i
$ pnpm build
```
### `.env`
Make a file called `.env` and enter:
```
TOKEN=YOUR_DISCORD_TOKEN
PREFIX=$sc
```
### Start It
```sh
$ pnpm start
```
