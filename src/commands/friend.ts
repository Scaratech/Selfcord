import { Message } from "discord.js-selfbot-v13";
import { client } from "../client.js";

export async function friend(message: Message) {
    const invite = await client.user?.createFriendInvite().catch(() => null);

    if (invite) {
        message.reply(`**Friend invite:** https://discord.gg/${invite.code}`);
    } else {
        message.reply("**Failed to create friend invite**");
    }
}