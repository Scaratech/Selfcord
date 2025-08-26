import { Octokit } from "@octokit/rest";
import fs from 'fs';
import path from 'path';
import { Message } from "discord.js-selfbot-v13";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});


export async function githubCommitCmd(message: Message, args: string[]) {
    const username = args[0];

    if (!username) {
        message.reply("**Error:** No GitHub username provided");
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
            message.reply(`**Error fetching commits:** ${err.message}`);
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
    const resultMsg = `**Results:**\n- Unique emails:\n${emailsText}\n- Unique names:\n${namesText}`;

    await message.reply({ content: resultMsg, files: [filePath] });
}
