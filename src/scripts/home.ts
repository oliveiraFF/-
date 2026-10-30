import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

const MOTION = '(prefers-reduced-motion: no-preference)';
const DESKTOP = `${MOTION} and (min-width: 992px) and (min-height: 600px)`;
const COMPACT = `${MOTION} and ((max-width: 991px) or (max-height: 599px))`;

// 平滑滚动，并让 ScrollTrigger 跟随 Lenis 的滚动位置
function smoothScroll() {
  const lenis = new Lenis({ anchors: true, autoRaf: false });
  const tick = (time: number) => lenis.raf(time * 1000);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
  };
}

// 精选项目：悬停、聚焦或点击名称即切换大图，方块标记从上一项滑过来
function initWorks(motionOk: () => boolean) {
  const buttons = $$<HTMLButtonElement>('.works__item');
  const photos = $$<HTMLImageElement>('.works__photo');
  const mark = $('.works__mark');
  if (!mark) return;

  const activate = (btn: HTMLButtonElement) => {
    if (btn.getAttribute('aria-pressed') === 'true') return;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    photos.forEach((img) => img.classList.toggle('is-active', img.dataset.work === btn.dataset.work));

    const from = mark.getBoundingClientRect();
    btn.prepend(mark);
    if (!motionOk()) return;
    const to = mark.getBoundingClientRect();
    gsap.fromTo(mark,
      { x: from.left - to.left, y: from.top - to.top, scale: 1.5 },
      { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'expo.out', overwrite: true });
  };

  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => activate(btn));
    btn.addEventListener('focus', () => activate(btn));
    btn.addEventListener('pointerenter', () => finePointer.matches && activate(btn));
  });
}

