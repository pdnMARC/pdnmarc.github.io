// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mdx from "@astrojs/mdx";

import preact from "@astrojs/preact";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx(), preact()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});