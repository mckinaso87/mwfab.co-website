import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

export function renderMarkdownToHtml(md: string): string {
  return marked.parse(md, { async: false }) as string;
}
