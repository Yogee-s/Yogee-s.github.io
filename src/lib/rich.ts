// Tiny inline markup for copy: **claim** → bold white, `tech` → cyan.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const rich = (s: string) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="kw">$1</strong>')
    .replace(/`(.+?)`/g, '<span class="kt">$1</span>');

export const plain = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1');
