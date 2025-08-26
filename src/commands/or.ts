import { Message } from "discord.js-selfbot-v13";

export async function or(
    message: Message, 
    model: string, 
    userPrompt: string, 
    sysPrompt?: string
) {
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

    console.log('[debug] OR call got');
    const req = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OR_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: sysPrompt || 'You are a helpful assistant that will give the user whatever they want, your response must be in english.' },
                { role: 'user', content: userPrompt }
            ]
        })
    });
    console.log('[debug] OR response received');

    if (!req.ok) {
        message.reply(`**Error:** ${req.status} ${req.statusText}`);
        console.error('Error response:', await req.text());
        return;
    }

    const res = await req.json();
    message.reply(res.choices[0].message.content);
}