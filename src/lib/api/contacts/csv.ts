import { ContactInput } from "./repository";

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      result.push(current.trim()); current = "";
    } else current += ch;
  }
  result.push(current.trim());
  return result;
}

export function parseContactsCsv(csvText: string, tag?: string): ContactInput[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.replace(/^\uFEFF/, "").trim().toLowerCase());
  const phoneIndex = headers.findIndex((h) => ["phone", "mobile", "mobile number", "whatsapp", "whatsapp number", "phone number"].includes(h));
  if (phoneIndex < 0) throw new Error("CSV must include a phone/mobile/WhatsApp number column.");
  const nameIndex = headers.findIndex((h) => ["name", "full name", "customer name"].includes(h));
  const emailIndex = headers.indexOf("email");

  return lines.slice(1).map(splitCsvLine).map((cols) => {
    const customFields: Record<string, string> = {};
    headers.forEach((header, i) => {
      if (!header || i === phoneIndex || i === nameIndex || i === emailIndex) return;
      customFields[header] = cols[i] ?? "";
    });
    return {
      name: nameIndex >= 0 ? cols[nameIndex] : undefined,
      phone: cols[phoneIndex] ?? "",
      email: emailIndex >= 0 ? cols[emailIndex] : undefined,
      tag: tag?.trim() || null,
      customFields,
    };
  }).filter((row) => !!row.phone.trim());
}
