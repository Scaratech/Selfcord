# Selfcord
FOSS utility-focused Discord selfbot
> [!WARNING]
> Selfbots are against Discords ToS!! I am in no way responsible if your account gets terminated.

## Setup
### Building
- Requirements: git, NodeJS, npm/pnpm
```sh
$ git clone https://github.com/scaratech/selfcord
$ cd selfcord
$ pnpm i # or npm i
$ pnpm build # or npm run build
```
### `.env` file
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

### `or <model> "user prompt" "system prompt (optionally) [--new]"`
Allows you to chat with a model on https://openrouter.ai/ given a model, prompt, and optionally, system prompt. If `--new` is present, conversation history will be deleted.

Conversations are stored in `conversations`/\
You (or shared users) can reply to AI responses, and their reply will be treated as a prompt, for example:
```
User 1 runs: $or mistralai/mistral-small-3.2-24b-instruct:free "meow" "you are a catgirl"
User 2 replys to user 1s message with: "meow"
"meow" will be sent to the AI, and the response is replied to user 2s message
```

Examples:
- `$sc or openai/gpt-oss-20b:free "what is 1 + 1"`
- `$sc or openai/gpt-oss-20b:free "what is 2 * 2" "you are a helpful assistant that mainly works with math"`

## `dns <record_type> <hostname>`
Returns records for `hostname` given `record_type`

Examples:
- `$sc dns A scaratek.dev`

## `rdns <ip>`
Performs an rDNS lookup given an IP

Examples:
- `$sc rdns 1.1.1.1`

## `js <code>`
Executes JS code and returns the result, has access to `message` and `client`

Examples:
- `$sc js return client.user.email`
- `$sc js console.log(client)`

## `alias <name> "command"`
Creates an alias

Examples:
- `$sc alias a meow`
    - Running `$sc a` will edit the message to contain `$meow`
- `$sc alias b $sc ip 1.1.1.1`
    - Running `$sc b` will edit the message to contain `$sc ip 1.1.1.1` and then execute the command

## `$gh <username>`
Scrapes a GitHub user for all associated emails and names, also logs all results to `github/`

Examples:
- `$sc gh brandonhilkert`