import { Message } from "discord.js-selfbot-v13";
import { createEmbed, fmtEmbed } from "../../embed.js";
import crypto from 'crypto';

export function hasher(message: Message, type: string, msg: string) {
    try {
        switch (type) {
            case 'sha1':
                message.edit(fmtEmbed(message.content, createEmbed('Hashed', `${crypto.createHash('sha1').update(msg).digest('hex')}`, '#a6e3a1')));
                break;
            case 'sha256':
                message.edit(fmtEmbed(message.content, createEmbed('Hashed', `${crypto.createHash('sha256').update(msg).digest('hex')}`, '#a6e3a1')));
                break;
            case 'md5':
                message.edit(fmtEmbed(message.content, createEmbed('Hashed', `${crypto.createHash('md5').update(msg).digest('hex')}`, '#a6e3a1')));
                break;
            default:
                throw new Error(`Unknown hash type: \`${type}\``);
        }
    } catch (err) {
        message.edit(fmtEmbed(message.content, createEmbed('Error', `${err.message}`, '#f38ba8')));
        console.error(`Error hashing: ${err.message}`);
    }
}