// 开场：奶油色幕布上出现菱形标记，幕布上卷，画面从过曝放大中落定，标题逐字升起
function opening() {
  const chars = SplitText.create('.hero__row > span', { type: 'chars', mask: 'chars' }).chars;
  const tl = gsap.timeline();
  tl.set('.loader', { display: 'block', position: 'absolute', inset: 0, zIndex: 1, background: 'var(--cream)' })
    .fromTo('.hero__mark',
      { autoAlpha: 0, scale: 0.6, rotate: -90, color: '#000' },
      { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.9, ease: 'expo.out' })
    .fromTo('.loader',
      { clipPath: 'inset(0% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, 0.7)
    .to('.hero__mark', { color: 'var(--cream)', duration: 0.5 }, 1.1)
    .fromTo('.hero__photo',
      { scale: 1.3, filter: 'brightness(2.1) contrast(0.45) saturate(0.35)' },
      { scale: 1, filter: 'brightness(1) contrast(1) saturate(1)', duration: 2, ease: 'expo.out', clearProps: 'filter' }, 0.8)
    .from(chars, { yPercent: 110, duration: 1.2, stagger: 0.035, ease: 'expo.out' }, 1.3)
    .from(['.hero__labels', '.header'], { autoAlpha: 0, y: 10, duration: 0.8, ease: 'power2.out' }, 1.7)
    .set('.loader', { display: 'none' });
}

// 宽屏开场三屏：首屏旋转收缩成菱形 → 两栏简介靠拢 → 左右两张图上下擦入
function introScene() {
  const root = document.documentElement;
  root.classList.add('has-intro');

  const hero = $('.hero')!;
  const photo = $('.hero__photo');
  const about = $('.about')!;
  const diamond = $('.about__diamond')!;

  // 菱形落点由简介里隐藏的占位菱形决定
  let geo = { w: 0, h: 0, cx: 0, cy: 0, r: 0 };
  const measure = () => {
    const a = about.getBoundingClientRect();
    const d = diamond.getBoundingClientRect();
    geo = { w: hero.clientWidth, h: hero.clientHeight, cx: d.left - a.left + d.width / 2, cy: d.top - a.top + d.height / 2, r: d.width / 2 };
    if (photo) gsap.set(photo, { transformOrigin: `${geo.cx}px ${geo.cy}px` });
  };

  // 四个角各自绕中心转到菱形的四个顶点，同时半径收缩
  const morph = { p: 0 };
  const draw = () => {
    const { w, h, cx, cy, r } = geo;
    const p = morph.p;
    const ox = w / 2 + (cx - w / 2) * p;
    const oy = h / 2 + (cy - h / 2) * p;
    const corners = [[0, 0], [w, 0], [w, h], [0, h]];
    const tips = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const pts = corners.map(([x, y], i) => {
      const a0 = Math.atan2(y - h / 2, x - w / 2);
      const r0 = Math.hypot(x - w / 2, y - h / 2);
      let da = Math.atan2(tips[i][1], tips[i][0]) - a0;
      if (da > Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      const ang = a0 + da * p;
      const rad = r0 + (r - r0) * p;
      return `${(ox + rad * Math.cos(ang)).toFixed(1)}px ${(oy + rad * Math.sin(ang)).toFixed(1)}px`;
    });
    hero.style.clipPath = `polygon(${pts.join(', ')})`;
  };

  measure();
  draw();
  const photoEnd = () => Math.min(1, (geo.r * 4.4) / geo.w);
  const spread = () => $('.about .frame')!.clientWidth * 0.085;
  const titleRise = $$('.statement__title .mask > span');

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.intro', start: 'top top', end: '+=300%',
      pin: true, scrub: 1, invalidateOnRefresh: true,
      onRefresh: () => { measure(); draw(); },
    },
  });
  // 时间轴总长 10，按滚动比例分配
  tl.to(morph, { p: 1, duration: 4, ease: 'power2.inOut', onUpdate: draw }, 0)
    .to(photo, { scale: photoEnd, duration: 4, ease: 'power2.inOut' }, 0)
    .fromTo('.hero__media', { '--hero-fade': 1 }, { '--hero-fade': 0, duration: 1.5 }, 0)
    .to('.hero__mark', { autoAlpha: 0, duration: 0.6 }, 0)
    .to('.hero__labels', { autoAlpha: 0, duration: 1 }, 0)
    .to('.hero__row > span:first-child', { x: () => spread(), autoAlpha: 0, duration: 1.6 }, 0)
    .to('.hero__row > span:last-child', { x: () => -spread(), autoAlpha: 0, duration: 1.6 }, 0)
    .fromTo('.about__col--1', { x: () => -spread(), autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 3, ease: 'power2.out' }, 1)
    .fromTo('.about__col--2', { x: () => spread(), autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 3, ease: 'power2.out' }, 1)
    .fromTo('.statement__half:first-child', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.5, ease: 'power2.inOut' }, 5)
    .fromTo('.statement__half:last-child', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.5, ease: 'power2.inOut' }, 5.4)
    .fromTo(titleRise, { yPercent: 120 }, { yPercent: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out' }, 7.4)
    .fromTo(['.statement__title .t-small', '.statement__cta'], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 8.6)
    .to({}, { duration: 0.6 });

  return () => {
    root.classList.remove('has-intro');
    hero.style.clipPath = '';
  };
}

// 窄屏或矮屏：开场三屏正常排布，宣言标题进入视口时升起
function compactIntro() {
  gsap.from('.statement__title .mask > span', {
    yPercent: 120, duration: 1.2, stagger: 0.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.statement', start: 'top 70%', once: true },
  });
}

// 大字：进入视口时每段从遮罩里升起
function riseOnEnter() {
  $$('[data-rise]').forEach((el) => {
    gsap.from($$('.mask > span', el), {
      yPercent: 120, duration: 1.2, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

// 普通内容块：分批淡入；已滚过的块也直接显示
function revealBlocks() {
  const blocks = $$('[data-reveal]');
  gsap.set(blocks, { autoAlpha: 0, y: 30 });
  const show = (batch: Element[]) =>
    gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: 'expo.out', overwrite: true });
  ScrollTrigger.batch(blocks, { start: 'top 90%', once: true, onEnter: show, onLeave: show });
}

// 精选项目进入视口：画面由暗转亮并闪一下白光，名称依次滑入
function worksEnter() {
  const photos = $('.works__photos');
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.works', start: 'top 55%', once: true } });
  tl.fromTo(photos, { filter: 'brightness(0.12)' }, { filter: 'brightness(1)', duration: 0.15, clearProps: 'filter' })
    .fromTo(photos, { '--flash': 0.55 }, { '--flash': 0, duration: 0.7, ease: 'power2.out' }, 0.15)
    .from('.works__list li', { autoAlpha: 0, x: 40, duration: 0.9, stagger: 0.07, ease: 'expo.out' }, 0.1);
}

// 我的思考：中间图片从菱形展开成矩形，两侧大字随之让开
function thoughtsBand() {
  const band = $('.thoughts__band');
  if (!band) return;
  const shift = () => band.clientWidth * 0.12;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: band, start: 'top bottom', end: 'center 55%', scrub: true, invalidateOnRefresh: true },
  });
  tl.fromTo('.thoughts__photo', { '--w': 0.55, '--o': 0 }, { '--w': 1, '--o': 1 }, 0)
    .fromTo('.thoughts__word:first-child .thoughts__ink', { x: () => shift() }, { x: 0 }, 0)
    .fromTo('.thoughts__word--end .thoughts__ink', { x: () => -shift() }, { x: 0 }, 0);
}

// 联系：背景图缓慢推近
function closingPhoto() {
  gsap.fromTo('.closing__photo', { scale: 1.15 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.closing', start: 'top bottom', end: 'bottom bottom', scrub: true },
  });
}

export function initHome() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  initWorks(() => !reduce.matches);
  // 切换语言后文字长度变了，重新计算滚动触发位置
  document.addEventListener('langchange', () => ScrollTrigger.refresh());

  // 首屏视频：减少动态时停在封面帧
  const video = $<HTMLVideoElement>('video.hero__photo');
  if (video) {
    const sync = () => (reduce.matches ? video.pause() : video.play().catch(() => {}));
    sync();
    reduce.addEventListener('change', sync);
  }

  // 等字体就绪再拆字，避免字符宽度错位；最多等 1.5 秒
  const fontsReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
  fontsReady.then(() => {
    // 先移除隐藏类再建动画，入场动画读取到的才是真实终态；同一帧内完成，不会闪
    document.documentElement.classList.remove('is-loading');
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, introScene);
    mm.add(COMPACT, compactIntro);
    mm.add(MOTION, () => {
      const stopSmooth = smoothScroll();
      opening();
      riseOnEnter();
      revealBlocks();
      worksEnter();
      thoughtsBand();
      closingPhoto();
      return stopSmooth;
    });
  });
}
