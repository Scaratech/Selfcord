import { Message } from "discord.js-selfbot-v13";
import fs from "fs";
import path from "path";
import { createEmbed, fmtEmbed } from "../../embed.js";

interface MessageData {
    id: string;
    author: string;
    timestamp: number;
    content: string;
}

let content: string;

export async function messageExporter(message: Message, target: string, shadow: boolean = false){
    content = message.content;

    try {
        const dir = path.resolve(process.cwd(), 'exports');

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (!['json', 'txt'].includes(target)) {
            if (!shadow) {
                return message.edit(fmtEmbed(message.content, createEmbed('Exporter - Usage', 'export <json | txt> [--shadow]', '#cdd6f4')));
            }

            return;
        }
        
        if (!shadow) {
            message.edit(fmtEmbed(content, createEmbed('Exporter', `Starting export (${target})`, '#a6e3a1')));
        }

        const all: MessageData[] = [];
        let lastID: string | undefined;
        let fetched: any;

        do {
            const options: any = { limit: 100 };

            if (lastID) {
                options.before = lastID;
            }

            fetched = await message.channel.messages.fetch(options);
            fetched.forEach(m => all.push({ 
                id: m.id, 
                author: `${m.author.username}#${m.author.discriminator}`, 
                timestamp: m.createdTimestamp, 
                content: m.content 
            }));

            lastID = fetched.size > 0 ? fetched.last().id : null;
        } while (fetched.size === 100);

        const time = new Date().toISOString().replace(/[:.]/g, '-');
        
        let channelName: string;
        if ('name' in message.channel && message.channel.name) {
            channelName = message.channel.name;
        } else if ('recipient' in message.channel && message.channel.recipient) {
            channelName = message.channel.recipient.username;
        } else {
            channelName = 'DM';
        }
        
        const filename = `${channelName}-${time}.${target}`;
        const filePath = path.join(dir, filename);

        if (target === 'json') {
            fs.writeFileSync(filePath, JSON.stringify(all, null, 2), 'utf-8');
        } else {
            const lines = all.map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.author}: ${m.content}`);
            fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
        }

        if (!shadow) {
            message.edit(fmtEmbed(content, createEmbed('Exporter', `Exported ${all.length} messages`, '#a6e3a1')));
        }
    } catch (error) {
        console.error('Export error:', error);

        if (!shadow) {
            message.edit(fmtEmbed(content, createEmbed('Exporter - Error', 'Failed to export messages', '#f38ba8')));
        }
    }
}