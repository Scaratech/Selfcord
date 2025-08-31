import { getConsoleOutput } from '../../consoleOverride.js';
import { client } from '../../client.js';
import { Message } from 'discord.js-selfbot-v13';
import { spawn } from 'child_process';


export function stopCmd(message: Message): void {
    message.reply('**Selfcord stopped**');

    setTimeout(() => {
        process.exit(0);
    }, 500);
}

export function restartCmd(message: Message): void {
    message.reply('**Selfcord restarting**');
    
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
        
        message.reply(`- **API Latency:** \`${apiLatency}ms\`\n- **WS Heartbeat:** \`${wsPing}ms\``);
    }).catch(() => {
        message.reply(`- **WS Heartbeat:** \`${wsPing}ms\`\n- **API Latency:** \`Failed to measure\``);
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
