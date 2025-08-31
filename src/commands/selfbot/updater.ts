import { config, Config } from '../../config.js';
import { createEmbed, fmtEmbed } from '../../embed.js';
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
                message.edit(fmtEmbed(message.content, createEmbed('Shared Users', 'No shared users configured', '#f38ba8')));
            } else {
                const userList = currentConfig.shared.map(id => `- ${id}`).join('\n');
                message.edit(fmtEmbed(message.content, createEmbed('Shared Users', `Shared Users:\n${userList}`, '#a6e3a1')));
            }

            break;

        case 'add':
            const userId = args[1];

            if (!userId) {
                message.edit(fmtEmbed(message.content, createEmbed('Usage', 'Usage: $shared add <user_id>', '#cdd6f4')));
                return;
            }
            
            try {
                const configData = loadConfig();

                if (configData.shared.includes(userId)) {
                    message.edit(fmtEmbed(message.content, createEmbed('Error', 'User is already shared', '#f38ba8')));
                    return;
                }
                
                configData.shared.push(userId);
                saveConfig(configData);

                config.shared.push(userId);
                
                message.edit(fmtEmbed(message.content, createEmbed('Added', `Added ${userId} to shared users`, '#a6e3a1')));
            } catch (err) {
                message.edit(fmtEmbed(message.content, createEmbed('Error', `Error: ${err.message}`, '#f38ba8')));
                console.error('Failed to add user to shared users:', err);
            }
            break;

        case 'remove':
            const removeUserId = args[1];

            if (!removeUserId) {
                message.edit(fmtEmbed(message.content, createEmbed('Usage', 'Usage: $shared remove <user_id>', '#cdd6f4')));
                return;
            }
            
            try {
                const configData = loadConfig();
                const index = configData.shared.indexOf(removeUserId);

                if (index === -1) {
                    message.edit(fmtEmbed(message.content, createEmbed('Error', 'User is not in shared list', '#f38ba8')));
                    return;
                }
                
                configData.shared.splice(index, 1);
                saveConfig(configData);
                
                const runtimeIndex = config.shared.indexOf(removeUserId);

                if (runtimeIndex !== -1) {
                    config.shared.splice(runtimeIndex, 1);
                }
                
                message.edit(fmtEmbed(message.content, createEmbed('Removed', `Removed: ${removeUserId} from shared users`, '#a6e3a1')));
            } catch (err) {
                message.edit(fmtEmbed(message.content, createEmbed('Error', `Error: ${err.message}`, '#f38ba8')));
                console.error('Failed to remove user from shared users:', err);
            }

            break;

        default:
            message.edit(fmtEmbed(message.content, createEmbed('Usage', 'Usage: $shared <list | add | remove> [user_id]', '#cdd6f4')));
    }
}

