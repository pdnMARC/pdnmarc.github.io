// One list of publications for the whole site, merged from:
//   • project_publications — the "MARC Publications" sheet, one tab per project (primary)
//   • publications         — the original publications sheet (kept so nothing is lost)
// Duplicates are merged by DOI, or by title when there is no DOI.
import { getCollection, type CollectionEntry } from "astro:content";
import { projectPublicationTabs, publicationTabLabels } from "../data/site";

export type PubStatus = "Published" | "Accepted" | "Under review" | "";

export interface Publication {
    id: string;
    title: string;
    type: string;
    venue: string;
    authors: string;
    year: number | null;
    status: PubStatus;
    doi: string;
    url: string;
    /** Sheet tab names and/or project titles this paper belongs to. */
    projects: string[];
    /** Emails from the original sheet, used only to match people profiles (never rendered). */
    peopleEmails: string[];
}

/** Lower-case, letters and digits only: "HSI/CD" → "hsicd", "Hyperspectral_Unmixing" → "hyperspectralunmixing". */
export const normKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const doiFrom = (s: string) => s.match(/10\.\d{4,9}\/\S+/i)?.[0].replace(/[.,;]$/, "") ?? "";
const dedupeKey = (doi: string, title: string) => (doi ? doi.toLowerCase() : normKey(title));
const asStatus = (s: string): PubStatus =>
    s === "Published" || s === "Accepted" || s === "Under review" ? s : "";

let cache: Publication[] | undefined;

export async function getAllPublications(): Promise<Publication[]> {
    if (cache) return cache;
    const [sheet, legacy] = await Promise.all([getCollection("project_publications"), getCollection("publications")]);
    const byKey = new Map<string, Publication>();

    for (const { id, data } of sheet) {
        byKey.set(dedupeKey(data.doi, data.title), {
            id,
            title: data.title,
            type: data.type,
            venue: data.venue,
            authors: data.authors,
            year: data.year,
            status: asStatus(data.status),
            doi: data.doi,
            url: data.url,
            projects: [...data.projects],
            peopleEmails: [],
        });
    }

    for (const { id, data } of legacy) {
        const doi = doiFrom(data.doi);
        const key = dedupeKey(doi, data.paper_title);
        const existing = byKey.get(key);
        if (existing) {
            if (data.project && !existing.projects.includes(data.project)) existing.projects.push(data.project);
            existing.peopleEmails.push(...data.people);
            continue;
        }
        byKey.set(key, {
            id: `legacy-${id}`,
            title: data.paper_title,
            type: data.type,
            venue: data.venue.trim(),
            authors: data.authors.join(", "),
            year: new Date(data.publication_date).getFullYear() || null,
            status: "Published",
            doi,
            url: doi ? `https://doi.org/${doi}` : data.doi,
            projects: data.project ? [data.project] : [],
            peopleEmails: [...data.people],
        });
    }

    cache = [...byKey.values()].sort(
        (a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title),
    );
    return cache;
}

/** Keys a project answers to: its file id, its title, and any sheet tabs mapped to it in site.ts. */
function projectKeys(project: CollectionEntry<"projects">): Set<string> {
    return new Set(
        [project.id, project.data.project, ...(projectPublicationTabs[project.id] ?? [])].map(normKey),
    );
}

export async function publicationsForProject(project: CollectionEntry<"projects">): Promise<Publication[]> {
    const keys = projectKeys(project);
    return (await getAllPublications()).filter((p) => p.projects.some((name) => keys.has(normKey(name))));
}

export interface ProjectLink {
    url: string;
    title: string;
    /** One key per project page, so a tab name and a project title count as the same project. */
    key: string;
}

/** Sheet tab / project name → project page, for linking project chips. */
export async function projectLinkMap(): Promise<Map<string, ProjectLink>> {
    const projects = await getCollection("projects");
    const map = new Map<string, ProjectLink>();
    for (const project of projects) {
        const link = { url: `/projects/${project.id}/`, title: project.data.project, key: normKey(project.id) };
        for (const key of projectKeys(project)) map.set(key, link);
    }
    return map;
}

/** Chips for a paper's projects: linked when a project page exists, de-duplicated, "Other" dropped. */
export function projectChips(pub: Publication, links: Map<string, ProjectLink>) {
    const chips = new Map<string, { key: string; label: string; url?: string }>();
    for (const name of pub.projects) {
        if (NON_PROJECT_TABS.has(normKey(name))) continue;
        const link = links.get(normKey(name));
        const key = link?.key ?? normKey(name);
        if (!chips.has(key)) {
            chips.set(key, { key, label: link?.title ?? publicationTabLabels[name] ?? name.replace(/_/g, " "), url: link?.url });
        }
    }
    return [...chips.values()];
}

/**
 * Papers by a person: matched by email from the original sheet, or by their full name
 * appearing in the author list (names in "Initials Surname" form are not matched).
 */
export async function publicationsForPerson(person: CollectionEntry<"people">): Promise<Publication[]> {
    const name = person.data.name.replace(/^(Prof|Dr|Mr|Ms|Mrs|Eng)\.?\s+/i, "").trim().toLowerCase();
    return (await getAllPublications()).filter(
        (p) => p.peopleEmails.includes(person.data.email) || (name.includes(" ") && p.authors.toLowerCase().includes(name)),
    );
}

/** Groups for display: years (newest first), then "Under review", then "Year not listed". */
export function groupByYear(pubs: Publication[]) {
    const groups = new Map<string, Publication[]>();
    for (const p of pubs) {
        const label = p.status === "Under review" ? "Under review" : p.year ? String(p.year) : "Year not listed";
        groups.set(label, [...(groups.get(label) ?? []), p]);
    }
    const rank = (label: string) => (label === "Under review" ? -1 : label === "Year not listed" ? -2 : Number(label));
    return [...groups.entries()].sort(([a], [b]) => rank(b) - rank(a)).map(([label, items]) => ({ label, items }));
}

/** Tab names that are not real projects (shown without a project chip). */
export const NON_PROJECT_TABS = new Set(["other"]);
