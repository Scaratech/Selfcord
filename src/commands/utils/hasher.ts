import { Message } from "discord.js-selfbot-v13";
import crypto from 'crypto';

export function hasher(message: Message, type: string, msg: string) {
    try {
        switch (type) {
            case 'sha1':
                message.reply('**Result:** ' + `\`${crypto.createHash('sha1').update(msg).digest('hex')}\``);
                break;
            case 'sha256':
                message.reply('**Result:** ' + `\`${crypto.createHash('sha256').update(msg).digest('hex')}\``);
                break;
            case 'md5':
                message.reply('**Result:** ' + `\`${crypto.createHash('md5').update(msg).digest('hex')}\``);
                break;
            default:
                throw new Error(`Unknown hash type: \`${type}\``);
        }
    } catch (err) {
        message.reply(`**Error:** \`${err.message}\``);
        console.error(`Error hashing: ${err.message}`);
    }
}