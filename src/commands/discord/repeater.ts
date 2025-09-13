import { Message } from "discord.js-selfbot-v13";
import { createEmbed, fmtEmbed } from "../../embed.js";

export async function repeater(message: Message, amount: number, delay: number, msg: string) {
    if (!amount || !delay || !msg) {
        message.edit(fmtEmbed(message.content, createEmbed('Repeater - Usage', 'repeat <amount> <delay> <msg>', '#cdd6f4')));
        return;
    }

    for (let i = 0; i < amount; i++) {
        await message.channel.send(msg);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}