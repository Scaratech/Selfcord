/// COMMANDS - DISCORD ///
import { messageExporter } from "./commands/discord/messageExporter.js";
import { messasgePurger } from "./commands/discord/messagePurger.js";
import { genFriendInv } from "./commands/discord/genFriend.js";
import { nitroSniper } from "./commands/discord/nitroSniper.js";
import { watchChannel, stopWatch, getActiveWatches } from "./commands/discord/watchdog.js";
import { setHypesquad } from "./commands/discord/hypesquad.js";
import { spammer } from "./commands/discord/spammer.js";

/// COMMANDS - SELFBOT ///
import { aliasCmd, invokeAlias } from "./commands/selfbot/alias.js";
import { sharedCmd, preCmd } from "./commands/selfbot/updater.js";
import {
    stopCmd,
    restartCmd,
    pingCmd,
    consoleCmd
} from "./commands/selfbot/selfbot.js";

/// COMMANDS - UTILS ///
import { edHandler } from "./commands/utils/encDec.js";
import { hasher } from "./commands/utils/hasher.js";
import { calc } from "./commands/utils/calc.js";
import { tzCalc } from "./commands/utils/tzCalc.js";

/// COMMANDS - NETWORK ///
import { ipLookup } from "./commands/network/ip.js";
import { subdomainScanner } from "./commands/network/subdomainScanner.js";
import { dnsLookup } from "./commands/network/dns.js";
import { rdnsLookup } from "./commands/network/rdns.js";
import { macLookup } from "./commands/network/mac.js";

/// COMMANDS - SYS ///
import { shellExec } from "./commands/sys/shellExec.js";
import { jsExec } from "./commands/sys/jsExec.js";
import { sysfetch } from "./commands/sys/sysfetch.js";

/// COMMANDS - OTHER ///
import { openRouterCmd, getLastModel } from "./commands/other/openRouter.js";
import { clydeCmd } from "./commands/other/clyde.js";
import { githubCommitCmd } from "./commands/other/githubCommitScraper.js";
import { phoneNumberLookup } from "./commands/other/phoneNumberLookup.js";
import { helpCmd } from "./commands/helpCmd.js";

/// DEPS ///
import { Message } from "discord.js-selfbot-v13";
import chalk from "chalk";
import { prefix } from "./config.js";

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
        helpCmd(message);
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
                helpCmd(message);
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

            case 'hypesquad': {
                const house = args[0];
                setHypesquad(message, house);
                break;
            }

            case 'spam': {
                const amount = parseInt(args[0]);
                const msg = args.slice(1).join(' ');

                spammer(message, amount, msg);
                break;
            }
            ////////////


            // SELFBOT ///
            case 'alias': {
                await aliasCmd(message, args);
                break;
            }

            case 'shared': {
                await sharedCmd(message, args);
                break;
            }

            case 'pre': {
                await preCmd(message, args);
                break;
            }

            case 'stop': {
                stopCmd(message);
                break;
            }

            case 'restart': {
                restartCmd(message);
                break;
            }

            case 'ping': {
                pingCmd(message);
                break;
            }

            case 'console': {
                consoleCmd(message);
                break;
            }
            ////////////

            // UTILS ///
            case 'enc': {
                const type = args[0];
                const msg = args.slice(1).join(' ');

                if (!type || !msg) {
                    message.reply("**Usage:** `enc <b64 | uri | hex> <message>`");
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
                    message.reply("**Usage:** `dec <b64 | uri | hex> <message>`");
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
                    message.reply("**Usage:** `hash <sha1 | sha256 | md5> <message>`");
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

            case 'tz': {
                const tz1 = args[0];
                const tz2 = args[1];

                tzCalc(message, tz1, tz2);
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

            case 'phone': {
                const phoneNumber = args.join(' ');
                await phoneNumberLookup(message, phoneNumber);
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
