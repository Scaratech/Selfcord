import { Message } from "discord.js-selfbot-v13";
import { Octokit } from "@octokit/rest";

import fs from 'fs';
import path from 'path';

import { config } from "../../config.js";
import { createEmbed, fmtEmbed } from "../../embed.js";

const octokit = new Octokit({
    auth: config.apis.github_token
});

export async function githubCommitCmd(message: Message, args: string[]) {
    const username = args[0];

    if (!username) {
        message.edit(fmtEmbed(message.content, createEmbed('GitHub - Error', 'No GitHub username provided', '#f38ba8')));
        return;
    }

    const commitsMap: Record<string, { email: string; name: string; commits: any[] }> = {};

    const uniqueEmails = new Set<string>();
    const uniqueNames = new Set<string>();

    let page = 1;

    while (true) {
        try {
            const res = await octokit.search.commits({ q: `author:${username}`, per_page: 100, page });

            if (res.data.items.length === 0) {
                break;
            }

            for (const item of res.data.items) {
                const email = item.commit.author.email;
                const name = item.commit.author.name;

                uniqueEmails.add(email);
                uniqueNames.add(name);

                const key = `${email}|${name}`;

                if (!commitsMap[key]) {
                    commitsMap[key] = { email, name, commits: [] };
                }

                commitsMap[key].commits.push({ 
                    sha: item.sha, 
                    message: item.commit.message, 
                    date: item.commit.author.date, 
                    repo: item.repository.full_name 
                });
            }

            page++;
        } catch (err: any) {
            message.edit(fmtEmbed(message.content, createEmbed('GitHub - Error', `${err.message}`, '#f38ba8')));
            console.error(err);
    
            return;
        }
    }

    const exportDir = path.resolve(process.cwd(), 'github');

    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    const fileName = `commits_${username}.json`;
    const filePath = path.join(exportDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(commitsMap, null, 2));

    const emailsText = Array.from(uniqueEmails).map(e => `  - ${e}`).join('\n');
    const namesText = Array.from(uniqueNames).map(n => `  - ${n}`).join('\n');
    const resultMsg = `${emailsText}\n${namesText}`;

    await message.edit({ 
        content: fmtEmbed(
            message.content,
            createEmbed('GitHub - Results', resultMsg, '#a6e3a1')
        ), 
        files: [filePath] 
    });
}
