import dotenv from "dotenv";
import { Client } from "discord.js-selfbot-v13";
import fs from "fs";
import path from "path";

dotenv.config();

const token = process.env.TOKEN;
const prefix = process.env.PREFIX || '$sc';
const client = new Client();

function format(msg) {
    const prefix = "**[[SC]](https://github.com/scaratech/selfcord)** -";
    return `${prefix} ${msg}`;
}

async function purgeMessages(message, target, shadow = false) {
    try {
        if (target === 'at') {
            let fetched;

            do {
                fetched = await message.channel.messages.fetch({ limit: 100 });
                const myMessages = fetched.filter(
                    m => m.author.id === client.user.id && !m.system && !m.pinned
                );

                for (const msg of myMessages.values()) {
                    msg.delete().catch(() => { });
                }
            } while (fetched.size === 100);

            if (!shadow) await message.channel.send(format('Purged all messages'));
        } else if (!isNaN(parseInt(target))) {
            const num = parseInt(target);
            const fetched = await message.channel.messages.fetch({ limit: num + 1 });
            const myMsgs = fetched.filter(
                m => m.author.id === client.user.id && !m.system && !m.pinned
            ).first(num);

            for (const msg of myMsgs) {
                msg.delete().catch(() => { });
            }

            if (!shadow) await message.channel.send(format(`Purged ${myMsgs.length} messages`));
        } else {
            if (!shadow) await message.channel.send(format('Usage: purge <num>|at [--shadow]'));
        }
    } catch (error) {
        console.error('Purge error:', error);
        if (!shadow) await message.channel.send(format('Failed to purge messages'));
    }
}

async function exportMessages(message, target, shadow = false) {
    try {
        const dir = path.resolve(process.cwd(), 'exports');

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (!['json', 'txt'].includes(target)) {
            if (!shadow) return message.channel.send(format('Usage: export <json|txt> [--shadow]'));
            return;
        }
        
        if (!shadow) await message.channel.send(format(`Starting export of messages as ${target.toUpperCase()} file...`));

        const all = [];
        let lastID;
        let fetched;

        do {
            const options = { limit: 100 };
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
        const channelName = message.channel.name || (message.channel.recipient && message.channel.recipient.username) || 'DM';
        const filename = `${channelName}-${time}.${target}`;
        const filePath = path.join(dir, filename);

        if (target === 'json') {
            fs.writeFileSync(filePath, JSON.stringify(all, null, 2), 'utf-8');
        } else {
            const lines = all.map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.author}: ${m.content}`);
            fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
        }

        if (!shadow) await message.channel.send(format(`Exported ${all.length} messages to ${filename}`));
    } catch (error) {
        console.error('Export error:', error);
        if (!shadow) await message.channel.send(format('Failed to export messages'));
    }
}

function help() {
    return format(`Available commands:
    • \`help\`: Show this help message
    • \`purge <num>|at [--shadow]\`: Purge your messages
    • \`export <json|txt> [--shadow]\`: Export messages to \`exports/\` folder`);
}

async function handle(message) {
    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase() || '';
    
    const shadowIndex = args.indexOf('--shadow');
    const shadow = shadowIndex !== -1;
    
    if (shadow) {
        args.splice(shadowIndex, 1);
    }

    if (shadow) {
        message.delete().catch(() => {});
    }

    if (!command) {
        message.channel.send(help());
        return;
    }

    switch (command) {
        case 'help':
            message.channel.send(help());
            break;

        case 'purge': {
            const target = args[0];
            await purgeMessages(message, target, shadow);
            break;
        }

        case 'export': {
            const fmt = args[0];
            await exportMessages(message, fmt, shadow);
            break;
        }

        default:
            message.channel.send(format(`Unknown command: ${command}`));
    }
}

client.on("messageCreate", (message) => {
    if (message.author.username !== client.user?.username) return;
    if (!message.content.startsWith(prefix)) return;

    handle(message);
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.login(token);
