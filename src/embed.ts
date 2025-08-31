import { ColorResolvable, WebEmbed } from "discord.js-selfbot-v13";

export function createEmbed(title: string, body: string, color: string) {
    const embed = new WebEmbed()
    .setAuthor({ name: title, url: 'https://github.com/scaratech/selfcord' })
    .setColor(color as ColorResolvable)
    .setDescription(body);

    return `${WebEmbed.hiddenEmbed}${embed}`;
}

export function fmtEmbed(og: string, embed: string) {
    return `${og}${embed}`;
}
