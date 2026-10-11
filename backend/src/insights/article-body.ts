import { ArticleBlock } from './insight.entity';

/**
 * The admin edits article bodies as plain text:
 *   - a line starting with "## " is a section heading
 *   - paragraphs are separated by a blank line
 */
export function parseArticleBody(text: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  let para: string[] = [];
  const flush = () => {
    const t = para.join(' ').replace(/\s+/g, ' ').trim();
    if (t) blocks.push({ type: 'p', text: t });
    para = [];
  };
  for (const line of (text || '').replace(/\r\n/g, '\n').split('\n')) {
    const trimmed = line.trim();
    if (/^##\s+/.test(trimmed)) {
      flush();
      const h = trimmed.replace(/^##\s+/, '').trim();
      if (h) blocks.push({ type: 'h', text: h });
    } else if (!trimmed) {
      flush();
    } else {
      para.push(trimmed);
    }
  }
  flush();
  return blocks;
}

export function serializeArticleBody(blocks: ArticleBlock[]): string {
  return (blocks || []).map((b) => (b.type === 'h' ? `## ${b.text}` : b.text)).join('\n\n');
}
