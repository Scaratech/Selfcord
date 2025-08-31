import { Message } from "discord.js-selfbot-v13";
import { config } from "../../config.js";
import { createEmbed, fmtEmbed } from "../../embed.js";

export function normalize(pn: string) {
    const cleaned = pn.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+')) {
        return cleaned.split('+')[1];
    } else {
        return cleaned;
    }
}

export async function phoneNumberLookup(message: Message, pn: string) {
    if (!pn) {
        message.edit(fmtEmbed(message.content, createEmbed('Usage', 'Usage: phone <phone_number>', '#cdd6f4')));
        return;
    }

    if (!config.apis.numverify_key) {
        message.edit(fmtEmbed(message.content, createEmbed('Error', 'Numverify API key not set', '#f38ba8')));
        return;
    }

    const num = normalize(pn);
    
    if (!num || num.length < 10) {
        message.edit(fmtEmbed(message.content, createEmbed('Error', 'Invalid phone number format', '#f38ba8')));
        return;
    }

    try {
        // https://apilayer.net/api/validate?access_key=KEY&number=NUM&country_code=&format=1
        const params = new URLSearchParams();
        params.append("access_key", config.apis.numverify_key);
        params.append("number", num);
        params.append("format", "1");
        params.append("country_code", "");

        const url = `https://apilayer.net/api/validate?${params.toString()}`;
        const req = await fetch(url);

        if (!req.ok) {
            message.edit(fmtEmbed(message.content, createEmbed('Error', `${req.status} ${req.statusText}`, '#f38ba8')));
            console.error(`Phone number lookup error: ${req.status} ${req.statusText}`);
            return;
        }

        const res = await req.json();

        if (res.error) {
            message.edit(fmtEmbed(message.content, createEmbed('Error', `${res.error.info || 'API Error'}`, '#f38ba8')));
            return;
        }

        if (!res.valid) {
            message.edit(fmtEmbed(message.content, createEmbed('Error', 'Invalid phone number', '#f38ba8')));
            return;
        }

        const content = `
- Country: ${res.country_name || 'N/A'}
- Location: ${res.location || 'N/A'}
- Carrier: ${res.carrier || 'N/A'}
- Line Type: ${res.line_type || 'N/A'}
        `;

        message.edit(fmtEmbed(message.content, createEmbed('Phone Number Info', content, '#a6e3a1')));

    } catch (err) {
        console.error('Phone lookup error:', err);
        message.edit(fmtEmbed(message.content, createEmbed('Error', 'Failed to lookup phone number', '#f38ba8')));
    }
}