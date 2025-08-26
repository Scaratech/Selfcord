import { Message } from "discord.js-selfbot-v13";
import { promises as dnsPromises } from "dns";

export async function rdns(message: Message, target: string) {
    if (!target) {
        message.reply("**Usage:** \`rdns <IP>\`");
        return;
    }

    try {
        const hosts = await dnsPromises.reverse(target);

        if (hosts.length === 0) {
            message.reply(`**No PTR records found for**: \`${target}\``);
            return;
        }

        const list = hosts.join(', ');
        message.reply(`**rDNS for** \`${target}\` **is** \`${list}\``);
    } catch (err) {
        message.reply(`**Error performing reverse DNS:** ${err.code || err.message}`);
        console.error(`Reverse DNS error for ${target}:`, err);
    }
}