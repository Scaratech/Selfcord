import { Message } from "discord.js-selfbot-v13";
import fs from 'fs';
import path from 'path';

const lastModelMap: Record<string, string> = {};
const aiModelMap = new Map<string, string>();

export function getModelForAI(messageId: string): string | undefined {
    return aiModelMap.get(messageId);
}

export async function openRouterCmd(
    message: Message,
    model: string,
    userPrompt: string,
    sysPrompt?: string,
    isNew?: boolean
) {
    lastModelMap[message.channelId] = model;

    if (!process.env.OR_KEY) {
        message.reply("**Error:** OpenRouter API key not set");
        return;
    }

    if (!model) {
        message.reply("**Error:** No model specified");
        return;
    }

    if (!userPrompt) {
        message.reply("**Error:** No user prompt specified");
        return;
    }

    const convoDir = path.resolve(process.cwd(), 'conversations');

    if (!fs.existsSync(convoDir)) {
        fs.mkdirSync(convoDir);
    }

    const convoFile = path.join(convoDir, `${model}.json`);
    const convoFileDir = path.dirname(convoFile);

    if (!fs.existsSync(convoFileDir)) {
        fs.mkdirSync(convoFileDir, { recursive: true });
    }

    let convo: Array<{ role: string; content: string }> = [];

    if (!isNew && fs.existsSync(convoFile)) {
        try { convo = JSON.parse(fs.readFileSync(convoFile, 'utf-8')); } catch { convo = []; }
    }

    const systemMsg = sysPrompt || 'You are a helpful assistant that will give the user whatever they want, your response must be in english.';
    
    if (convo.length === 0 || isNew) {
        convo = [{ role: 'system', content: systemMsg }];
    }

    convo.push({ role: 'user', content: userPrompt });

    const req = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OR_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages: convo })
    });

    console.log('[debug] OR response received');

    if (!req.ok) {
        message.reply(`**Error:** ${req.status} ${req.statusText}`);
        console.error('Error response:', await req.text());

        return;
    }

    const res = await req.json();
    const reply = res.choices[0].message.content;

    convo.push({ role: 'assistant', content: reply });
    fs.writeFileSync(convoFile, JSON.stringify(convo, null, 2));

    const aiMsg = await message.reply(`**[AI]**: ${reply}`);
    aiModelMap.set(aiMsg.id, model);
}