import { Message } from "discord.js-selfbot-v13";
import { createEmbed, fmtEmbed } from "../../embed.js";

export async function macLookup(message: Message, mac: string) {
    if (!mac) {
        message.reply(fmtEmbed(message.content, createEmbed('Usage', 'Usage: mac <mac>', '#cdd6f4')));
        return;
    }

    try {
        const req = await fetch(`https://www.macvendorlookup.com/api/v2/${mac}`);

        if (!req.ok) {
            message.edit(fmtEmbed(message.content, createEmbed('Error', `Error: \`${req.statusText}\``, '#f38ba8')));
            console.error(`MAC lookup error: ${req.statusText}`);
            return;
        }

        const res = await req.json();
        const data = Array.isArray(res) ? res[0] : res;

        if (!data) {
            message.edit(fmtEmbed(message.content, createEmbed('Error', 'No MAC address information found', '#f38ba8')));
            return;
        }

        const content = `
Start: ${data.startHex || 'N/A'}
Hex End: ${data.endHex || 'N/A'}
Decimal Start: ${data.startDec || 'N/A'}
Decimal End: ${data.endDec || 'N/A'}
Company: ${data.company || 'N/A'}
Type: ${data.type || 'N/A'}
Country: ${data.country || 'N/A'}
Address one: ${data.addressL1 || 'N/A'}
Address two: ${data.addressL2 || 'N/A'}
Address three: ${data.addressL3 || 'N/A'}
        `;

        message.edit(fmtEmbed(message.content, createEmbed('MAC Info', content, '#a6e3a1')));
    } catch (err) {
        message.reply(`**Error:** \`${err.message}\``);
        console.error(`MAC lookup error: ${err.message}`);
    }
}
