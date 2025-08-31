import fs from "fs";
import path from "path";

import dotenv from "dotenv";
dotenv.config();

export interface Config {
    token: string;
    prefix: string;
    shared: string[];
    nitro_sniper: boolean;
    watchdog: {
        channels: string[];
        format: "txt" | "json";
    };
    apis: {
        openrouter_key: string;
        github_token: string;
        numverify_key: string;
    };
}

function parseStringArray(value: string | undefined): string[] {
    if (!value) return [];
    return value.split(',')
        .map(id => id.trim().replace(/[\[\]]/g, ''))
        .filter(id => id.length > 0);
}

function parseBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
    if (!value) return defaultValue;
    return value.toLowerCase().trim() === 'true';
}

const jsonConfig = JSON.parse(
    fs.readFileSync(
        path.resolve(process.cwd(), "config.json"), 
    "utf-8")
) as Config;

export const config: Config = {
    token: jsonConfig.token || process.env.TOKEN || "",
    prefix: jsonConfig.prefix || process.env.PREFIX || "$",
    shared: jsonConfig.shared || parseStringArray(process.env.SHARED),
    nitro_sniper: jsonConfig.nitro_sniper || parseBoolean(process.env.NITRO_SNIPER, false),
    watchdog: jsonConfig.watchdog || {
        channels: parseStringArray(process.env.WD_CHANNELS),
        format: (process.env.WD_FMT?.toLowerCase() === 'json' ? 'json' : 'txt') as "txt" | "json"
    },
    apis: jsonConfig.apis || {
        openrouter_key: process.env.OR_KEY || "",
        github_token: process.env.GITHUB_TOKEN || "",
        numverify_key: process.env.NUMVERIFY_KEY || ""
    }
};

export const prefix = config.prefix.length > 1 ? `${config.prefix} ` : config.prefix;
