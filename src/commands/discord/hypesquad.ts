import { Message } from "discord.js-selfbot-v13";
import { createEmbed, fmtEmbed } from "../../embed.js";
import { client } from "../../client.js";

export function setHypesquad(message: Message, house: string) {
    if (house === 'bravery') {
        client.user.setHypeSquad(1);
        message.edit(fmtEmbed(message.content, createEmbed('Hypesquad', 'Hypesquad house set to bravery', '#cba6f7')));
    } else if (house === 'brilliance') {
        client.user.setHypeSquad(2);
        message.edit(fmtEmbed(message.content, createEmbed('Hypesquad', 'Hypesquad house set to brilliance', '#eba0ac')));
    } else if (house === 'balance') {
        client.user.setHypeSquad(3);
        message.edit(fmtEmbed(message.content, createEmbed('Hypesquad', 'Hypesquad house set to balance', '#a6e3a1')));
    } else if (house === '--reset') {
        client.user.setHypeSquad(0);
        message.edit(fmtEmbed(message.content, createEmbed('Hypesquad', 'Hypesquad house reset', '#cdd6f4')));
    } else {
        message.edit(fmtEmbed(message.content, createEmbed('Hypesquad - Usage', `hypesquad <brilliance | balance | bravery> [--reset]`, '#cdd6f4')));
    }
}
