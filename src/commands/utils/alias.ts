import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { Message } from 'discord.js-selfbot-v13';

const aliasPath = path.resolve(process.cwd(), '.aliases.json');
const PREFIX = process.env.PREFIX || '$sc';

type AliasMap = Record<string, string>;

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
    const name = args[0];

    if (!name) {
        message.reply('**Error:** No alias name provided');
        return;
    }

    const raw = message.content.trim();
    const parts = raw.split(/\s+/);
    const idx = raw.indexOf(parts[1]) + parts[1].length;

    let val = raw.slice(idx).trim();


    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
    }

    if (!val) {
        message.reply('**Error:** No alias value provided');
        return;
    }

    const map = loadAliases();
    map[name] = val;
    saveAliases(map);

    message.reply(`**Alias set:** \`${name}\` -> \`${val}\``);
}

export async function invokeAlias(message: Message, command: string) {
    const map = loadAliases();
    const val = map[command];

    if (!val) {
        return false;
    }

    await message.edit(val);

    if (val.startsWith(PREFIX)) {
        const moduleUrl = pathToFileURL(path.resolve(process.cwd(), 'dist/index.js')).href;
        const { handle } = await import(moduleUrl);

        await handle(message);
    }

    return true;
}
