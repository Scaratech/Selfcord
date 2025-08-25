import { exporter } from "./commands/exporter.js";
import { purger } from "./commands/purger.js";
import { help } from "./commands/help.js";
import { client } from "./utils/client.js";
import { ip } from "./commands/ip.js";
import dotenv from "dotenv";
import { Message } from "discord.js-selfbot-v13";

dotenv.config();

const token = process.env.TOKEN;
const prefix = process.env.PREFIX || '$sc';

async function handle(message: Message) {
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
        message.reply(help());
        return;
    }

    switch (command) {
        case 'help':
            message.reply(help());
            break;

        case 'purge': {
            const target = args[0];
            await purger(message, target, shadow);
            break;
        }

        case 'export': {
            const fmt = args[0];
            await exporter(message, fmt, shadow);
            break;
        }

        case 'ip': {
            const target = args[0];
            await ip(message, target);
            break;
        }

        default:
            message.reply(`Unknown command: ${command}`);
    }
}

client.on("messageCreate", (message) => {
    if (message.author.username !== client.user?.username) return;
    if (!message.content.startsWith(prefix)) return;

    handle(message);
});

client.on("ready", () => {
    console.clear();

    const info = [
        'Selfcord ready',
        `Logged in as ${client.user?.tag}`,
        `Using prefix: ${prefix}`
    ];

    const width = Math.max(...info.map(line => line.length)) + 4;
    const border = '+' + '-'.repeat(width - 2) + '+';

    console.log(border);

    for (const line of info) {
        console.log(`| ${line.padEnd(width - 4)} |`);
    }

    console.log(border);
});

console.log('Loading...');
client.login(token);