export async function preCmd(message: Message, args: string[]): Promise<void> {
    const subCommand = args[0]?.toLowerCase();

    switch (subCommand) {
        case 'ns':
            const nsStatus = args[1]?.toLowerCase();

            if (!nsStatus || !['on', 'off'].includes(nsStatus)) {
                message.edit(fmtEmbed(message.content, createEmbed('Usage', 'Usage: $pre ns <on|off>', '#cdd6f4')));
                return;
            }
            
            try {
                const configData = loadConfig();
                configData.nitro_sniper = nsStatus === 'on';

                saveConfig(configData);
                message.edit(fmtEmbed(message.content, createEmbed('Nitro Sniper', `Nitro sniper ${nsStatus === 'on' ? 'enabled' : 'disabled'} on startup`, '#a6e3a1')));
            } catch (err) {
                message.edit(fmtEmbed(message.content, createEmbed('Error', `Error: ${err.message}`, '#f38ba8')));
                console.error('Failed to toggle nitro sniper:', err);
            }
            break;

        case 'wd':
            const wdSubCommand = args[1]?.toLowerCase();
            
            switch (wdSubCommand) {
                case 'list':
                    const wdConfig = loadConfig();

                    if (wdConfig.watchdog.channels.length === 0) {
                        message.edit(fmtEmbed(message.content, createEmbed('Watchdog', 'No watchdog channels configured', '#f38ba8')));
                    } else {
                        const channelList = wdConfig.watchdog.channels.map(id => `- ${id}`).join('\n');
                        message.edit(fmtEmbed(message.content, createEmbed('Watchdog', `Watchdog Channels:\n${channelList}\n\nFormat: ${wdConfig.watchdog.format}`, '#a6e3a1')));
                    }

                    break;

                case 'add':
                    const channelId = args[2];

                    if (!channelId) {
                        message.edit(fmtEmbed(message.content, createEmbed('Watchdog - Usage', 'Usage: $pre wd add <channel_id>', '#cdd6f4')));
                        return;
                    }
                    
                    try {
                        const configData = loadConfig();

                        if (configData.watchdog.channels.includes(channelId)) {
                            message.edit(fmtEmbed(message.content, createEmbed('Watchdog - Error', 'Channel is already in watchdog list', '#f38ba8')));
                            return;
                        }
                        
                        configData.watchdog.channels.push(channelId);
                        saveConfig(configData);
                        message.edit(fmtEmbed(message.content, createEmbed('Watchdog', `Added: ${channelId} to watchdog channels`, '#a6e3a1')));
                    } catch (err) {
                        message.edit(fmtEmbed(message.content, createEmbed('Watchdog - Error', `Error: ${err.message}`, '#f38ba8')));
                        console.error('Failed to add channel to watchdog:', err);
                    }

                    break;

                case 'remove':
                    const removeChannelId = args[2];

                    if (!removeChannelId) {
                        message.edit(fmtEmbed(message.content, createEmbed('Watchdog - Usage', 'Usage: $pre wd remove <channel_id>', '#cdd6f4')));
                        return;
                    }
                    
                    try {
                        const configData = loadConfig();
                        const index = configData.watchdog.channels.indexOf(removeChannelId);

                        if (index === -1) {
                            message.edit(fmtEmbed(message.content, createEmbed('Watchdog', 'Channel is not in watchdog list', '#f38ba8')));
                            return;
                        }
                        
                        configData.watchdog.channels.splice(index, 1);
                        saveConfig(configData);
                        message.edit(fmtEmbed(message.content, createEmbed('Watchdog', `Removed ${removeChannelId} from watchdog channels`, '#a6e3a1')));
                    } catch (err) {
                        message.edit(fmtEmbed(message.content, createEmbed('Watchdog - Error', `Error: ${err.message}`, '#f38ba8')));
                        console.error('Failed to remove channel from watchdog:', err);
                    }
                    break;

                case 'fmt':
                    const format = args[2]?.toLowerCase();

                    if (!format || !['json', 'txt'].includes(format)) {
                        message.edit(fmtEmbed(message.content, createEmbed('Watchdog - Usage', 'Usage: $pre wd fmt <json | txt>', '#cdd6f4')));
                        return;
                    }
                    
                    try {
                        const configData = loadConfig();

                        configData.watchdog.format = format as "txt" | "json";
                        saveConfig(configData);
                        message.edit(fmtEmbed(message.content, createEmbed('Watchdog', `Watchdog format set to ${format} for startup`, '#a6e3a1')));
                    } catch (err) {
                        message.edit(fmtEmbed(message.content, createEmbed('Watchdog - Error', `Error: ${err.message}`, '#f38ba8')));
                        console.error('Failed to set watchdog format:', err);
                    }

                    break;

                default:
                    message.edit(fmtEmbed(message.content, createEmbed('Watchdog - Usage', 'Usage: $pre wd <list | add | remove | fmt> [channel_id|format]', '#cdd6f4')));
            }

            break;

        default:
            message.edit(fmtEmbed(message.content, createEmbed('Watchdog - Usage', 'Usage: $pre <ns | wd> [options]', '#cdd6f4')));
    }
}
