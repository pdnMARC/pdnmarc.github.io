// Site-wide settings and static copy (spec §13.6 "settings").
// Text here is taken verbatim from the uop.lk mockup / official MARC sources (spec Appendix A).
// Do not add new claims about MARC here without a source.

export const site = {
    name: "Multidisciplinary AI Research Centre",
    shortName: "MARC",
    tagline: "AI Research Centre",
    university: "University of Peradeniya",
    universityUrl: "https://www.pdn.ac.lk/",
    facultyUrl: "https://eng.pdn.ac.lk/",
    address: "Faculty of Engineering, University of Peradeniya, Sri Lanka",
    email: "marc@eng.pdn.ac.lk",
    // Not published on the official MARC website (spec §1.4). Replace when MARC provides one.
    telephone: null as string | null,
    mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Faculty+of+Engineering%2C+University+of+Peradeniya%2C+Sri+Lanka",
    ai4covidUrl: "https://covid.eng.pdn.ac.lk/index.php",
    description:
        "MARC of the University of Peradeniya is a research platform dedicated to bridging the gap between Sri Lanka's today's reality and tomorrow's potential — unlocking the potential of AI to address the country's economic and societal challenges.",
    footerBlurb:
        "A research platform of the University of Peradeniya, dedicated to bridging the gap between Sri Lanka's today's reality and tomorrow's potential.",
};

// Landing-page photos. Put 1–5 real photos of the MARC lab / interior / team in
// src/assets/home/ (jpg, jpeg, png or webp). They appear beside the headline as a collage,
// ordered by file name — prefix them 01-, 02-, … to control the order; the first is the large one.
// Without any photos the hero stays text-only. See src/assets/home/README.md.
export const homePhotos = {
    /** Alt text per file name. Describe what each photo shows. */
    alt: {
        "01-accelerating-research-through-ai-tools.jpg":
            "Accelerating Research Through AI Tools: a speaker addresses a full room of participants working on laptops",
        "02-research-careers-talk.jpg": "A speaker presents a talk on research careers to students and researchers",
        "03-researchers-reviewing-archives.jpg": "Researchers gathered around a table reviewing archival photographs and journals",
        "04-peradeniya-alumni-visit.jpg": "Esteemed Peradeniya alumni and academic dignitaries in a meeting at MARC",
    } as Record<string, string>,
    /** Optional crop focus per file (CSS object-position), e.g. "75% 50%" keeps the right side in view. */
    focus: {
        "01-accelerating-research-through-ai-tools.jpg": "78% 50%",
    } as Record<string, string>,
    /** Used for the first photo when it has no entry above. Other photos without one are treated as decorative. */
    defaultAlt: "Inside the Multidisciplinary AI Research Centre, University of Peradeniya",
    /** Optional line under the collage, e.g. "The MARC lab, Faculty of Engineering". Leave "" for none. */
    caption: "",
};

// Publications sheet tab(s) → project page. A tab is matched automatically when its name equals the
// project's file name or title (e.g. tab "NILM" ↔ NILM.md). Add an entry only when the names differ.
// Keys are project file names in lower case.
export const projectPublicationTabs: Record<string, string[]> = {
    hyperspectral_unmixing: ["HSI/CD"],
    gait_and_posture: ["Wearable"], // one "Wearable" tab covers both wearable projects
    biomechanics: ["Wearable"],
    lung_sound_analysis: ["Lung Project"],
};

// Display names for sheet tabs that the spreadsheet export alters (e.g. "/" is dropped from "HSI/CD").
export const publicationTabLabels: Record<string, string> = {
    HSICD: "HSI/CD",
};

