// 中英切换：页面默认输出中文，带上这些属性的元素在切到英文时由 Base.astro 里的脚本替换
// en('Resume') → 替换文字；en(null, { 'aria-label': 'Main' }) → 替换属性；没给英文时保持中文
export const en = (text?: string | null, attrs: Record<string, string | null | undefined> = {}) => {
  const out: Record<string, string> = {};
  if (text) out['data-en'] = text;
  for (const [k, v] of Object.entries(attrs)) if (v) out[`data-en-${k}`] = v;
  if (Object.keys(out).length) out['data-i18n'] = '';
  return out;
};
