import { Message } from "discord.js-selfbot-v13";
import { client } from "../../client.js";

export async function genFriendInv(message: Message) {
    const invite = await client.user?.createFriendInvite().catch(() => null);

    if (invite) {
        message.reply(`https://discord.gg/${invite.code}`);
    } else {
        message.reply("**Error:** Failed to create friend invite");
    }
}
