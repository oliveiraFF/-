import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 以下划线开头的文件是填写模板，不会出现在网站上
const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),   // 英文界面用，留空显示中文
    order: z.number(),
    cover: z.string(),
    coverAlt: z.string(),
    coverAltEn: z.string().optional(),
    sample: z.boolean().default(false),
    summary: z.string().optional(),
  }),
});

const thoughts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/thoughts' }),
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),   // 英文界面用，留空显示中文
    date: z.coerce.date(),
    summary: z.string().optional(),
    summaryEn: z.string().optional(),
    // 只有外部原文时填写；有正文时留空，会生成站内阅读页
    url: z.url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, thoughts };
