import type { APIRoute } from "astro";

// Follows `site` in astro.config.mjs, so it stays right when the domain changes (decision D9).
export const GET: APIRoute = ({ site }) => {
    const sitemap = new URL("sitemap-index.xml", site).href;
    return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
};
