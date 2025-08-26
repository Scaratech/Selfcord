import { Message } from "discord.js-selfbot-v13";

export async function sds(message: Message, target: string) {
    if (!target) {
        message.reply("**Usage:** \`$sc sds <domain>\`");
        return;
    }
    await message.reply('**Searching...**');

    const url = `https://crt.sh/?q=%25.${target}&output=json`;
    let req: Response;
    try {
        req = await fetch(url);
    } catch (error) {
        console.error('Subdomain fetch error:', error);
        await message.reply(`**Failed to fetch subdomains**: ${error.message}`);
    }

    if (!req.ok) {
        console.error('Subdomain fetch error:', req.statusText);
        await message.reply(`**Failed to fetch subdomains**: ${req.statusText}`);

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
        await message.reply('**No subdomains found**');
        return;
    }

    const lines = final.map(sd => `- ${sd}`);
    const replyContent = `**Found subdomains**:\n${lines.join("\n")}`;

    await message.reply(replyContent);
}
