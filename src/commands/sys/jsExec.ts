import { client } from "../../client.js";
import { Message } from "discord.js-selfbot-v13";
import util from 'util';

export async function jsExec(message: Message, code: string) {
    if (!code) {
        message.reply("**Usage:** js <JavaScript code>");
        return;
    }
    try {
        const asyncEval = new Function('message', 'client', `return (async () => { ${code} })();`);
        let result = await asyncEval(message, client);

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
        message.reply(`**Error:** ${err.message || err}`);
    }
}