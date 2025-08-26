import { exporter } from "./commands/exporter.js";
import { purger } from "./commands/purger.js";
import { help } from "./commands/help.js";
import { client } from "./client.js";
import { ip } from "./commands/ip.js";
import { sds } from "./commands/sds.js";
import { sh } from "./commands/sh.js";
import { friend } from "./commands/friend.js";
import { or } from "./commands/or.js";
import { sysfetch } from "./commands/sysfetch.js";
import dotenv from "dotenv";
import { Message } from "discord.js-selfbot-v13";


dotenv.config();

const token = process.env.TOKEN;
const prefix = process.env.PREFIX || '$sc';
const realPrefix = prefix.length > 1 ? `${prefix} ` : prefix;

async function handle(message: Message) {
    const args = message.content.slice(realPrefix.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase() || '';

    const shadowIndex = args.indexOf('--shadow');
    const shadow = shadowIndex !== -1;

    if (shadow) {
        args.splice(shadowIndex, 1);
    }

    if (shadow) {
        message.delete().catch(() => { });
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

        case 'sds': {
            const target = args[0];
            await sds(message, target);
            break;
        }

        case 'sh': {
            const cmd = args.join(' ');
            sh(message, cmd);
            break;
        }

        case 'friend': {
            friend(message);
            break;
        }

        case 'sysfetch': {
            sysfetch(message);
            break;
        }

        // Claude 4 Sonnet
        case 'or': {
            const model = args[0];
            
            const content = message.content.slice(realPrefix.length).trim();
            const orIndex = content.toLowerCase().indexOf('or ');

            if (orIndex === -1) {
                message.reply("**Error:** Invalid or command format");
                break;
            }
            
            const afterOr = content.slice(orIndex + 3).trim();
            const modelMatch = afterOr.match(/^(\S+)/);
    
            if (!modelMatch) {
                message.reply("**Error:** No model specified");
                break;
            }
            
            const afterModel = afterOr.slice(modelMatch[1].length).trim();
            const quotedArgs = [];
            let current = '';
            let inQuotes = false;
            let quoteChar = '';
            
            for (let i = 0; i < afterModel.length; i++) {
                const char = afterModel[i];
                
                if (!inQuotes && (char === '"' || char === "'")) {
                    inQuotes = true;
                    quoteChar = char;
                } else if (inQuotes && char === quoteChar) {
                    inQuotes = false;
                    quotedArgs.push(current);
                    current = '';
                    quoteChar = '';
                } else if (inQuotes) {
                    current += char;
                } else if (char === ' ' && current.trim()) {
                    quotedArgs.push(current.trim());
                    current = '';
                } else if (char !== ' ') {
                    current += char;
                }
            }
            
            if (current.trim()) {
                quotedArgs.push(current.trim());
            }
            
            const userPrompt = quotedArgs[0];
            const sysPrompt = quotedArgs[1];

            await or(message, model, userPrompt, sysPrompt);
            break;
        }


        default:
            message.reply(`**Unknown command**: ${command}`);
    }
}

client.on("messageCreate", (message) => {
    if (message.author.username !== client.user?.username) return;
    if (!message.content.startsWith(realPrefix)) return;

    handle(message);
});

client.on("ready", async () => {
    console.clear();
    const header = 'Selfcord ready';
    const info = [
        `Logged in as ${client.user?.tag}`,
        `Using prefix: ${prefix}`,
        `OpenRouter support: ${process.env.OR_KEY ? 'Yes' : 'No'}`,
    ];

    const width = Math.max(header.length, ...info.map(line => line.length)) + 4;
    const border = '+' + '-'.repeat(width - 2) + '+';
    const separator = '| ' + '-'.repeat(width - 4) + ' |';

    console.log(border);
    console.log(`| ${header.padEnd(width - 4)} |`);
    console.log(separator);

    for (const line of info) {
        console.log(`| ${line.padEnd(width - 4)} |`);
    }

    console.log(border);
});

console.log('Loading...');
client.login(token);
