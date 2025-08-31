# Commands
All selfbot commands

## Discord Related

### `friend`
Generate a friend URI
```
$friend
```

### `purge`
Message purger
```
$purge <num | at> [--shadow]

Example I: $purge 15 # Purges 15 messages and sends a notifiaction when completed
Example II: $purge at --shadow # Purges all messages and doesn't send a notification when completed
```

### `export`
Channel/DM/GDM exporter
```
$export <json | txt> [--shadow]

Example I: $export json # Exports as a JSON file 
Example II: $export txt --shadow # Exports as a text file (shadow works the same way)
```

### `ns`
Nitro sniper
```
$ns <on | off>
Example: $ns on
```

### `wd`
Monitors a channel and logs all messages, including deleted ones and all edits
```
$wd <channel_id> <json | txt> [--stop | --list]

Example I: $wd 1285766975171330130 json
Example II: $wd --list
Example III: $wd 1285766975171330130 --stop
```

### `hypesquad`
Sets your hypesquad house
```
$hypesquad <<brilliance | balance | bravery> | --reset>

Example I: $hypesquad balance
Example II: $hypesquad --reset # Removes your hypesquad
```

### `spam`
Spam a message

```
$spam <amount> <msg>
Example: $spam 5 meow meow meow
```

## Selfbot Related
### `alias`
Aliases
```
$alias [-n] <alias> <text>

Example I: $alias test $ip 1.1.1.1 # $test -> $ip 1.1.1.1 (and runs command)
Example II: $alias meow this is a string # $meow -> this is a string
Example III: $alias -n meow mrrp -> meow (with no prefix) -> mrrp 
```

### `shared`
Manage shared users
```
$shared <add | remove | list> <uid>

Example I: $shared add 1168045766770696193
Example II: $shared list
Example III $shared remove 1168045766770696193
```

### `pre`
Configure on startup options

#### `pre ns`
Toggles the nitro sniper on/off on startup (and curren)
```
$pre ns <on | off>
Example: $pre ns on
```

#### `pre wd`
Configures on startup watchdog
```
$pre wd <list | add | remove | fmt> <chanel_id | <json | txt>>

Example I: $pre wd fmt json # Sets format to json
Example II: $pre wd add 1285766975171330130
Example III $pre wd list
Example IV: $pre wd remove 1285766975171330130 
```

### `ping`
Shows latency of the Discord API and WS heartbeat
```
$ping
```

### `console`
Attaches file containing console output
```
$console
```

### `stop`
Stops Selfcord
```
$stop
```

### `restart`
Rebuilds and restarts Selfcord
```
$restart
```

## Utility Related
### `calc`
Calculator
```
$calc <expression>
Example: $calc 1 + 1
```

### `enc`
Text encoder
```
$enc <b64 | uri | hex> <msg> # b64 = Base64 | uri = encodeURIComponent | hex = hex (duh)

Example I: $enc b64 meow meow
Example II: $enc uri https://scaratek.dev
```

### `dec`
Text decoder
```
$dec <b64 | uri | hex> <msg> # b64 = Base64 | uri = encodeURIComponent | hex = hex (duh)

Example I: $dec b64 bWVvdyBtZW93
Example II: $dec uri https%3A%2F%2Fscaratek.dev
```

## `hash`
Hasher
```
$hash <sha1 | sha256 | md5> <msg>

Example I: $hash sha1 meow
Example II: $hash md5 woaw
```

## `tz`
Timezone converter

```
$tz <tz1> <tz2>
Example: $tz est pst
```

## Network Related

### `dns`
DNS record lookup
```
$dns <type> <target>
Example: $dns A scaratek.dev
```

### `ip`
IP lookup
```
$ip <ip>
Example: $ip 1.1.1.1
```

### `mac`
Lookup a MAC address vendor
```
$mac <mac>
Example: $mac 72:c8:c8:61:19:bf
```

### `rdns`
rDNS lookup
```
$rdns <ip>
Example: $rdns 1.1.1.1
```

### `sds`
Subdomain scanner
```
$sds <domain>
Example: $sds nebulaservices.org
```

## System Related

### `js`
Executes JS code
```
$js <code>

Example: $js return message;
# Message = `Message` object
# Client = `client` object (`src/client.ts`)
# djs = Import of `discord.js-selfbot-v13` (E.g. `new client = djs.Client()`)
# config = `config` object (`src/config.ts`)
# prefix = `prefix` varible (`src/config.ts`)
```

### `sh`
Executes shell cod
```
Example: $sh ls
```

### `sysfetch`
DiY neofetch
```
$neofetch
```

## Other

### `gh`
Scrapes a GitHub account for all unique names and emails
```
$gh <username>
Example: $gh brandonhilkert
```

### `or`
Have chats with AI using OpenRouter
```
or <model> <user prompt> <system prompt>

Example: $or deepseek/deepseek-chat-v3.1:free "hello" "you are a helpful assistant"
# You can also reply to messages the AI replied to to communicate with it
```

### `clyde`
Clyde AI reincarnated
```
$clyde <message> | [--purge] | [--model <model>]

Example I: $clyde wsg # Default model is DeepSeek V3 0324
Example II: $clyde --purge # Wipes Clydes memory in the current channel/DM/GDM
Example III $clyde --model deepseek/deepseek-chat-v3.1:free # Use a different model
# Like or, you can use the same reply system
```