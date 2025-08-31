import { Message } from "discord.js-selfbot-v13";
import { promises as dnsPromises } from "dns";
import { createEmbed, fmtEmbed } from "../../embed.js";

export async function dnsLookup(message: Message, type: string, target: string) {
    if (!type || !target) {
        message.edit(fmtEmbed(message.content, createEmbed('DNS - Usage', 'dns <record> <hostname>', '#cdd6f4')));
        return;
    }

    const recordType = type.toUpperCase();
    try {
        let records;

        // lmao
        switch (recordType) {
            case "A":
                records = await dnsPromises.resolve4(target);
                break;
            case "AAAA":
                records = await dnsPromises.resolve6(target);
                break;
            case "MX":
                records = await dnsPromises.resolveMx(target);
                break;
            case "TXT":
                records = await dnsPromises.resolveTxt(target);
                break;
            case "CNAME":
                records = await dnsPromises.resolveCname(target);
                break;
            case "NS":
                records = await dnsPromises.resolveNs(target);
                break;
            case "SOA":
                records = await dnsPromises.resolveSoa(target);
                break;
            case "ANY":
                records = await dnsPromises.resolveAny(target);
                break;
            case "SRV":
                records = await dnsPromises.resolveSrv(target);
                break;
            case "PTR":
                records = await dnsPromises.resolvePtr(target);
                break;
            case "CAA":
                records = await dnsPromises.resolveCaa(target);
                break;
            case "NAPTR":
                records = await dnsPromises.resolveNaptr(target);
                break;
            case "CERT":
                records = await dnsPromises.resolve(target, 'CERT');
                break;
            case "DNSKEY":
                records = await dnsPromises.resolve(target, 'DNSKEY');
                break;
            case "DS":
                records = await dnsPromises.resolve(target, 'DS');
                break;
            case "HTTPS":
                records = await dnsPromises.resolve(target, 'HTTPS');
                break;
            case "LOC":
                records = await dnsPromises.resolve(target, 'LOC');
                break;
            case "SMIMEA":
                records = await dnsPromises.resolve(target, 'SMIMEA');
                break;
            case "SSHFP":
                records = await dnsPromises.resolve(target, 'SSHFP');
                break;
            case "SVCB":
                records = await dnsPromises.resolve(target, 'SVCB');
                break;
            case "TLSA":
                records = await dnsPromises.resolve(target, 'TLSA');
                break;
            case "URI":
                records = await dnsPromises.resolve(target, 'URI');
                break;
            default:
                message.edit(fmtEmbed(message.content, createEmbed('DNS - Error', `Unsupported DNS record type: ${recordType}`, '#f38ba8')));
                return;
        }

        const items = Array.isArray(records)
            ? records.map(r => (typeof r === "object" ? JSON.stringify(r) : r))
            : [JSON.stringify(records)];
        const output = items.map(line => `- ${line}`).join("\n");
        const header = `${recordType} records for ${target}:`;

        message.edit(fmtEmbed(message.content, createEmbed('DNS Lookup', `${header}\n${output}`, '#a6e3a1')));
    } catch (err) {
        message.edit(fmtEmbed(message.content, createEmbed('DNS - Error', `Error resolving DNS: ${err.code || err.message}`, '#f38ba8')));
        console.error(`DNS resolution error for ${target} (${recordType}):`, err);
    }
}