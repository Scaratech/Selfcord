/// COMMANDS - UTILS ///
import { messageExporter } from "./commands/utils/messageExporter.js";
import { messasgePurger } from "./commands/utils/messagePurger.js";
import { genFriendInv } from "./commands/utils/genFriend.js";
import {
    aliasCmd,
    invokeAlias,
    processer
} from "./commands/utils/alias.js";
import {
    nitroSniper,
    isEnabled,
    attemptSnipe,
    extractCode
} from "./commands/utils/nitroSniper.js";
import {
    watchChannel,
    stopWatch,
    getActiveWatches,
    getWatchSession,
    startWatchSession,
    saveWatchData
} from "./commands/utils/watchdog.js";

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
import {
    openRouterCmd,
    getModel,
    getLastModel
} from "./commands/other/openRouter.js";
import { clydeCmd, getClydeChannel } from "./commands/other/clyde.js";
import { githubCommitCmd } from "./commands/other/githubCommitScraper.js";
import { helpCmd } from "./commands/helpCmd.js";

/// OTHER ///
import { client } from "./client.js";

/// DEPS ///
import { Message } from "discord.js-selfbot-v13";
import dotenv from "dotenv";
import chalk from "chalk";
import stripAnsi from "strip-ansi";

dotenv.config();

/// CONSOLE OVERRIDES ///
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

console.log = (...args) => {
    originalLog(chalk.blue(...args.map(arg => typeof arg === 'string' ? arg : String(arg))));
};

console.error = (...args) => {
    originalError(chalk.red.bold('Error:'),
        ...args.map(arg => typeof arg === 'string' ? chalk.red(arg) : chalk.red(String(arg))));
};

console.warn = (...args) => {
    originalWarn(chalk.yellow.bold('Warning:'),
        ...args.map(arg => typeof arg === 'string' ? chalk.yellow(arg) : chalk.yellow(String(arg))));
};

console.info = (...args) => {
    originalInfo(chalk.cyan.bold('Info:'),
        ...args.map(arg => typeof arg === 'string' ? chalk.cyan(arg) : chalk.cyan(String(arg))));
};

(console as any).success = (...args: any[]) => {
    originalLog(chalk.green.bold('Success:'),
        ...args.map(arg => typeof arg === 'string' ? chalk.green(arg) : chalk.green(String(arg))));
};

const token = process.env.TOKEN;

const prefix = process.env.PREFIX || '$sc';
const realPrefix = prefix.length > 1 ? `${prefix} ` : prefix;

const sharedUsers: string[] = process.env.SHARED
    ? process.env.SHARED.split(',')
        .map(id => id.trim().replace(/[\[\]]/g, ''))
        .filter(id => id.length > 0)
    : [];

const watchdogChannels: string[] = process.env.WD_CHANNELS
    ? process.env.WD_CHANNELS.split(',')
        .map(id => id.trim().replace(/[\[\]]/g, ''))
        .filter(id => id.length > 0)
    : [];

