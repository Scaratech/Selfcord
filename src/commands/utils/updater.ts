import { config, Config } from '../../config.js';
import { Message } from 'discord.js-selfbot-v13';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'config.json');

function loadConfig(): Config {
    try {
        const data = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Failed to load config:', err);
        return config;
    }
}

function saveConfig(configData: Config): void {
    try {
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 4));
    } catch (err) {
        console.error('Failed to save config:', err);
        throw new Error('Failed to save config file');
    }
}

export async function sharedCmd(message: Message, args: string[]): Promise<void> {
    const subCommand = args[0]?.toLowerCase();

    switch (subCommand) {
        case 'list':
            const currentConfig = loadConfig();

            if (currentConfig.shared.length === 0) {
                message.reply('**No shared users configured**');
            } else {
                const userList = currentConfig.shared.map(id => `- \`${id}\``).join('\n');
                message.reply(`**Shared Users:**\n${userList}`);
            }

            break;

        case 'add':
            const userId = args[1];

            if (!userId) {
                message.reply('**Usage:** `$shared add <user_id>`');
                return;
            }
            
            try {
                const configData = loadConfig();
                if (configData.shared.includes(userId)) {
                    message.reply('**Error:** User is already shared');
                    return;
                }
                
                configData.shared.push(userId);
                saveConfig(configData);

                config.shared.push(userId);
                
                message.reply(`**Success:** Added \`${userId}\` to shared users`);
            } catch (err) {
                message.reply(`**Error:** ${err.message}`);
                console.error('Failed to add user to shared users:', err);
            }
            break;

        case 'remove':
            const removeUserId = args[1];

            if (!removeUserId) {
                message.reply('**Usage:** `$shared remove <user_id>`');
                return;
            }
            
            try {
                const configData = loadConfig();
                const index = configData.shared.indexOf(removeUserId);

                if (index === -1) {
                    message.reply('**Error:** User is not in shared list');
                    return;
                }
                
                configData.shared.splice(index, 1);
                saveConfig(configData);
                
                const runtimeIndex = config.shared.indexOf(removeUserId);

                if (runtimeIndex !== -1) {
                    config.shared.splice(runtimeIndex, 1);
                }
                
                message.reply(`**Success:** Removed \`${removeUserId}\` from shared users`);
            } catch (err) {
                message.reply(`**Error:** ${err.message}`);
                console.error('Failed to remove user from shared users:', err);
            }

            break;

        default:
            message.reply('**Usage:** `$shared <list|add|remove> [user_id]`');
    }
}

export async function preCmd(message: Message, args: string[]): Promise<void> {
    const subCommand = args[0]?.toLowerCase();

    switch (subCommand) {
        case 'ns':
            const nsStatus = args[1]?.toLowerCase();

            if (!nsStatus || !['on', 'off'].includes(nsStatus)) {
                message.reply('**Usage:** `$pre ns <on|off>`');
                return;
            }
            
            try {
                const configData = loadConfig();
                configData.nitro_sniper = nsStatus === 'on';

                saveConfig(configData);
                message.reply(`**Nitro sniper ${nsStatus === 'on' ? 'enabled' : 'disabled'} on startup**`);
            } catch (err) {
                message.reply(`**Error:** ${err.message}`);
                console.error('Failed to toggle nitro sniper:', err);
            }
            break;

        case 'wd':
            const wdSubCommand = args[1]?.toLowerCase();
            
            switch (wdSubCommand) {
                case 'list':
                    const wdConfig = loadConfig();

                    if (wdConfig.watchdog.channels.length === 0) {
                        message.reply('**No watchdog channels configured**');
                    } else {
                        const channelList = wdConfig.watchdog.channels.map(id => `- \`${id}\``).join('\n');
                        message.reply(`**Watchdog Channels:**\n${channelList}\n\n**Format:** \`${wdConfig.watchdog.format}\``);
                    }

                    break;

                case 'add':
                    const channelId = args[2];

                    if (!channelId) {
                        message.reply('**Usage:** `$pre wd add <channel_id>`');
                        return;
                    }
                    
                    try {
                        const configData = loadConfig();

                        if (configData.watchdog.channels.includes(channelId)) {
                            message.reply('**Error:** Channel is already in watchdog list');
                            return;
                        }
                        
                        configData.watchdog.channels.push(channelId);
                        saveConfig(configData);
                        message.reply(`**Success:** Added \`${channelId}\` to watchdog channels`);
                    } catch (err: any) {
                        message.reply(`**Error:** ${err.message}`);
                        console.error('Failed to add channel to watchdog:', err);
                    }

                    break;

                case 'remove':
                    const removeChannelId = args[2];

                    if (!removeChannelId) {
                        message.reply('**Usage:** `$pre wd remove <channel_id>`');
                        return;
                    }
                    
                    try {
                        const configData = loadConfig();
                        const index = configData.watchdog.channels.indexOf(removeChannelId);

                        if (index === -1) {
                            message.reply('**Error:** Channel is not in watchdog list');
                            return;
                        }
                        
                        configData.watchdog.channels.splice(index, 1);
                        saveConfig(configData);
                        message.reply(`**Success:** Removed \`${removeChannelId}\` from watchdog channels`);
                    } catch (err) {
                        message.reply(`**Error:** ${err.message}`);
                        console.error('Failed to remove channel from watchdog:', err);
                    }
                    break;

                case 'fmt':
                    const format = args[2]?.toLowerCase();

                    if (!format || !['json', 'txt'].includes(format)) {
                        message.reply('**Usage:** `$pre wd fmt <json|txt>`');
                        return;
                    }
                    
                    try {
                        const configData = loadConfig();

                        configData.watchdog.format = format as "txt" | "json";
                        saveConfig(configData);
                        message.reply(`**Success:** Watchdog format set to \`${format}\` for startup`);
                    } catch (err) {
                        message.reply(`**Error:** ${err.message}`);
                        console.error('Failed to set watchdog format:', err);
                    }

                    break;

                default:
                    message.reply('**Usage:** `$pre wd <list|add|remove|fmt> [channel_id|format]`');
            }

            break;

        default:
            message.reply('**Usage:** `$pre <ns|wd> [options]`');
    }
}
