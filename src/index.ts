/// COMMANDS - UTILS ///
import { messageExporter } from "./commands/utils/messageExporter.js";
import { messasgePurger } from "./commands/utils/messagePurger.js";
import { genFriendInv } from "./commands/utils/genFriend.js";
import { aliasCmd, invokeAlias } from "./commands/utils/alias.js";

/// COMMANDS - NETWORK ///
import { ipLookup } from "./commands/network/ip.js";
import { subdomainScanner } from "./commands/network/subdomainScanner.js";
import { dnsLookup } from "./commands/network/dns.js";
import { rdnsLookup } from "./commands/network/rdns.js";

/// COMMANDS - SYS ///
import { shellExec } from "./commands/sys/shellExec.js";
import { jsExec } from "./commands/sys/jsExec.js";
import { sysfetch } from "./commands/sys/sysfetch.js";

/// COMMANDS - OTHER ///
import { openRouterCmd } from "./commands/other/openRouter.js";
import { helpCmd } from "./commands/helpCmd.js";

/// OTHER ///
import { client } from "./client.js";

/// DEPS ///
import dotenv from "dotenv";
import { Message } from "discord.js-selfbot-v13";

dotenv.config();

const token = process.env.TOKEN;

const prefix = process.env.PREFIX || '$sc';
const realPrefix = prefix.length > 1 ? `${prefix} ` : prefix;

const sharedUsers: string[] = process.env.SHARED
    ? process.env.SHARED.split(',')
        .map(id => id.trim().replace(/[\[\]]/g, ''))
        .filter(id => id.length > 0)
    : [];

export async function handle(message: Message) {
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
        message.reply(helpCmd());
        return;
    }

    if (command !== 'alias' && await invokeAlias(message, command)) {
        return;
    }

    switch (command) {
        case 'help':
            message.reply(helpCmd());
            break;

        /// UTILS ///
        case 'alias': {
            await aliasCmd(message, args);
            break;
        }

        case 'purge': {
            const target = args[0];
            await messasgePurger(message, target, shadow);
            break;
        }

        case 'export': {
            const fmt = args[0];
            await messageExporter(message, fmt, shadow);
            break;
        }

        case 'friend': {
            genFriendInv(message);
            break;
        }
        ////////////


        /// NETWORK ///
        case 'ip': {
            const target = args[0];
            await ipLookup(message, target);
            break;
        }

        case 'sds': {
            const target = args[0];
            await subdomainScanner(message, target);
            break;
        }

        case 'dns': {
            const recordType = args[0];
            const hostname = args[1];
            await dnsLookup(message, recordType, hostname);
            break;
        }

        case 'rdns': {
            const target = args[0];
            await rdnsLookup(message, target);
            break;
        }
        ///////////////

        /// SYS ///
        case 'sh': {
            const cmd = args.join(' ');
            shellExec(message, cmd);
            break;
        }

        case 'js': {
            const code = message.content.slice(realPrefix.length + 3).trim();
            await jsExec(message, code);
            break;
        }

        case 'sysfetch': {
            sysfetch(message);
            break;
        }
        ///////////

        /// OTHER ///
        case 'or': {
            const newIndex = args.indexOf('--new');
            const isNewConv = newIndex !== -1;

            if (isNewConv) {
                args.splice(newIndex, 1);
            }
    
            const model = args[0];

            let content = message.content.slice(realPrefix.length).trim();

            if (isNewConv) {
                content = content.replace(/--new\b\s*/, '');
            }

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

            try {
                await openRouterCmd(message, model, userPrompt, sysPrompt, isNewConv);
            } catch (err) {
                console.error('Error:', err);
                message.reply(`**Error**: ${err.message}`);
            }

            break;
        }
        /////////////

        default:
            message.reply(`**Unknown command**: ${command}`);
    }
}

// Auto-chain AI conversation: reply to AI messages triggers follow-up
import { getModelForAI } from "./commands/other/openRouter.js";
client.on("messageCreate", async (message) => {
    // If this message is a reply to an AI message, auto-forward to AI
    const repliedId = message.reference?.messageId;
    if (repliedId) {
        const model = getModelForAI(repliedId);
        const isOwner = message.author.username === client.user?.username;
        const isSharedUser = sharedUsers.length > 0 && sharedUsers.includes(message.author.id);
        if (model && (isOwner || isSharedUser)) {
            // Use the reply content as the new user prompt
            await openRouterCmd(message, model, message.content);
            return;
        }
    }
    // Existing command handler follows
    const isOwner = message.author.username === client.user?.username;
    const isSharedUser = sharedUsers.length > 0 && sharedUsers.includes(message.author.id);

    if (!isOwner && !isSharedUser) return;
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
        `Shared users: ${sharedUsers.length > 0 ? `${sharedUsers.length} user(s)` : 'None'}`
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


client.on("messageUpdate", async (_oldMessage, newMessage) => {

    if (
        newMessage.author?.username !== client.user?.username &&
        !(sharedUsers.length > 0 && sharedUsers.includes(newMessage.author.id))
    ) {
        return;
    }

    if (!newMessage.content.startsWith(realPrefix)) {
        return;
    }

    await handle(newMessage as Message);
});

console.log('Loading...');
client.login(token);
