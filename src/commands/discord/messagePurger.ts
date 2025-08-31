import { Message, Collection } from "discord.js-selfbot-v13";
import { client } from "../../client.js";
import { createEmbed, fmtEmbed } from "../../embed.js";

type PurgeTarget = 'at' | number;

export async function messasgePurger(message: Message, target: string, shadow: boolean = false): Promise<void> {
    try {
        const parsedTarget = parseTarget(target);
        
        if (parsedTarget === null) {
            if (!shadow) {
                await message.edit(fmtEmbed(message.content, createEmbed('Purger - Usage', 'purge <num>|at [--shadow]', '#cdd6f4')));
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
            try {
                await message.edit(fmtEmbed(message.content, createEmbed('Purger - Error', 'Failed to purge messages', '#f38ba8')));
            } catch (editError) {
                console.error('Failed to edit error message:', editError);
            }
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
    let hasMore = true;

    while (hasMore) {
        try {
            const fetched = await message.channel.messages.fetch({ limit: 100 });
            const myMessages = fetched.filter(
                (m: Message) => m.author.id === client.user?.id && !m.system && !m.pinned
            );

            if (myMessages.size === 0) {
                hasMore = false;
                break;
            }

            const deletePromises = myMessages.map(msg => 
                msg.delete().catch(() => null)
            );
            
            const results = await Promise.allSettled(deletePromises);
            const deleted = results.filter(result => result.status === 'fulfilled').length;
            totalDeleted += deleted;

            if (fetched.size < 100) {
                hasMore = false;
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error('Error during bulk delete:', error);
            hasMore = false;
        }
    }

    if (!shadow) {
        try {
            await message.edit(fmtEmbed(message.content, createEmbed('Purger', `Purged ${totalDeleted} messages`, '#a6e3a1')));
        } catch (editError) {
            console.error('Failed to edit success message:', editError);
        }
    }
}

async function purgeNumericMessages(message: Message, count: number, shadow: boolean): Promise<void> {
    try {
        const fetched = await message.channel.messages.fetch({ limit: count + 1 });
        const myMsgs = fetched
            .filter((m: Message) => m.author.id === client.user?.id && !m.system && !m.pinned)
            .first(count);

        if (myMsgs.length === 0) {
            if (!shadow) {
                await message.edit(fmtEmbed(message.content, createEmbed('Purger', 'No messages found to purge', '#cdd6f4')));
            }
            return;
        }

        const deletePromises = myMsgs.map(msg => 
            msg.delete().catch(() => null)
        );
        
        const results = await Promise.allSettled(deletePromises);
        const deletedCount = results.filter(result => result.status === 'fulfilled').length;

        if (!shadow) {
            await message.edit(fmtEmbed(message.content, createEmbed('Purger', `Purged ${deletedCount} messages`, '#a6e3a1')));
        }
    } catch (error) {
        console.error('Error during numeric purge:', error);
        if (!shadow) {
            try {
                await message.edit(fmtEmbed(message.content, createEmbed('Purger - Error', 'Failed to purge messages', '#f38ba8')));
            } catch (editError) {
                console.error('Failed to edit error message:', editError);
            }
        }
    }
}
