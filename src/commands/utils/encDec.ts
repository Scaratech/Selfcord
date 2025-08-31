import { createEmbed, fmtEmbed } from "../../embed.js";
import { Message } from "discord.js-selfbot-v13";

type Type = 'b64' | 'uri' | 'hex';

function encode(type: Type, msg: string) {
    switch (type) {
        case 'b64':
            return Buffer.from(msg, 'utf-8').toString('base64');
        case 'uri':
            return encodeURIComponent(msg);
        case 'hex':
            return Buffer.from(msg, 'utf-8').toString('hex');
        default:
            throw new Error(`Unknown encoding type: ${type}`);
    }
}

function decode(type: Type, msg: string) {
    switch (type) {
        case 'b64':
            return Buffer.from(msg, 'base64').toString('utf-8');
        case 'uri':
            return decodeURIComponent(msg);
        case 'hex':
            return Buffer.from(msg, 'hex').toString('utf-8');
        default:
            throw new Error(`Unknown decoding type: ${type}`);
    }
}

export function edHandler(
    message: Message,
    type:  'encoded' | 'decode',
    target: Type,
    msg: string
) {
    try {
        if (type === 'encoded') {
            message.edit(fmtEmbed(message.content, createEmbed('Encoded', `${encode(target, msg)}`, '#a6e3a1')));
        } else {
            message.edit(fmtEmbed(message.content, createEmbed('Decoded', `${decode(target, msg)}`, '#a6e3a1')));
        }
    } catch (error: any) {
        message.edit(fmtEmbed(message.content, createEmbed('Error', `${error.message}`, '#f38ba8')));
        console.error(`Error encoding/decoding: ${error.message}`);
    }
}
