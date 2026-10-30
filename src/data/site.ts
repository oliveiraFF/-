// 个人信息集中维护；值为 null 或空数组时页面显示“待补充”
export const site = {
  name: 'ice',
  role: 'AI 全栈',
  roleEn: 'AI Full Stack',
  // 首屏背景视频（放在 public/assets/hero/ 下）；为 null 时首屏用第一个项目的封面图
  heroVideo: null as { src: string; poster: string } | null,
  // 首屏图片；同时用于简介菱形与联系区背景。为 null 时用第一个项目的封面图
  heroImage: {
    src: '/assets/hero/hero.jpg',
    alt: '动漫风插画：银蓝长发、琥珀色眼睛的角色抬手按住额头，抬头望向上方',
    altEn: 'Anime-style illustration: a character with long silver-blue hair and amber eyes, hand pressed to the forehead, looking up',
    width: 1290,
    height: 1283,
  } as { src: string; alt: string; altEn?: string; width: number; height: number } | null,
  // “我的思考”大字中间的图片；为 null 时用第三个项目的封面
  thoughtsImage: { src: '/assets/thoughts/band.jpg', width: 1290, height: 1312 } as { src: string; width: number; height: number } | null,
  // 开场第三屏左右两张图；为 null 时用第二、第三个项目的封面（显示“示例图片”）
  // 两张都是 Ands Mahardika 的插画（Unsplash License）：
  // 左《A girl walks towards the night sky》，右《Girl stands alone amongst the starry sky》（已裁掉白边）
  statementImages: [
    { src: '/assets/intro/night-sky.jpg', width: 1600, height: 899 },
    { src: '/assets/intro/stars-alone.jpg', width: 1552, height: 1552 },
  ] as ({ src: string; width: number; height: number } | null)[],
  // 带 En 的字段是英文版；留空时英文界面显示中文原文
  intro: null as string | null,
  introEn: null as string | null,
  // 技能分组：首页“技能”区按组显示，简介和简历里汇总成一行。组名可改可增减，items 填具体技能
  skillGroups: [
    { title: '前端', titleEn: 'Front end', items: [] },
    { title: '后端', titleEn: 'Back end', items: [] },
    { title: 'AI 应用', titleEn: 'AI', items: [] },
  ] as { title: string; titleEn?: string; items: string[] }[],
  experience: [] as string[],
  education: [] as string[],
  contact: {
    email: 'iceff163@gmail.com' as string | null,   // 例如 'hi@example.com'
    github: 'https://github.com/oliveiraFF' as string | null,  // 完整主页地址
    qq: '2537086632' as string | null,      // QQ 号，只显示文字
    x: 'https://x.com/iceff163' as string | null,       // X 主页完整地址，例如 'https://x.com/xxx'
    others: [] as { label: string; url: string }[],
  },
};
