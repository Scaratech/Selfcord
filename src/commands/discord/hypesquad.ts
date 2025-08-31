import { Message } from "discord.js-selfbot-v13";
import { client } from "../../client.js";

export function setHypesquad(message: Message, house: string) {
    if (house === 'bravery') {
        client.user.setHypeSquad(1);
    } else if (house === 'brilliance') {
        message.reply("**Hypesquad house set to:** `brilliance`");
        client.user.setHypeSquad(2);
    } else if (house === 'balance') {
        message.reply("**Hypesquad house set to:** `balance`");
        client.user.setHypeSquad(3);
        message.reply("**Hypesquad house set to:** `balance`");
    } else if (house === '--reset') {
        client.user.setHypeSquad(0);
        message.reply("**Hypesquad house reset**");
    } else {
        message.reply("**Usage:** `$hypesquad <<brilliance | balance | bravery> | --reset>`");
        return;
    }
}
