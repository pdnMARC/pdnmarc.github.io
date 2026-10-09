// 1. Import utilities from `astro:content`
import { defineCollection } from 'astro:content';

// 2. Import loader(s)
import { glob, file } from 'astro/loaders';
import fs from 'node:fs';
import path from 'node:path';

// 3. Import Zod
import { z } from 'astro/zod';

// Local preview against checkouts of the content repos (CI clones them into src/collection_* instead):
//   MARC_CONTENT_ROOT=.. npm run dev   → reads ../marc_projects, ../marc_people and ../marc_news
// Without the variable the committed src/collection_* folders are used, exactly as before.
const contentRoot = process.env.MARC_CONTENT_ROOT?.replace(/\/+$/, '');
const contentDir = (repo: string, fallback: string) => (contentRoot ? `${contentRoot}/${repo}/` : fallback);

// 4. Define your collection(s)
const projects = defineCollection({
    loader: glob(
        {
            pattern: ['**/!([Rr][Ee][Aa][Dd][Mm][Ee]).md', '!**/node_modules/**'], // skip a content repo's own npm install
            base: contentDir("marc_projects", "src/collection_projects/")
        }
    ),
    schema: ({ image }) => z.object({
        project: z.string(),
        projectMembers: z.array(z.string()),
        supervisors: z.array(z.string()),
        researchArea: z.string(),
        researchPillars: z.array(z.string()),
        coverImage: image()
    })

});

const people = defineCollection({
    loader: glob(
        {
            pattern: ['**/!([Rr][Ee][Aa][Dd][Mm][Ee]).md', '!**/node_modules/**'], // skip a content repo's own npm install
            base: contentDir("marc_people", "src/collection_people/")
        }
    ),
    schema: ({ image }) => z.object({
        email: z.string().email(),
        post: z.string(),
        name: z.string(),
        photo: image().optional(),
    })

});


const publications = defineCollection({
    loader: file('src/collection_publications/publications.json'),
    schema: z.object({
        paper_title: z.string(),
        venue: z.string(),
        type: z.string(),
        doi: z.string().url(),
        authors: z.array(z.string()),
        publication_date: z.string().date(),
        people: z.array(z.string().email()),
        project: z.string()
    })
});


// "MARC Publications" sheet (one tab per project), written by python_scripts/get_data.py.
// The file is generated at build time; if it is missing locally the collection is simply empty.
const PROJECT_PUBLICATIONS_JSON = 'src/collection_publications/project_publications.json';
const project_publications = defineCollection({
    loader: async () => {
        const file = path.resolve(process.cwd(), PROJECT_PUBLICATIONS_JSON);
        if (!fs.existsSync(file)) {
            console.warn(`[project_publications] ${PROJECT_PUBLICATIONS_JSON} not found; run python_scripts/get_data.py`);
            return [];
        }
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    },
    schema: z.object({
        title: z.string(),
        type: z.string(),
        venue: z.string(),
        authors: z.string(),
        status: z.string(),
        doi: z.string(),
        url: z.string(),
        projects: z.array(z.string()),
        year: z.number().int().nullable(),
    }),
});


const social_news = defineCollection({
    loader: file('src/collection_news/social_news.json'),
    schema: z.object({
        title: z.string(),
        date: z.string().date(),
        source: z.enum(["Facebook", "LinkedIn", "Web", "Twitter"]), // Where does this link go?
        url: z.string().url(),
        thumbnail: z.string().optional(), // Optional: Path to an image
        embed: z.string().optional() // Optional: Embed code for videos or other media
    })
});


const news = defineCollection({
    // Load markdown files from your specific folder
    loader: glob({
        pattern: ['**/!([Rr][Ee][Aa][Dd][Mm][Ee]).md', '!**/node_modules/**'], // skip a content repo's own npm install
        base: contentDir("marc_news", "src/collection_news/")
    }),
    schema: ({ image }) => z.object({
        title: z.string(),
        date: z.date(), // Zod will automatically parse the YYYY-MM-DD string
        cover: image().optional(), // Validate the cover image exists
        short: z.string(), // The summary for the card
    })
});
// 5. Export a single `collections` object to register your collection(s)
export const collections = { projects, people, publications, project_publications, social_news, news };