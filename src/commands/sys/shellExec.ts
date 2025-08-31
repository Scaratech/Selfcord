import { Message } from "discord.js-selfbot-v13";
import { exec } from "child_process";
import { createEmbed, fmtEmbed } from "../../embed.js";

export function shellExec(message: Message, cmd: string) {
    if (!cmd) {
        message.edit(fmtEmbed(message.content, createEmbed('Usage', 'Usage: $sh <command>', '#cdd6f4')));
        return;
    }

    exec(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
            message.reply(`**Error executing:** \`${cmd}\``);
            console.error(`Error executing ${cmd}: ${error.message}`);
            return;
        }

        const output = stdout.length > 0 ? stdout : stderr;

        if (!output) {
            message.reply("**No output was given**");
            return;
        }

        const content = `**Command output**:
\`\`\`bash
${output}
\`\`\``;

        if (content.length <= 4000) {
            message.reply(content);
        } else {
            const buffer = Buffer.from(output, 'utf-8');
            message.reply({
                files: [{ attachment: buffer, name: 'output.txt' }]
            });
        }
    });
}