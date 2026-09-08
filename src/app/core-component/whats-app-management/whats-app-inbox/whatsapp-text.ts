/** Escape message content before translating WhatsApp's inline formatting. */
export function formatWhatsAppText(value: unknown): string {
  const escaped = String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]!));
  return escaped
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=$|[\s.,!?;:)])/g, '$1<strong>$2</strong>')
    .replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s.,!?;:)])/g, '$1<em>$2</em>')
    .replace(/(^|[\s(])~([^~\n]+)~(?=$|[\s.,!?;:)])/g, '$1<del>$2</del>');
}
