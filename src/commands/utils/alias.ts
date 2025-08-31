import { Message } from 'discord.js-selfbot-v13';
import fs from 'fs';
import path from 'path';

const aliasPath = path.resolve(process.cwd(), '.aliases.json');

type entry = {
    value: string;
    usePrefix: boolean;
};

type AliasMap = Record<string, entry | string>;

function loadAliases(): AliasMap {
    if (!fs.existsSync(aliasPath)) {
        return {};
    }

    try {
        const data = fs.readFileSync(aliasPath, 'utf-8');
        return JSON.parse(data) as AliasMap;
    } catch {
        return {};
    }
}

function saveAliases(map: AliasMap) {
    fs.writeFileSync(aliasPath, JSON.stringify(map, null, 2));
}

export async function aliasCmd(message: Message, args: string[]) {
    const nFlagIndex = args.indexOf('-n');
    const noPrefix = nFlagIndex !== -1;
    
    if (noPrefix) {
        args.splice(nFlagIndex, 1);
    }
    
    const name = args[0];

    if (!name) {
        message.reply('**Error:** No alias name provided');
        return;
    }

    const raw = message.content.trim();
    let cmdStart = raw.indexOf('alias') + 'alias'.length;

    if (noPrefix) {
        const flagPos = raw.indexOf('-n', cmdStart);

        if (flagPos !== -1) {
            cmdStart = flagPos + 2;
        }
    }
    
    const namePos = raw.indexOf(name, cmdStart);
    let startI = namePos + name.length;
    let val = raw.slice(startI).trim();

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
    }

    if (!val) {
        message.reply('**Error:** No alias value provided');
        return;
    }

    const map = loadAliases();
    map[name] = {
        value: val,
        usePrefix: !noPrefix
    };

    saveAliases(map);

    const prefixNote = noPrefix ? ' (no prefix)' : ' (with prefix)';
    message.reply(`**Alias set:** \`${name}\` -> \`${val}\`${prefixNote}`);
}

export async function invokeAlias(message: Message, command: string): Promise<boolean> {
    const map = loadAliases();
    const entry = map[command];

    if (!entry) {
        return false;
    }

    let value: string;
    let shouldPrefix: boolean;
    
    if (typeof entry === 'string') {
        value = entry;
        shouldPrefix = true;
    } else {
        value = entry.value;
        shouldPrefix = entry.usePrefix;
    }

    await message.edit(value);
    return true;
}

export function processer(content: string): boolean {
    const map = loadAliases();
    const firstWord = content.trim().split(/\s+/)[0];
    const entry = map[firstWord];
    
    if (!entry) {
        return false;
    }

    if (typeof entry === 'string') {
        return false;
    }
    
    return !entry.usePrefix;
}
