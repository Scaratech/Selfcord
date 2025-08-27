import { Message } from "discord.js-selfbot-v13";
import axios from "axios";

let nsStatus: boolean | null = null;

function init(): boolean {
    if (nsStatus === null) {
        nsStatus = String(process.env.NITRO_SNIPER).trim().toLowerCase() === 'true';
    }

    return nsStatus;
}

export function isEnabled(): boolean {
    const status = init();;
    return status;
}

export function nitroSniper(message: Message, status: string) {
    init();
    
    if (status === undefined) {
        message.reply('**Usage:** `ns <on|off>`\n**Current status:** ' + (nsStatus ? 'Enabled' : 'Disabled'));
        return;
    }

    if (status === 'on') {
        nsStatus = true;
    } else if (status === 'off') {
        nsStatus = false;
    } else {
        message.reply('**Usage:** `nitro <on|off>`');
        return;
    }

    if (nsStatus) {
        message.reply('**Nitro sniper toggled:** `on`');
    } else {
        message.reply('**Nitro sniper toggled:** `off`');
    }
}

export async function attemptSnipe(message: Message, giftCode: string): Promise<void> {
    if (!init()) return;

    try {
        console.log(`Attempting to snipe Nitro gift: ${giftCode}`);
        
        const response = await axios.post(
            `https://discord.com/api/v9/entitlements/gift-codes/${giftCode}/redeem`,
            {},
            {
                headers: {
                    'Authorization': message.client.token,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        if (response.status === 200) {
            (console as any).success(`Successfully sniped Nitro gift: ${giftCode}`);
        }
    } catch (err) {
        if (err.response?.status === 400) {
            console.warn(`Nitro gift already redeemed or invalid: ${giftCode}`);
        } else if (err.response?.status === 404) {
            console.warn(`Nitro gift not found: ${giftCode}`);
        } else {
            console.error(`Failed to snipe Nitro gift ${giftCode}: ${err.message}`);
        }
    }
}

export function extractCode(content: string): string[] {
    const giftRegex = /(?:https?:\/\/)?(?:www\.)?(?:discord\.com\/gifts\/|discord\.gg\/|discordapp\.com\/gifts\/)([a-zA-Z0-9]{16,24})/g;
    const matches = [];
    let match;
    
    while ((match = giftRegex.exec(content)) !== null) {
        matches.push(match[1]);
    }
    
    return matches;
}
