import { Message } from "discord.js-selfbot-v13";

export async function ipLookup(message: Message, target: string) {
  if (!target) {
    message.reply("**Usage:** \`ip <ip>\`");
    return;
  }

  const req = await fetch(`http://ip-api.com/json/${target}?fields=status,message,continent,country,region,city,district,zip,lat,lon,timezone,isp,org,as,reverse,mobile,proxy,hosting,query`);
  const res = await req.json();

  if (res.status === 'success') {
    const template = `# IP Info:
- **Location**:
  - **Continent**: ${res.continent}
  - **Country**: ${res.country}
  - **Region**: ${res.region}
  - **City**: ${res.city}
    - **District**: ${res.district}
    - **Zip**: ${res.zip}
  - **Coords**:
    - **Latitude**: ${res.lat}
    - **Longitude**: ${res.lon}
- **TZ**: ${res.timezone}
- **ISP**: ${res.isp}
- **Org**: ${res.org}
- **AS**: ${res.as}
- **rDNS**: ${res.reverse}
- **Is**:
  - **Mobile**: ${res.mobile}
  - **Proxy**: ${res.proxy}
  - **Hosting**: ${res.hosting}`;

    await message.reply(template);
  } else {
    console.error('IP fetch error:', res.message);
    await message.reply(`**Failed to fetch IP info**: ${res.message}`);
  }
}