import { Message } from "discord.js-selfbot-v13";

export async function macLookup(message: Message, mac: string) {
    if (!mac) {
        message.reply("**Usage:** `mac <mac>`");
        return;
    }

    try {
        const req = await fetch(`https://www.macvendorlookup.com/api/v2/${mac}`);
        
        if (!req.ok) {
            message.reply(`**Error:** \`${req.statusText}\``);
            console.error(`MAC lookup error: ${req.statusText}`);
            return;
        }

        const res = await req.json();
        const data = Array.isArray(res) ? res[0] : res;

        if (!data) {
            message.reply("**Error:** No MAC address information found");
            return;
        }

        message.reply(`# MAC Info:
- Hex:
  - Start: \`${data.startHex || 'N/A'}\`
  - End: \`${data.endHex || 'N/A'}\`
- Decimal:
  - Start: \`${data.startDec || 'N/A'}\`
  - End: \`${data.endDec || 'N/A'}\`
- Company: \`${data.company || 'N/A'}\`
- Type: \`${data.type || 'N/A'}\`
- Country: \`${data.country || 'N/A'}\`
- Addresses:
  - One: \`${data.addressL1 || 'N/A'}\`
  - Two: \`${data.addressL2 || 'N/A'}\`
  - Three: \`${data.addressL3 || 'N/A'}\``);
    } catch (err) {
        message.reply(`**Error:** \`${err.message}\``);
        console.error(`MAC lookup error: ${err.message}`);
    }
}
