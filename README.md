# Selfcord
FOSS utility-focused Discord selfbot
> [!WARNING]
> Selfbots are against Discords ToS!! I am in no way responsible if your account gets terminated.

## Setup
### Building
# Requirements: git, NodeJS, npm/pnpm
```sh
$ git clone https://github.com/scaratech/selfcord
$ cd selfcord
$ pnpm i # or npm i
$ pnpm build # or npm run build
```
### `.env file`
- See `.env.example`

### Start It
```sh
$ pnpm start # or npm start
```

## Commands
### `help`
Displays a help message

### `purge <(num)|at> [--shadow]`
Purges all messages sent by you in the current channel/DM you are in
- `at` = Alltime
 - `--shadow` = Do not send messages relating to the deletion of messages and deletes the command

Examples:
- `$sc purge 15`
- `$sc purge at --shadow`

### `export <json|txt> [--shadow]`
Exports all messages in the current channel you are in to `exports/` with a specified file type. Shadow works the same.

Examples:
- `$sc export json`
- `$sc export txt --shadow`

### `ip <ip>`
Uses http://ip-api.com/ to retrieve information about an IP

Example:
- `$sc ip 1.1.1.1`

### `sds <domain>`
Scans a domain for subdomains using https://crt.sh/

Example:
- `$sc sds nebulaservices.org`

### `sh <command>`
Executes a command in your shell

Examples:
- `$sc sh sudo whoami`
- `$sc sh ls`


### `friend`
Generates a friend URL

Example:
- `$sc friend`

### `sysfetch`
Returns a neofetch-like thing

Example:
- `$sc sysfetch`

### `or <model> <user_prompt> <?system_prompt>`
Allows you to chat with a model on https://openrouter.ai/ given a model, prompt, and optionally, system prompt

Examples:
- `$sc or openai/gpt-oss-20b:free "what is 1 + 1"`
- `$sc or openai/gpt-oss-20b:free "what is 2 * 2" "you are a helpful assistant that mainly works with math"`
