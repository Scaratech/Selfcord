export function helpCmd() {
    return `\`\`\`# Available commands:
## System-related
- sh <command>
    - Execute a shell command
- js <code>
    - Execute JavaScript code 
    - Has access to \`client\` and \`message\`
- sysfetch
    - Display system information

## Network-related
- dns <record_type> <hostname>
    - Fetch DNS records for a hostname
- ip <ip>
    - Fetch info about an IP
- sds <domain>
    - Find subdomains on a domain
- rdns <ip>
    - Perform rDNS lookup given an IP

## Utilities
- help
    - Show this help message
- alias [-n] <name> "command"
    - Create a command alias (See docs for more info)
- purge <num>|at [--shadow]
    - Purge your messages
- export <json|txt> [--shadow]
    - Export messages to \`exports/\` folder
- friend
    - Generate a friend invite link
- ns <on|off>
    - Toggle nitro sniper on or off

## Other
- gh <username>
    - Scrape all commits from a GitHub user for all usernames and emails associated
- or <model> "user prompt" "system prompt (optionally)" [--new]
    - Chat with an OpenRouter model (System prompt is optional), \`--new\` resets conversation history

## Credit
Selfcord Author: \`scaratek.dev\` (on Discord)
Selfcord Repo: https://github.com/scaratech/selfcord
\`\`\``;
}
