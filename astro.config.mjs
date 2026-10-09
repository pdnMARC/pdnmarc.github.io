// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import path from "node:path";

import preact from "@astrojs/preact";

// D9: switch to https://marc.pdn.ac.lk (and add public/CNAME) once DNS is approved.
const SITE = "https://pdnmarc.github.io";

// D10: research areas moved to lowercase kebab-case URLs.
// Paths that differ only by letter case (/Research, /Research/Socioeconomic) are NOT listed:
// on case-insensitive disks (macOS, Windows) their redirect stub would overwrite the real page.
// src/pages/404.astro lowercases those URLs instead.
const researchRedirects = {
  '/Research/BioMedical': '/research/biomedical-engineering-and-wearables',
  '/Research/Computer_Vision': '/research/computer-vision',
  '/Research/Generative_AI': '/research/generative-ai',
  '/Research/MSI': '/research/multispectral-imaging',
  '/Research/Smart_Grid': '/research/smart-grid',
};

// Optional local content checkouts (see src/content.config.ts). The dev server must be
// allowed to serve their images, which live outside this project folder.
const contentRoot = process.env.MARC_CONTENT_ROOT;

export default defineConfig({
  site: SITE,
  redirects: researchRedirects,

  vite: {
    plugins: [tailwindcss()],
    server: contentRoot
      ? { fs: { allow: [process.cwd(), path.resolve(contentRoot)] } }
      : undefined,
  },

  integrations: [
    mdx(),
    preact(),
    icon(),
    sitemap({
      // Keep redirect stubs (capitalised legacy paths) out of the sitemap.
      filter: (page) => !/\/Research\//.test(page) && !page.endsWith('/404/'),
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
