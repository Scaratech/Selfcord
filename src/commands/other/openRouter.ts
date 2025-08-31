import { Message } from "discord.js-selfbot-v13";

import fs from 'fs';
import path from 'path';

import { config } from "../../config.js";

const lmm: Record<string, string> = {};
const aimm = new Map<string, string>();

const convoDir = path.resolve(process.cwd(), 'conversations');
const lmmFile = path.join(convoDir, '.last_model_map.json');
const aimmFile = path.join(convoDir, '.ai_model_map.json');

function loadPersistance() {
    if (!fs.existsSync(convoDir)) {
        fs.mkdirSync(convoDir, { recursive: true });
    }

    if (fs.existsSync(lmmFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(lmmFile, 'utf-8'));
            Object.assign(lmm, data);
        } catch (err) {
            console.error('Failed to load lmm:', err);
        }
    }

    if (fs.existsSync(aimmFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(aimmFile, 'utf-8'));

            for (const [key, value] of Object.entries(data)) {
                aimm.set(key, value as string);
            }
        } catch (err) {
            console.error('Failed to load aimm:', err);
        }
    }
}

function savePersistance() {
    try {
        fs.writeFileSync(lmmFile, JSON.stringify(lmm, null, 2));
        fs.writeFileSync(aimmFile, JSON.stringify(Object.fromEntries(aimm), null, 2));
    } catch (err) {
        console.error('Failed to save persisted data:', err);
    }
}

loadPersistance();

export function getModel(messageId: string): string | undefined {
    return aimm.get(messageId);
}

export function getLastModel(channelId: string): string | undefined {
    return lmm[channelId];
}

export async function openRouterCmd(
    message: Message,
    model: string,
    userPrompt: string,
    sysPrompt?: string,
    isNew?: boolean
) {
    lmm[message.channelId] = model;
    savePersistance();

    if (!config.apis.openrouter_key) {
        message.reply("**err:** OpenRouter API key not set");
        return;
    }

    if (!model) {
        message.reply("**err:** No model specified");
        return;
    }

    if (!userPrompt) {
        message.reply("**err:** No user prompt specified");
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

    if (sysPrompt) convo.push({ role: 'system', content: systemMsg })
    convo.push({ role: 'user', content: userPrompt });

    const req = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.apis.openrouter_key}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages: convo })
    });

    console.log('[debug] OR response received');

    if (!req.ok) {
        message.reply(`**err:** ${req.status} ${req.statusText}`);
        console.error('err response:', await req.text());

        return;
    }

    const res = await req.json();
    const reply = res.choices[0].message.content;

    convo.push({ role: 'assistant', content: reply });
    fs.writeFileSync(convoFile, JSON.stringify(convo, null, 2));

    const aiMsg = await message.reply(`**[AI]**: ${reply}`);
    aimm.set(aiMsg.id, model);

    savePersistance();
}