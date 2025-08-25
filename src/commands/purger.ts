import { Message, Collection } from "discord.js-selfbot-v13";
import { client } from "../client.js";

type PurgeTarget = 'at' | number;

export async function purger(message: Message, target: string, shadow: boolean = false): Promise<void> {
    try {
        const parsedTarget = parseTarget(target);
        
        if (parsedTarget === null) {
            if (!shadow) {
                await message.reply('Usage: purge <num>|at [--shadow]');
            }
            return;
        }

        if (parsedTarget === 'at') {
            await purgeAllMessages(message, shadow);
        } else {
            await purgeNumericMessages(message, parsedTarget, shadow);
        }
    } catch (error) {
        console.error('Purge error:', error);

        if (!shadow) {
            await message.channel.send('**Failed to purge messages**');
        }
    }
}

function parseTarget(target: string): PurgeTarget | null {
    if (target === 'at') {
        return 'at';
    }
    
    const num = parseInt(target, 10);
    if (!isNaN(num) && num > 0) {
        return num;
    }
    
    return null;
}

async function purgeAllMessages(message: Message, shadow: boolean): Promise<void> {
    let totalDeleted = 0;
    let fetched: Collection<string, Message>;

    do {
        fetched = await message.channel.messages.fetch({ limit: 100 });
        const myMessages = fetched.filter(
            (m: Message) => m.author.id === client.user?.id && !m.system && !m.pinned
        );

        for (const msg of myMessages.values()) {
            try {
                await msg.delete();
                totalDeleted++;
            } catch { }
        }
    } while (fetched.size === 100);

    if (!shadow) {
        await message.channel.send(`**Purged ${totalDeleted} messages**`);
    }
}

async function purgeNumericMessages(message: Message, count: number, shadow: boolean): Promise<void> {
    const fetched = await message.channel.messages.fetch({ limit: count + 1 });
    const myMsgs = fetched
        .filter((m: Message) => m.author.id === client.user?.id && !m.system && !m.pinned)
        .first(count);

    let deletedCount = 0;
    for (const msg of myMsgs) {
        try {
            await msg.delete();
            deletedCount++;
        } catch { }
    }

    if (!shadow) {
        await message.channel.send(`**Purged ${deletedCount} messages**`);
    }
}
