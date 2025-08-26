export function helpCmd() {
    return `# Available commands:
- \`help\`: Show this help message
- \`purge <num>|at [--shadow]\`: Purge your messages
- \`export <json|txt> [--shadow]\`: Export messages to \`exports/\` folder
- \`ip <ip>\`: Fetch info about an IP
- \`sds <domain>\`: Find subdomains on a domain
- \`sh <command>\`: Execute a shell command
- \`friend\`: Generate a friend invite link
- \`sysfetch\`: Display system information
- \`or <model> "user prompt" "system prompt (optionally)" [--new]\`: Chat with an OpenRouter model (System prompt is optional), [--new] resets conversation history
- \`dns <record_type> <hostname>\`: Fetch DNS records for a hostname
- \`rdns <ip>\`: Perform rDNS lookup given an IP
- \`js <code>\`: Execute JavaScript code (has access to \`client\` and \`message\`)
- \`alias <name> "command"\`: Create a command alias (See docs for more info)
- \`gh <username>\`: Scrape all commits from a GitHub user for all usernames and emails associated

**Selfcord Author**: \`scaratek.dev\` (on Discord)
**Selfbot Repo**: \`https://github.com/scaratech/selfcord\``;
}