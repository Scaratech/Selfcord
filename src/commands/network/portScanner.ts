import { createConnection, Socket } from 'net';
import { Message } from "discord.js-selfbot-v13";
import { createEmbed, fmtEmbed } from "../../embed.js";

export async function portChecker(
    ip: string,
    port: number,
    timeout: number = 3000
): Promise<boolean> {
    return new Promise((resolve) => {
        const socket: Socket = createConnection({ port, host: ip, timeout });

        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });

        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
    });
}

export async function portScanner(
    message: Message,
    target: string,
    ports: number[],
    timeout: number = 3000
) {
    if (!target || !ports) {
        message.edit(fmtEmbed(message.content, createEmbed('Port Scanner - Usage', 'ps <ip> <?timeout> [ports]', '#cdd6f4')));
        return;
    }

    let msg = await message.reply('**Scanning...**');
    const results = [];

    for (const port of ports) {
        const isOpen = await portChecker(target, port);
        results.push(`- Port ${port}: ${isOpen ? 'open' : 'closed'}`);
    }

    const replyContent = `${results.join('\n')}`;
    await message.edit(fmtEmbed(message.content, createEmbed('Port Scanner', replyContent, '#a6e3a1')));
    await msg.delete();
}