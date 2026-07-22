import { decodeHTML } from "entities";

export function stripHtmlToText(html: string): string {
  return decodeHTML(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}
