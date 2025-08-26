import { Message } from "discord.js-selfbot-v13";
import os from "os";
import fs from "fs";
import { execSync } from "child_process";

export function sysfetch(message: Message) {
    const user = os.userInfo().username;
    const hostName = os.hostname();
    let osPretty = `${os.type()} ${os.release()}`;

    try {
        const data = fs.readFileSync('/etc/os-release', 'utf8');
        const match = data.match(/^PRETTY_NAME="?(.+?)"?$/m);
        if (match) {
            osPretty = match[1];
        }
    } catch  { }

    const kernel = os.release();

    const uptimeSec = os.uptime();
    const days = Math.floor(uptimeSec / 86400);
    const hours = Math.floor((uptimeSec % 86400) / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const uptime = `${days}d ${hours}h ${minutes}m`;

    const shell = process.env.SHELL || 'N/A';

    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const loadPct = ((os.loadavg()[0] / cpus.length) * 100).toFixed(2) + '%';

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const toMB = (n: number) => (n / 1024 / 1024).toFixed(2) + 'MB';
    const memUsage = `${toMB(usedMem)}/${toMB(totalMem)} (${((usedMem/totalMem)*100).toFixed(2)}%)`;

    let disk = 'N/A';
    try {
        const df = execSync("df -h --output=used,size,pcent / | tail -1").toString().trim();
        disk = df;
    } catch { }
   
    const lines = [
        `${user}@${hostName}`,
        '-----------',
        `- OS: ${osPretty}`,
        `- Host: ${os.platform()}`,
        `- Kernel: ${kernel}`,
        `- Uptime: ${uptime}`,
        `- Shell: ${shell}`,
        `- CPU: ${cpuModel} (${loadPct})`,
        `- Memory: ${memUsage}`,
        `- Disk: ${disk}`,
    ];

    const output = lines.join('\n');

    message.reply(`\`\`\`bash
${output}
\`\`\``);
}