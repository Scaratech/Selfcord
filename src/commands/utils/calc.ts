import { Message } from "discord.js-selfbot-v13";

export function calc(message: Message, expr: string) {
    if (!expr) {
        message.reply("**Usage:** `calc <expression>`");
        return;
    }

    try {
        const result = eval(expr);
        message.reply(`**Result:** \`${result}\``);
    } catch (err) {
        message.reply(`**Error:** \`${err.message}\``);
        console.error(`Error calculating: ${err.message}`);
    }
}
