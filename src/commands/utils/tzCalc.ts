import { Message } from "discord.js-selfbot-v13";
import { formatInTimeZone } from "date-fns-tz";

export function tzCalc(message: Message, tz1: string, tz2: string) {
    try {
        const now = new Date();
        const timeInTz1 = formatInTimeZone(now, tz1, "h:mm a (MM-dd-yyyy)");
        const timeInTz2 = formatInTimeZone(now, tz2, "h:mm a (MM-dd-yyyy)");
        
        const response = `**Time in** \`${tz1.toUpperCase()}\`**:** \`${timeInTz1}\`\n` +
            `**Time in** \`${tz2.toUpperCase()}\`**:** \`${timeInTz2}\``;
        
        message.reply(response);
        
    } catch {
        message.reply(`**Error:** Invalid TZ format (E.g. EST, PST, etc.)`);
    }
}