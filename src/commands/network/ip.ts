import { Message } from "discord.js-selfbot-v13";
import { createEmbed, fmtEmbed } from "../../embed.js";

export async function ipLookup(message: Message, target: string) {
    if (!target) {
        message.reply("**Usage:** \`ip <ip>\`");
        return;
    }

    const req = await fetch(`http://ip-api.com/json/${target}?fields=status,message,continent,country,region,city,district,zip,lat,lon,timezone,isp,org,as,reverse,mobile,proxy,hosting,query`);
    const res = await req.json();

    if (res.status === 'success') {
        const template = `
Continent: ${res.continent}
Country: ${res.country}
Region: ${res.region}
City: ${res.city}
District: ${res.district}
Zip: ${res.zip}
Latitude: ${res.lat}
Longitude: ${res.lon}
TZ: ${res.timezone}
ISP: ${res.isp}
Org: ${res.org}
AS: ${res.as}
rDNS: ${res.reverse}
Is mobile: ${res.mobile}
Is proxy: ${res.proxy}
Is hosting: ${res.hosting}
        `;

        message.edit(fmtEmbed(message.content, createEmbed('IP Info', template, '#a6e3a1')));
        return;
    } else {
        console.error('IP fetch error:', res.message);
        message.edit(fmtEmbed(message.content, createEmbed('Error', res.message, '#f38ba8')));
        return;
    }
}
