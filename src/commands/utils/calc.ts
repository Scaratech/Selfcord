import { createEmbed, fmtEmbed } from "../../embed.js";
import { Message } from "discord.js-selfbot-v13";

export function calc(message: Message, expr: string) {
    if (!expr) {
        message.edit(fmtEmbed(message.content, createEmbed('Usage', 'Usage: $calc <expression>', '#cdd6f4')));
        return;
    }

    try {
        const result = eval(expr);
        message.edit(fmtEmbed(message.content, createEmbed('Calculator', `${result}`, '#a6e3a1')));
    } catch (err) {
        message.edit(fmtEmbed(message.content, createEmbed('Error', `${err.message}`, '#f38ba8')));
        console.error(`Error calculating: ${err.message}`);
    }
}
