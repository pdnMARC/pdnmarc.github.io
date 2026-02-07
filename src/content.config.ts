// 1. Import utilities from `astro:content`
import { defineCollection } from 'astro:content';

// 2. Import loader(s)
import { glob, file } from 'astro/loaders';

// 3. Import Zod
import { z } from 'astro/zod';

// 4. Define your collection(s)
const projects = defineCollection({
    loader: glob(
        {
            pattern: "**/*.md",
            base: "src/collection_projects/"
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
            pattern: "**/*.md",
            base: "src/collection_people/"
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
    loader: glob({ pattern: "**/*.md", base: "src/collection_news/" }),
    schema: ({ image }) => z.object({
        title: z.string(),
        date: z.date(), // Zod will automatically parse the YYYY-MM-DD string
        cover: image().optional(), // Validate the cover image exists
        short: z.string(), // The summary for the card
    })
});
// 5. Export a single `collections` object to register your collection(s)
export const collections = { projects, people, publications, social_news, news };