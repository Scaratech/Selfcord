/// COMMANDS - DISCORD ///
import { messageExporter } from "./discord/messageExporter.js";
import { messasgePurger } from "./discord/messagePurger.js";
import { genFriendInv } from "./discord/genFriend.js";
import { nitroSniper } from "./discord/nitroSniper.js";
import { watchChannel, stopWatch, getActiveWatches
} from "./discord/watchdog.js";

/// COMMANDS - UTILS ///
import { aliasCmd, invokeAlias } from "./utils/alias.js";
import { edHandler } from "./utils/encDec.js";
import { hasher } from "./utils/hasher.js";
import { calc } from "./utils/calc.js";

/// COMMANDS - NETWORK ///
import { ipLookup } from "./network/ip.js";
import { subdomainScanner } from "./network/subdomainScanner.js";
import { dnsLookup } from "./network/dns.js";
import { rdnsLookup } from "./network/rdns.js";
import { macLookup } from "./network/mac.js";

/// COMMANDS - SYS ///
import { shellExec } from "./sys/shellExec.js";
import { jsExec } from "./sys/jsExec.js";
import { sysfetch } from "./sys/sysfetch.js";

/// COMMANDS - OTHER ///
import { openRouterCmd, getLastModel } from "./other/openRouter.js";
import { clydeCmd } from "./other/clyde.js";
import { githubCommitCmd } from "./other/githubCommitScraper.js";
import { helpCmd } from "./helpCmd.js";

/// DEPS ///
import { Message } from "discord.js-selfbot-v13";
import chalk from "chalk";
import { prefix } from "../config.js";

export async function handle(message: Message) {
    const args = message.content.slice(prefix.length).trim().split(/\s+/);
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

            /// DISCORD ///
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


            // UTILS ///
            case 'alias': {
                await aliasCmd(message, args);
                break;
            }

            case 'enc': {
                const type = args[0];
                const msg = args.slice(1).join(' ');

                if (!type || !msg) {
                    message.reply("**Usage:** `enc <type> <message>`");
                    break;
                }

                //@ts-ignore
                edHandler(message, 'encoded', type, msg);
                break;
            }

            case 'dec': {
                const type = args[0];
                const msg = args.slice(1).join(' ');

                if (!type || !msg) {
                    message.reply("**Usage:** `dec <type> <message>`");
                    break;
                }

                //@ts-ignore
                edHandler(message, 'decode', type, msg);
                break;
            }

            case 'hash': {
                const type = args[0];
                const msg = args.slice(1).join(' ');

                if (!type || !msg) {
                    message.reply("**Usage:** `hash <type> <message>`");
                    break;
                }

                hasher(message, type, msg);
                break;
            }

            case 'calc': {
                const expr = args.join(' ');
                calc(message, expr);
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

            case 'mac': {
                const mac = args[0];
                await macLookup(message, mac);
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
                const code = message.content.slice(prefix.length + 3).trim();
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
                const raw = message.content.slice(prefix.length).trim();
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
    } catch (err) {
        console.error(`Command failed: ${err.message}`);
        message.reply(`**Error:** ${err.message}`);
    }
}
