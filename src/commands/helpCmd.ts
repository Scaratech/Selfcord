import { createEmbed, fmtEmbed } from "../embed.js";
import { Message } from "discord.js-selfbot-v13";

export function helpCmd(message: Message) {
    const content = `
    To see all commands, see: 
    - https://github.com/scaratech/selfcord/blob/main/DOCS.md
    
    Selfcord Author: scaratek.dev (on Discord)
    Selfcord Repo: https://github.com/scaratech/selfcord
    `;

    message.edit(fmtEmbed(message.content, createEmbed('Selfcord', content, '#f5c2e7')))
}
