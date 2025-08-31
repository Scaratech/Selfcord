import { Message } from "discord.js-selfbot-v13";

export function spammer(message: Message, amount: number, msg: string) {
    if (!amount || !message) {
        message.reply("**Usage:** `spam <amount> <message>`");
        return;
    }

    for (let i = 0; i < amount; i++) {
        message.channel.send(msg);
    }
}
