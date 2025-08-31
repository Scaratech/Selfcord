/// COMMANDS - DISCORD ///
import {
    isEnabled,
    attemptSnipe,
    extractCode
} from "./commands/discord/nitroSniper.js";
import {
    getActiveWatches,
    getWatchSession,
    startWatchSession,
    saveWatchData
} from "./commands/discord/watchdog.js";

/// COMMANDS - UTILS ///
import { invokeAlias, processer } from "./commands/selfbot/alias.js";

/// COMMANDS - OTHER ///
import { openRouterCmd, getModel } from "./commands/other/openRouter.js";
import { clydeCmd, getClydeChannel } from "./commands/other/clyde.js";

/// OTHER ///
import { client } from "./client.js";
import { config, prefix } from "./config.js";
import { handle } from "./commands/handler.js";
import "./consoleOverride.js";

/// DEPS ///
import { Message } from "discord.js-selfbot-v13";
import chalk from "chalk";
import stripAnsi from "strip-ansi";


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
        const isSharedUser = config.shared.length > 0 && config.shared.includes(message.author.id);

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
    const isSharedUser = config.shared.length > 0 && config.shared.includes(message.author.id);

    if (!isOwner && !isSharedUser) {
        return;
    }
    if (
        isOwner &&
        message.content &&
        !message.content.startsWith(prefix)
        && processer(message.content)
    ) {
        const firstWord = message.content.trim().split(/\s+/)[0];

        await invokeAlias(message, firstWord);
        return;
    }

    if (!message.content.startsWith(prefix)) {
        return;
    }

    handle(message);
});

client.on("ready", async () => {
    console.clear();

    const header = chalk.green.bold('Selfcord ready');
    const info = [
        chalk.yellow(`Logged in as: ${chalk.cyan(client.user?.tag)}`),
        chalk.yellow(`Using prefix: ${chalk.cyan(config.prefix)}`),
    ];
    const multi = [
        chalk.yellow(`Shared users: ${chalk.cyan(config.shared.length > 0 ? `${config.shared.length} user(s)` : 'None')}`),
        chalk.yellow(`WD channels: ${chalk.cyan(config.watchdog.channels.length > 0 ? `${config.watchdog.channels.length} channel(s)` : 'None')}`)
    ];
    const support = [
        chalk.yellow(`OpenRouter support: ${config.apis.openrouter_key ? chalk.green('Yes') : chalk.red('No')}`),
        chalk.yellow(`GitHub support: ${config.apis.github_token ? chalk.green('Yes') : chalk.red('No')}`),
        chalk.yellow(`Numverify support: ${config.apis.numverify_key ? chalk.green('Yes') : chalk.red('No')}`),
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

    if (config.watchdog.channels.length > 0) {
        try {
            for (const channelId of config.watchdog.channels) {
                const success = await startWatchSession(client, channelId.toString(), config.watchdog.format);

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
        !(config.shared.length > 0 && config.shared.includes(newMessage.author.id))
    ) {
        return;
    }

    const isOwner = newMessage.author?.username === client.user?.username;

    if (
        isOwner &&
        newMessage.content &&
        !newMessage.content.startsWith(prefix)
        && processer(newMessage.content)
    ) {
        const firstWord = newMessage.content.trim().split(/\s+/)[0];

        await invokeAlias(newMessage as Message, firstWord);
        return;
    }

    if (!newMessage.content.startsWith(prefix)) {
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
client.login(config.token);