// Research highlights for the home page. Wording follows MARC's project-details document
// (the items it asks the website to highlight). `project` is a marc_projects file name; when that
// page does not exist the card links to the research area instead.
export const highlights: {
    kicker: string;
    title: string;
    text: string;
    icon: string;
    project?: string;
    area: string;
}[] = [
    {
        kicker: "ICLR 2026",
        title: "COSMO-INR at a top-tier AI conference",
        text: "The first top-tier AI conference paper produced by a fully Sri Lankan-affiliated research team: a new implicit neural representation framework with state-of-the-art results.",
        icon: "material-symbols:trophy-outline",
        project: "inr",
        area: "generative-ai",
    },
    {
        kicker: "NVIDIA Academic Grant",
        title: "Heritage AI",
        text: "Implicit neural representations and diffusion models applied to restoring and colorizing degraded historical images.",
        icon: "material-symbols:workspace-premium-outline",
        project: "diffusion",
        area: "generative-ai",
    },
    {
        kicker: "Rs. 20 million",
        title: "National Research Council grant",
        text: "Digital twins for tea growth at the agrivoltaic research facility in Hanthana, bringing together engineering, agriculture, energy and botany.",
        icon: "material-symbols:payments-outline",
        project: "agrovoltaic",
        area: "computer-vision",
    },
    {
        kicker: "IDRC grant",
        title: "AI for COVID",
        text: "Demographic analysis of population structure and health outcomes, with joint publications in Humanities and Social Sciences Communications and Frontiers in Psychology.",
        icon: "material-symbols:public",
        project: "demographic_analysis",
        area: "socioeconomic",
    },
    {
        kicker: "University of Oulu, Finland",
        title: "International collaboration",
        text: "Energy and data networking for light-based IoT, with publications in IEEE Communications Magazine.",
        icon: "material-symbols:handshake-outline",
        project: "de_liot",
        area: "smart-grid",
    },
    {
        kicker: "Q1 journals",
        title: "Remote sensing research",
        text: "Multispectral and hyperspectral imaging work published in IEEE Transactions on Geoscience and Remote Sensing and IEEE JSTARS.",
        icon: "material-symbols:satellite-alt-outline",
        project: "hyperspectral_unmixing",
        area: "multispectral-imaging",
    },
];

export type SocialKey = "facebook" | "linkedin" | "instagram" | "youtube";

export const socials: { key: SocialKey; label: string; href: string; icon: string }[] = [
    {
        key: "facebook",
        label: "Facebook",
        href: "https://www.facebook.com/p/Multidisciplinary-AI-Research-Center-MARC-61566611961677/",
        icon: "mdi:facebook",
    },
    {
        key: "linkedin",
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/multidisciplinaryai/",
        icon: "mdi:linkedin",
    },
    {
        key: "instagram",
        label: "Instagram",
        href: "https://www.instagram.com/marc_uop",
        icon: "mdi:instagram",
    },
    {
        // Spec §14.3: the mockup links channel UCsSpKZZLZfglg6vE4xh1uLg; keep the production link until MARC confirms.
        key: "youtube",
        label: "YouTube",
        href: "https://www.youtube.com/@MARCUoP",
        icon: "mdi:youtube",
    },
];

export const nav = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/research", label: "Research" },
    { href: "/projects", label: "Projects" },
    { href: "/publications", label: "Publications" },
    { href: "/people", label: "People" },
    { href: "/news", label: "News" },
    { href: "/contact", label: "Contact" },
];

export const footerColumns = {
    quick: [
        { href: "/about", label: "About" },
        { href: "/research", label: "Research Areas" },
        { href: "/projects", label: "Projects" },
        { href: "/publications", label: "Publications" },
        { href: "/news", label: "News" },
        { href: "/people", label: "People" },
        { href: "/contact", label: "Contact" },
    ],
    research: [
        { href: "/research", label: "Research Areas" },
        { href: "/projects", label: "Research Projects" },
        { href: "/publications", label: "Publications" },
        { href: "/about#ecosystem", label: "Research Ecosystem" },
        { href: site.ai4covidUrl, label: "AI4Covid", external: true },
    ],
};

