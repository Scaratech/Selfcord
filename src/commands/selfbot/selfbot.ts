import { getConsoleOutput } from '../../consoleOverride.js';
import { client } from '../../client.js';
import { createEmbed, fmtEmbed } from '../../embed.js';
import { Message } from 'discord.js-selfbot-v13';
import { spawn } from 'child_process';


export function stopCmd(message: Message): void {
    message.edit(fmtEmbed(message.content, createEmbed('Selfcord', 'Selfcord stopped', '#cdd6f4')));

    setTimeout(() => {
        process.exit(0);
    }, 500);
}

export function restartCmd(message: Message): void {
    message.edit(fmtEmbed(message.content, createEmbed('Selfcord', 'Selfcord restarting', '#cdd6f4')));
    
    setTimeout(() => {
        client.destroy();

        const command = 'npm'
        const args = ['run', 'bstart'];
        
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            detached: true
        });
        
        child.unref();
        process.exit(0);
    }, 500);
}

export function pingCmd(message: Message): void {
    const wsPing = client.ws.ping;
    const start = Date.now();
    
    client.user?.fetch().then(() => {
        const end = Date.now();
        const apiLatency = end - start;
        
        message.edit(fmtEmbed(message.content, createEmbed('Ping', `- API Latency: ${apiLatency}ms\n- WS Heartbeat: ${wsPing}ms`, '#a6e3a1')));
    }).catch(() => {
        message.edit(fmtEmbed(message.content, createEmbed('Ping', `- WS Heartbeat: ${wsPing}ms\n- API Latency: Failed to measure`, '#f38ba8')));
    });
}

export function consoleCmd(message: Message): void {
    const consoleOutput = getConsoleOutput();
    const buffer = Buffer.from(consoleOutput, 'utf-8');
    
    message.reply({
        files: [{
            attachment: buffer,
            name: `console-${Date.now()}.txt`
        }]
    });
}