const watchdogFormat: 'txt' | 'json' = (process.env.WD_FMT?.toLowerCase() as 'txt' | 'json') || 'txt';

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

    const isOwner = message.author.username === message.client.user?.username;

    if (command !== 'alias' && isOwner && await invokeAlias(message, command)) {
        return;
    }

    console.log(chalk.green.bold('[COMMAND]') + chalk.yellow(` ${message.author.tag}:`) + chalk.cyan(` ${command}`) + chalk.white(` ${args.join(' ')}`));

    try {
        switch (command) {
            case 'help':
                message.reply(helpCmd());
                break;

            case 'ping':
                message.reply('Pong!');
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

            case 'ns': {
                const status = args[0];
                nitroSniper(message, status);
                break;
            }

            case 'wd': {
                const channelId = args[0];
                const format = args[1] as 'txt' | 'json';
                const isStop = args.includes('--stop');
                const isList = args.includes('--list');

                if (isList) {
                    const activeWatches = getActiveWatches();

                    if (activeWatches.length === 0) {
                        message.reply('**No active watches**');
                    } else {
                        message.reply([
                            '**Watches:**',
                            ...activeWatches.map(id => `- <#${id}>`)
                        ].join('\n'));
                    }

                    break;
                }

                if (!channelId) {
                    message.reply('**Usage**: `wd <CHANNEL_ID> <txt|json> [--stop | --list]`');
                    break;
                }

                if (isStop) {
                    stopWatch(message, channelId);
                    break;
                }

                if (!format) {
                    message.reply('**Usage**: `wd <CHANNEL_ID> <txt|json> [--stop | --list]`');
                    break;
                }

                await watchChannel(message, channelId, format);
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
                const raw = message.content.slice(realPrefix.length).trim();
                const newMatch = raw.match(/\s--new\b/);
                const isNewConv = Boolean(newMatch);
                const cleaned = isNewConv ? raw.replace(/\s--new\b/, '') : raw;
                const fullRegex = /^or\s+(\S+)\s+"([^"]+)"(?:\s+"([^"]+)")?$/i;
                const fullMatch = cleaned.match(fullRegex);

                if (fullMatch) {
                    const [, model, userPrompt, sysPrompt] = fullMatch;
                    await openRouterCmd(message, model, userPrompt, sysPrompt, isNewConv);
                    break;
                }

                const promptOnlyRegex = /^or\s+"([^"]+)"$/i;
                const promptMatch = cleaned.match(promptOnlyRegex);

                if (promptMatch) {
                    const [, userPrompt] = promptMatch;
                    const lastModel = getLastModel(message.channelId);

                    if (!lastModel) {
                        message.reply("**Error:** No model specified and no previous model found for this channel. Use: `or <model> \"prompt\"`");
                        break;
                    }

                    await openRouterCmd(message, lastModel, userPrompt, undefined, isNewConv);
                    break;
                }

                message.reply("**Error:** Invalid or command format. Use: `or <model> \"prompt\" [\"system\"]` or `or \"prompt\"` (uses last model)");
                break;
            }

            case 'test': {
                message.reply("Test command - functionality removed");
                break;
            }

            case 'gh': {
                await githubCommitCmd(message, args);
                break;
            }

            case 'clyde': {
                const userPrompt = args.join(' ');
                await clydeCmd(message, userPrompt);
                break;
            }
            /////////////

            default:
                message.reply(`**Unknown command**: \`${command}\``);
        }
    } catch (error: any) {
        console.error(`Command failed: ${error.message}`);
        message.reply(`**Error:** ${error.message}`);
    }
}

client.on("messageCreate", async (message) => {
    if (isEnabled() && message.content) {
        const giftCodes = extractCode(message.content);

        for (const giftCode of giftCodes) {
            await attemptSnipe(message, giftCode);
        }
    }

    const sessions = getActiveWatches();

    for (const channelId of sessions) {
        if (message.channelId === channelId) {
            const session = getWatchSession(channelId);

            if (session && session.isActive) {
                const messageLog = {
                    id: message.id,
                    author: `${message.author.username}#${message.author.discriminator}`,
                    authorId: message.author.id,
                    timestamp: message.createdTimestamp,
                    content: message.content,
                    state: 'sent' as const
                };

                session.messages.set(message.id, messageLog);
                await saveWatchData(session);
            }
        }
    }

    const repliedId = message.reference?.messageId;

    if (repliedId) {
        const model = getModel(repliedId);
        const clydeChannelId = getClydeChannel(repliedId);
        const isOwner = message.author.username === client.user?.username;
        const isSharedUser = sharedUsers.length > 0 && sharedUsers.includes(message.author.id);

        if (model && (isOwner || isSharedUser)) {
            await openRouterCmd(message, model, message.content);
            return;
        }

        if (clydeChannelId && (isOwner || isSharedUser)) {
            await clydeCmd(message, message.content);
            return;
        }
    }

    const isOwner = message.author.username === client.user?.username;
    const isSharedUser = sharedUsers.length > 0 && sharedUsers.includes(message.author.id);

    if (!isOwner && !isSharedUser) {
        return;
    }
    if (
        isOwner &&
        message.content &&
        !message.content.startsWith(realPrefix)
        && processer(message.content)
    ) {
        const firstWord = message.content.trim().split(/\s+/)[0];

        await invokeAlias(message, firstWord);
        return;
    }

    if (!message.content.startsWith(realPrefix)) {
        return;
    }

    handle(message);
});