export const statements = {
    about: [
        "MARC is the Multidisciplinary AI Research Centre of the University of Peradeniya — a research platform dedicated to bridging the gap between Sri Lanka's today's reality and tomorrow's potential through pioneering innovative solutions with cutting-edge technology.",
        "Its core mission is to address the economic and societal challenges of Sri Lanka by developing AI-powered solutions, positioning the country at the forefront of the Fourth Industrial Revolution (IR4.0) and beyond.",
    ],
    mission:
        "To leverage AI research and innovation to drive sustainable development and societal progress in Sri Lanka, developing cutting-edge AI solutions that address real-world challenges.",
    vision:
        "A future where AI-powered technologies play a central role in shaping a more inclusive, equitable and sustainable society — leading AI research and education on a global scale.",
};

export const disciplines = ["Engineering", "Science", "Agriculture", "Medicine", "Humanities"];

export const ecosystem = {
    steps: [
        { icon: "material-symbols:science-outline", title: "Research", text: "Fundamental and applied AI research across six disciplinary areas." },
        { icon: "material-symbols:lightbulb-outline", title: "AI Innovation", text: "Cutting-edge AI solutions built for real-world national challenges." },
        { icon: "material-symbols:diversity-3-outline", title: "Multidisciplinary Collaboration", text: "Engineering, Science, Agriculture, Medicine, Humanities and Management working as one." },
        { icon: "material-symbols:factory-outline", title: "Real-World Applications", text: "Development, incubation and commercialization of research outcomes." },
        { icon: "material-symbols:public", title: "Societal Impact", text: "Sustainable development and societal progress for Sri Lanka and beyond." },
    ],
    notes: [
        { icon: "material-symbols:flag-outline", title: "IR4.0 and beyond", text: "MARC was established to position Sri Lanka at the forefront of the Fourth Industrial Revolution and to prepare for the impending IR5.0." },
        { icon: "material-symbols:school-outline", title: "Capacity building", text: "Collaborative research, capacity building and outreach — developing the innovative minds and skilled workforce needed for a future powered by AI." },
        { icon: "material-symbols:handshake-outline", title: "National development", text: "The University of Peradeniya leverages its diverse academic strengths through MARC for national development and societal impact." },
    ],
};

export const audiences = [
    { icon: "material-symbols:school-outline", title: "Students", text: "Undergraduate & postgraduate research" },
    { icon: "material-symbols:biotech-outline", title: "Academics", text: "Joint and multidisciplinary research" },
    { icon: "material-symbols:apartment", title: "Industry", text: "Applied AI & commercialization" },
    { icon: "material-symbols:language", title: "International", text: "Institutional partnerships" },
];

// Leadership as published on the official MARC team page (spec A.4).
// Phase 2 moves these into the marc_people collection; until then /about reads them from here.
export const leadership = {
    director: {
        name: "Prof. Janaka Ekanayake",
        role: "Director — Multidisciplinary AI Research Centre",
        affiliation: "University of Peradeniya, Sri Lanka",
        note: "Leads MARC across its six research areas, supported by five Deputy Directors covering planning, development and incubation, research, publicity and outreach, and commercialization.",
        linkedin: "https://uk.linkedin.com/in/prof-janaka-ekanayake-943817a",
    },
    deputies: [
        { name: "Prof. Roshan Ragel", portfolio: "Planning" },
        { name: "Prof. Vijitha Herath", portfolio: "Development and Incubation" },
        { name: "Prof. Roshan Godaliyadda", portfolio: "Research" },
        { name: "Dr. Asitha Bandaranayake", portfolio: "Publicity and Outreach" },
        { name: "Prof. Ruwan Jayasinghe", portfolio: "Commercialization" },
    ],
    advisors: [
        { name: "Prof. Ir. Dr. Tiong Sieh Kiong", affiliation: "Institution of Sustainable Energy, Universiti Tenaga Nasional, Malaysia" },
        { name: "Prof. Muthucumaru Maheswaran", affiliation: "School of Computer Science, McGill University, Canada" },
        // Affiliation not published (spec §1.4).
        { name: "Dr. Romesh Ranawana", affiliation: null as string | null },
    ],
};
