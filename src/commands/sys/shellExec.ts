import { Message } from "discord.js-selfbot-v13";
import { exec } from "child_process";
import { createEmbed, fmtEmbed } from "../../embed.js";

export function shellExec(message: Message, cmd: string) {
    if (!cmd) {
        message.edit(fmtEmbed(message.content, createEmbed('SH - Usage', 'sh <command>', '#cdd6f4')));
        return;
    }

    exec(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
            message.edit(fmtEmbed(message.content, createEmbed('SH - Error', `Error executing: \`${cmd}\``, '#f38ba8')));
            console.error(`Error executing ${cmd}: ${error.message}`);
            return;
        }

        const output = stdout.length > 0 ? stdout : stderr;

        if (!output) {
            message.edit(fmtEmbed(message.content, createEmbed('SH - Info', 'No output was given', '#cdd6f4')));
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