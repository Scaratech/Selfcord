import { Message } from "discord.js-selfbot-v13";
import { config } from "../../config.js";

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
        message.reply("**Usage:** `phone <phone_number>`");
        return;
    }

    if (!config.apis.numverify_key) {
        message.reply("**Error:** Numverify API key not set");
        return;
    }

    const num = normalize(pn);
    
    if (!num || num.length < 10) {
        message.reply("**Error:** Invalid phone number format");
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
            message.reply(`**Error:** ${req.status} ${req.statusText}`);
            console.error(`Phone number lookup error: ${req.status} ${req.statusText}`);
            return;
        }

        const res = await req.json();

        if (res.error) {
            message.reply(`**Error:** ${res.error.info || 'API Error'}`);
            return;
        }

        if (!res.valid) {
            message.reply(`**Error:** Invalid phone number`);
            return;
        }

        message.reply(`# Phone Number Info:
- **Country:** \`${res.country_name || 'N/A'}\`
- **Location:** \`${res.location || 'N/A'}\`
- **Carrier:** \`${res.carrier || 'N/A'}\`
- **Line Type:** \`${res.line_type || 'N/A'}\``);

    } catch (err) {
        console.error('Phone lookup error:', err);
        message.reply("**Error:** Failed to lookup phone number");
    }
}