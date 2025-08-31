import { Message } from "discord.js-selfbot-v13";
import { createEmbed, fmtEmbed } from "../../embed.js";

export async function subdomainScanner(message: Message, target: string) {
    if (!target) {
        message.edit(fmtEmbed(message.content, createEmbed('Usage', 'Usage: sds <domain>', '#cdd6f4')));
        return;
    }

    let msg = await message.edit(fmtEmbed(message.content, createEmbed('Searching', 'Searching...', '#cdd6f4')));

    const url = `https://crt.sh/?q=%25.${target}&output=json`;
    let req: Response;

    try {
        req = await fetch(url);
    } catch (error) {
        console.error('Subdomain fetch error:', error);
        await message.edit(fmtEmbed(message.content, createEmbed('Error', `Failed to fetch subdomains: ${error.message}`, '#f38ba8')));
        await msg.delete();
    }

    if (!req.ok) {
        console.error('Subdomain fetch error:', req.statusText);
        await message.edit(fmtEmbed(message.content, createEmbed('Error', `Failed to fetch subdomains: ${req.statusText}`, '#f38ba8')));
        await msg.delete();

        return;
    }

    const res = await req.json();
    const subdomains = new Set();

    for (const entry of res) {
        const names = entry.name_value.split("\n");

        for (const name of names) {
            if (name.endsWith(target)) {
                subdomains.add(name.trim());
            }
        }
    }

    const final = [...subdomains];

    if (final.length === 0) {
        await message.edit(fmtEmbed(message.content, createEmbed('Error', 'No subdomains found', '#f38ba8')));
        await msg.delete();
        return;
    }

    const lines = final.map(sd => `- ${sd}`);
    const replyContent = `Found subdomains:\n${lines.join("\n")}`;

    await message.edit(fmtEmbed(message.content, createEmbed('Subdomain Scanner', replyContent, '#a6e3a1')));
    await msg.delete();
}
