// Research areas (the six technical areas, decision D4) live as Markdown in
// src/data/research/<slug>.md. The slug is the URL: /research/<slug>/ (decision D10).
import type { ImageMetadata, MarkdownInstance } from "astro";

interface AreaFrontmatter {
    title: string;
    coverImage: string;
    short?: string;
}

const modules = import.meta.glob<MarkdownInstance<AreaFrontmatter>>("/src/data/research/*.md", {
    eager: true,
});
const covers = import.meta.glob<{ default: ImageMetadata }>("/src/assets/*.{jpeg,jpg,png,webp}", {
    eager: true,
});

// Display order (01–06).
const ORDER = [
    "biomedical-engineering-and-wearables",
    "computer-vision",
    "generative-ai",
    "multispectral-imaging",
    "smart-grid",
    "socioeconomic",
];

export type Accent = "blue" | "red" | "purple" | "teal" | "amber" | "green";

// Visual identity per area: a Material Symbols icon and a solid accent colour (see .acc-* in app.css).
const META: Record<string, { icon: string; accent: Accent }> = {
    "biomedical-engineering-and-wearables": { icon: "material-symbols:ecg-heart-outline", accent: "red" },
    "computer-vision": { icon: "material-symbols:visibility-outline", accent: "blue" },
    "generative-ai": { icon: "material-symbols:auto-awesome-outline", accent: "purple" },
    "multispectral-imaging": { icon: "material-symbols:layers-outline", accent: "teal" },
    "smart-grid": { icon: "material-symbols:bolt-outline", accent: "amber" },
    socioeconomic: { icon: "material-symbols:groups-outline", accent: "green" },
};
const FALLBACK = { icon: "material-symbols:science-outline", accent: "blue" as Accent };

export interface ResearchArea {
    slug: string;
    icon: string;
    accent: Accent;
    number: string;
    url: string;
    title: string;
    /** Card summary. Spec B14: today this is the whole body; cards clamp it. */
    short: string;
    cover?: ImageMetadata;
    Content: MarkdownInstance<AreaFrontmatter>["Content"];
}

export function getResearchAreas(): ResearchArea[] {
    return Object.entries(modules)
        .map(([path, mod]) => {
            const slug = path.split("/").pop()!.replace(/\.md$/, "");
            return {
                slug,
                title: mod.frontmatter.title,
                short: (mod.frontmatter.short ?? "").trim(),
                cover: covers[`/src/assets/${mod.frontmatter.coverImage}`]?.default,
                Content: mod.Content,
                url: `/research/${slug}/`,
                ...(META[slug] ?? FALLBACK),
            };
        })
        .sort((a, b) => rank(a.slug) - rank(b.slug))
        .map((area, i) => ({ ...area, number: String(i + 1).padStart(2, "0") }));
}

function rank(slug: string) {
    const i = ORDER.indexOf(slug);
    return i === -1 ? ORDER.length : i;
}

/** Icon, accent and page for a project's `researchArea` title (falls back gracefully for unknown titles). */
export function areaMeta(title: string) {
    const area = getResearchAreas().find((a) => a.title === title);
    return { icon: area?.icon ?? FALLBACK.icon, accent: area?.accent ?? FALLBACK.accent, url: area?.url, slug: area?.slug };
}
