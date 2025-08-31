import { Message } from "discord.js-selfbot-v13";
import { createEmbed, fmtEmbed } from "../../embed.js";

export function spammer(message: Message, amount: number, msg: string) {
    if (!amount || !message) {
        message.edit(fmtEmbed(message.content, createEmbed('Spammer - Usage', 'spam <amount> <message>', '#cdd6f4')));
        return;
    }

    for (let i = 0; i < amount; i++) {
        message.channel.send(msg);
    }
}
