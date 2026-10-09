// Landing-page photos: every image in src/assets/home/ (up to 5), ordered by file name.
// Alt text comes from homePhotos in src/data/site.ts.
import type { ImageMetadata } from "astro";
import { homePhotos } from "../data/site";

const MAX = 5;

const files = import.meta.glob<{ default: ImageMetadata }>("/src/assets/home/*.{jpg,jpeg,png,webp}", {
    eager: true,
});

export interface HomePhoto {
    file: string;
    src: ImageMetadata;
    alt: string;
    /** CSS object-position for the crop. */
    focus?: string;
}

export function getHomePhotos(): HomePhoto[] {
    return Object.entries(files)
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .slice(0, MAX)
        .map(([path, mod], i) => {
            const file = path.split("/").pop()!;
            // The first photo always has a description; later ones are decorative unless described.
            const alt = homePhotos.alt[file] ?? (i === 0 ? homePhotos.defaultAlt : "");
            return { file, src: mod.default, alt, focus: homePhotos.focus?.[file] };
        });
}
