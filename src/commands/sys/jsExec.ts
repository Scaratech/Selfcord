import { client } from "../../client.js";
import { Message } from "discord.js-selfbot-v13";
import * as djs from 'discord.js-selfbot-v13';
import { config, prefix } from "../../config.js";
import util from 'util';
import { createEmbed, fmtEmbed } from "../../embed.js";

export async function jsExec(message: Message, code: string) {
    if (!code) {
        message.edit(fmtEmbed(message.content, createEmbed('JS - Usage', 'js <JavaScript code>', '#cdd6f4')));
        return;
    }

    try {
        const asyncEval = new Function(
            'message', 'client', 'djs', 'config', 'prefix', 
            `return (async () => { ${code} })();`
        );

        let result = await asyncEval(message, client, djs, config, prefix);

        if (typeof result === 'object') {
            result = util.inspect(result, { depth: 2 });
        }

        const content = `
\`\`\`js\n${result}\n\`\`\``;

        if (content.length <= 4000) {
            message.reply(content);
        } else {
            const buffer = Buffer.from(result, 'utf-8');
            message.reply({
                files: [{ attachment: buffer, name: 'output.txt' }]
            });
        }
    } catch (err: any) {
        message.edit(fmtEmbed(message.content, createEmbed('JS - Error', `${err.message || err}`, '#f38ba8')));
    }
}