client.on("ready", async () => {
    console.clear();

    const header = chalk.green.bold('Selfcord ready');
    const info = [
        chalk.yellow(`Logged in as: ${chalk.cyan(client.user?.tag)}`),
        chalk.yellow(`Using prefix: ${chalk.cyan(prefix)}`),
    ];
    const multi = [
        chalk.yellow(`Shared users: ${chalk.cyan(sharedUsers.length > 0 ? `${sharedUsers.length} user(s)` : 'None')}`),
        chalk.yellow(`WD channels: ${chalk.cyan(watchdogChannels.length > 0 ? `${watchdogChannels.length} channel(s)` : 'None')}`)
    ];
    const support = [
        chalk.yellow(`OpenRouter support: ${process.env.OR_KEY ? chalk.green('Yes') : chalk.red('No')}`),
        chalk.yellow(`GitHub support: ${process.env.GITHUB_TOKEN ? chalk.green('Yes') : chalk.red('No')}`),
        chalk.yellow(`Nitro sniper: ${isEnabled() ? chalk.green('Enabled') : chalk.red('Disabled')}`)
    ];

    const allLines = [header, ...info, ...support];
    const maxContentWidth = Math.max(...allLines.map(line => stripAnsi(line).length));
    const boxWidth = maxContentWidth + 8;
    const border = chalk.blue('+' + '-'.repeat(boxWidth - 2) + '+');
    const separator = chalk.blue('| ' + '-'.repeat(boxWidth - 4) + ' |');

    const createLine = (content: string) => {
        const contentLength = stripAnsi(content).length;
        const padding = ' '.repeat(boxWidth - 6 - contentLength);

        return chalk.blue('|  ') + content + padding + chalk.blue('  |');
    };

    console.log(border);
    console.log(createLine(header));
    console.log(separator);

    for (const line of info) {
        console.log(createLine(line));
    }

    console.log(separator);

    for (const line of multi) {
        console.log(createLine(line));
    }

    console.log(separator);

    for (const line of support) {
        console.log(createLine(line));
    }

    console.log(border);

    if (watchdogChannels.length > 0) {
        try {
            for (const channelId of watchdogChannels) {
                const success = await startWatchSession(client, channelId, watchdogFormat);

                if (!success) {
                    console.log(chalk.red(`Failed to start watching channel ${channelId}`));
                }
            }
        } catch (err) {
            console.error('Failed to auto-watch channels:', err);
        }
    }
});


client.on("messageUpdate", async (_oldMessage, newMessage) => {
    const sessions = getActiveWatches();

    for (const channelId of sessions) {
        if (newMessage.channelId === channelId) {
            const session = getWatchSession(channelId);

            if (session && session.isActive) {
                const existing = session.messages.get(newMessage.id);

                if (existing) {
                    const editCount = session.editCounts.get(newMessage.id) || 0;
                    const newEditCount = editCount + 1;

                    existing.previousContent = existing.content;
                    existing.content = newMessage.content || '';
                    existing.state = 'edited';
                    existing.editNumber = newEditCount;

                    session.editCounts.set(newMessage.id, newEditCount);
                    await saveWatchData(session);
                }
            }
        }
    }

    if (
        newMessage.author?.username !== client.user?.username &&
        !(sharedUsers.length > 0 && sharedUsers.includes(newMessage.author.id))
    ) {
        return;
    }

    const isOwner = newMessage.author?.username === client.user?.username;

    if (
        isOwner &&
        newMessage.content &&
        !newMessage.content.startsWith(realPrefix)
        && processer(newMessage.content)
    ) {
        const firstWord = newMessage.content.trim().split(/\s+/)[0];

        await invokeAlias(newMessage as Message, firstWord);
        return;
    }

    if (!newMessage.content.startsWith(realPrefix)) {
        return;
    }

    await handle(newMessage as Message);
});

client.on("messageDelete", async (message) => {
    const sessions = getActiveWatches();

    for (const channelId of sessions) {
        if (message.channelId === channelId) {
            const session = getWatchSession(channelId);

            if (session && session.isActive) {
                const existing = session.messages.get(message.id);

                if (existing) {
                    existing.state = 'deleted';
                    await saveWatchData(session);
                }
            }
        }
    }
});

console.log('Loading...');
client.login(token);
