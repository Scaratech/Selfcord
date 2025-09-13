import { Message } from "discord.js-selfbot-v13";
import { createEmbed, fmtEmbed } from "../../embed.js";

function f2c(temp: string) {
    const f = parseFloat(temp);
    const c = (f - 32) * (5 / 9);

    return c.toFixed(1);
}

function c2f(temp: string) {
    const c = parseFloat(temp);
    const f = (c * 9 / 5) + 32;

    return f.toFixed(1);
}

export function tempCalc(message: Message, type: string, temp: string) {
    if (type === 'f2c') {
        message.edit(fmtEmbed(message.content, createEmbed('Temperature', `${temp}°F = ${f2c(temp)}°C`, '#a6e3a1')));
    } else if (type === 'c2f') {
        message.edit(fmtEmbed(message.content, createEmbed('Temperature', `${temp}°C = ${c2f(temp)}°F`, '#a6e3a1')));
    } else {
        message.edit(fmtEmbed(message.content, createEmbed('Temperature - Usage', 'temp <f2c | c2f> <temp>', '#cdd6f4')));
    }
}