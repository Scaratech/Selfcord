import { Message, Client } from "discord.js-selfbot-v13";
import fs from "fs";
import path from "path";
import { createEmbed, fmtEmbed } from "../../embed.js";

interface MessageLog {
    id: string;
    author: string;
    authorId: string;
    timestamp: number;
    content: string;
    state: 'sent' | 'deleted' | 'edited';
    editNumber?: number;
    previousContent?: string;
}

interface WatchSession {
    channelId: string;
    format: 'txt' | 'json';
    messages: Map<string, MessageLog>;
    editCounts: Map<string, number>;
    filePath: string;
    isActive: boolean;
}

const watchSessions = new Map<string, WatchSession>();

export async function watchChannel(message: Message, channelId: string, format: 'txt' | 'json') {
    try {
        if (!['txt', 'json'].includes(format)) {
            return message.edit(fmtEmbed(message.content, createEmbed('Usage', 'Usage: $wd <CHANNEL_ID> <txt | json> [--stop | --list]', '#cdd6f4')));
        }

        if (watchSessions.has(channelId)) {
            const session = watchSessions.get(channelId)!;

            if (session.isActive) {
                return message.edit(fmtEmbed(message.content, createEmbed('Already watching channel', `Already watching channel <#${channelId}>`, '#a6e3a1')));
            }
        }

        const channel = await message.client.channels.fetch(channelId);

        if (!channel || !('messages' in channel)) {
            return message.edit(fmtEmbed(message.content, createEmbed('Error', 'Invalid channel ID', '#f38ba8')));
        }

        const watchDir = path.resolve(process.cwd(), 'watchs');

        if (!fs.existsSync(watchDir)) {
            fs.mkdirSync(watchDir, { recursive: true });
        }

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/[\/\\]/g, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${channelId}-${timezone}-${timestamp}.${format}`;
        const filePath = path.join(watchDir, filename);

        const session: WatchSession = {
            channelId,
            format,
            messages: new Map(),
            editCounts: new Map(),
            filePath,
            isActive: true
        };

        watchSessions.set(channelId, session);

        await saveWatchData(session);

        await message.edit(fmtEmbed(message.content, createEmbed('Started watching channel', `Started watching channel <#${channelId}> as ${format}`, '#a6e3a1')));

    } catch (err) {
        console.error('Watch error:', err);
        await message.edit(fmtEmbed(message.content, createEmbed('Error', 'Failed to start watching channel', '#f38ba8')));
    }
}

export function stopWatch(message: Message, channelId: string) {
    const session = watchSessions.get(channelId);

    if (!session || !session.isActive) {
        return message.edit(fmtEmbed(message.content, createEmbed('Not watching this channel', 'Not watching this channel', '#a6e3a1')));
    }

    session.isActive = false;
    watchSessions.delete(channelId);
    
    saveWatchData(session);
    message.edit(fmtEmbed(message.content, createEmbed('Stopped watching', `Stopped watching <#${channelId}>`, '#a6e3a1')));
}


export async function saveWatchData(session: WatchSession) {
    try {
        const messages = Array.from(session.messages.values());
        
        if (session.format === 'json') {
            const data = {
                channelId: session.channelId,
                timestamp: new Date().toISOString(),
                totalMessages: messages.length,
                messages: messages
            };

            fs.writeFileSync(session.filePath, JSON.stringify(data, null, 2), 'utf-8');
        } else {
            const lines = messages.map(msg => {
                const timestamp = new Date(msg.timestamp).toLocaleString();
                const stateInfo = msg.state === 'edited' ? ` (edit #${msg.editNumber})` : 
                                 msg.state === 'deleted' ? ' (deleted)' : '';
                const content = msg.state === 'deleted' ? '[DELETED]' : msg.content;
                
                return `[${timestamp}] ${msg.author}${stateInfo}: ${content}`;
            });

            fs.writeFileSync(session.filePath, lines.join('\n'), 'utf-8');
        }
    } catch (err) {
        console.error('Error saving watch data:', err);
    }
}

export function getActiveWatches(): string[] {
    return Array.from(watchSessions.keys()).filter(id => watchSessions.get(id)?.isActive);
}

export function getWatchSession(channelId: string): WatchSession | undefined {
    return watchSessions.get(channelId);
}

export async function startWatchSession(client: Client, channelId: string, format: 'txt' | 'json' = 'txt') {
    try {
        if (watchSessions.has(channelId)) {
            const session = watchSessions.get(channelId)!;

            if (session.isActive) {
                return false;
            }
        }

        const channel = await client.channels.fetch(channelId);

        if (!channel || !('messages' in channel)) {
            return false;
        }

        const watchDir = path.resolve(process.cwd(), 'watchs');

        if (!fs.existsSync(watchDir)) {
            fs.mkdirSync(watchDir, { recursive: true });
        }

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/[\/\\]/g, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${channelId}-${timezone}-${timestamp}.${format}`;
        const filePath = path.join(watchDir, filename);

        const session: WatchSession = {
            channelId,
            format,
            messages: new Map(),
            editCounts: new Map(),
            filePath,
            isActive: true
        };

        watchSessions.set(channelId, session);
        await saveWatchData(session);
        return true;

    } catch (err) {
        console.error('Auto-watch error:', err);
        return false;
    }
}
