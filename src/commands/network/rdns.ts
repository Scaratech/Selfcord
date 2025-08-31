import { Message } from "discord.js-selfbot-v13";
import { promises as dnsPromises } from "dns";
import { createEmbed, fmtEmbed } from "../../embed.js";

export async function rdnsLookup(message: Message, target: string) {
    if (!target) {
        message.edit(fmtEmbed(message.content, createEmbed('Usage', 'Usage: rdns <ip>', '#cdd6f4')));
        return;
    }

    try {
        const hosts = await dnsPromises.reverse(target);

        if (hosts.length === 0) {
            message.edit(fmtEmbed(message.content, createEmbed('Error', `No PTR records found for: ${target}`, '#f38ba8')));
            return;
        }

        const list = hosts.join(', ');
        message.edit(fmtEmbed(message.content, createEmbed('rDNS Lookup', `rDNS for ${target} is ${list}`, '#a6e3a1')));
    } catch (err) {
        message.edit(fmtEmbed(message.content, createEmbed('Error', `Error performing reverse DNS: ${err.code || err.message}`, '#f38ba8')));
        console.error(`Reverse DNS error for ${target}:`, err);
    }
}