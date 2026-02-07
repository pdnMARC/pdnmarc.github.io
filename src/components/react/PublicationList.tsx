/** @jsxImportSource preact */
import { useState, useMemo } from "preact/hooks";

// Define the shape of your data based on your Zod schema
interface Publication {
    id: string;
    data: {
        paper_title: string;
        venue: string;
        type: string;
        doi: string;
        publication_date: string;
        authors: string[];
        project?: string;
    };
}

interface Props {
    publications: Publication[];
}

export default function PublicationsList({ publications }: Props) {
    // --- STATE ---
    const [search, setSearch] = useState("");
    const [selectedYear, setSelectedYear] = useState<string>("All");
    const [selectedType, setSelectedType] = useState<string>("All");
    const [selectedProject, setSelectedProject] = useState<string>("All");

    // --- DERIVED DATA (Options for dropdowns) ---
    const years = useMemo(() => {
        const uniqueYears = new Set(
            publications.map((p) =>
                new Date(p.data.publication_date).getFullYear().toString()
            )
        );
        return ["All", ...Array.from(uniqueYears).sort((a, b) => Number(b) - Number(a))];
    }, [publications]);

    const projects = useMemo(() => {
        const uniqueProjects = new Set(
            publications
                .filter((p) => p.data.project)
                .map((p) => p.data.project as string)
        );
        return ["All", ...Array.from(uniqueProjects).sort()];
    }, [publications]);

    const types = ["All", "Journal", "Conference"];

    // --- FILTERING LOGIC ---
    const filteredPubs = useMemo(() => {
        return publications.filter((pub) => {
            const pubYear = new Date(pub.data.publication_date).getFullYear().toString();
            const matchesSearch =
                pub.data.paper_title.toLowerCase().includes(search.toLowerCase()) ||
                pub.data.venue.toLowerCase().includes(search.toLowerCase());
            const matchesYear = selectedYear === "All" || pubYear === selectedYear;
            const matchesType = selectedType === "All" || pub.data.type === selectedType;
            const matchesProject =
                selectedProject === "All" || pub.data.project === selectedProject;

            return matchesSearch && matchesYear && matchesType && matchesProject;
        });
    }, [publications, search, selectedYear, selectedType, selectedProject]);

    // --- GROUPING LOGIC (Applied to filtered results) ---
    const groupedPubs = useMemo(() => {
        // Sort first
        const sorted = [...filteredPubs].sort(
            (a, b) =>
                new Date(b.data.publication_date).getTime() -
                new Date(a.data.publication_date).getTime()
        );

        // Group
        return sorted.reduce((acc, pub) => {
            const year = new Date(pub.data.publication_date).getFullYear();
            if (!acc[year]) acc[year] = [];
            acc[year].push(pub);
            return acc;
        }, {} as Record<number, Publication[]>);
    }, [filteredPubs]);

    const sortedGroupYears = Object.keys(groupedPubs).sort(
        (a, b) => Number(b) - Number(a)
    );

    return (
        <div class="space-y-8">
            {/* --- CONTROL BAR --- */}
            <div class="bg-base-200/50 p-4 rounded-xl border border-base-200">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Search */}
                    <label class="input input-bordered flex items-center gap-2 bg-base-100">
                        <input
                            type="text"
                            class="grow"
                            placeholder="Search title or venue..."
                            value={search}
                            onInput={(e) => setSearch(e.currentTarget.value)}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" /></svg>
                    </label>

                    {/* Type Filter */}
                    <select
                        class="select select-bordered w-full bg-base-100"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.currentTarget.value)}
                    >
                        <option disabled>Filter by Type</option>
                        {types.map((t) => <option value={t}>{t}</option>)}
                    </select>

                    {/* Project Filter */}
                    <select
                        class="select select-bordered w-full bg-base-100"
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.currentTarget.value)}
                    >
                        <option disabled>Filter by Project</option>
                        {projects.map((p) => <option value={p}>{p}</option>)}
                    </select>

                    {/* Year Filter */}
                    <select
                        class="select select-bordered w-full bg-base-100"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.currentTarget.value)}
                    >
                        <option disabled>Filter by Year</option>
                        {years.map((y) => <option value={y}>{y}</option>)}
                    </select>
                </div>

                {/* Results Count & Reset */}
                <div class="flex justify-between items-center mt-4 text-sm px-1">
                    <span class="opacity-70">
                        Showing <strong>{filteredPubs.length}</strong> publications
                    </span>
                    {(search || selectedYear !== "All" || selectedType !== "All" || selectedProject !== "All") && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setSelectedYear("All");
                                setSelectedType("All");
                                setSelectedProject("All");
                            }}
                            class="link link-primary no-underline hover:underline cursor-pointer"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* --- RESULTS LIST --- */}
            {filteredPubs.length === 0 ? (
                <div class="text-center py-20 opacity-50">
                    <p class="text-xl font-semibold">No publications found matching your filters.</p>
                    <button
                        onClick={() => {
                            setSearch("");
                            setSelectedYear("All");
                            setSelectedType("All");
                            setSelectedProject("All");
                        }}
                        class="btn btn-primary btn-outline mt-4"
                    >
                        Reset All
                    </button>
                </div>
            ) : (
                <div class="space-y-12">
                    {sortedGroupYears.map((year) => (
                        <section class="relative animate-in fade-in duration-500">
                            {/* Year Marker */}
                            <div class="sticky top-4 z-10 mb-6">
                                <span class="text-6xl font-black text-base-200 select-none absolute -top-8 -left-4 -z-10">
                                    {year}
                                </span>
                                <h2 class="text-3xl font-bold border-l-4 border-primary pl-4 py-1 bg-base-100/80 backdrop-blur-sm">
                                    {year}
                                </h2>
                            </div>

                            <div class="grid gap-6">
                                {groupedPubs[Number(year)].map((pub) => (
                                    <div class="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
                                        <div class="card-body p-6">
                                            <div class="flex flex-col md:flex-row gap-4 justify-between items-start">
                                                <div class="flex-1 space-y-2">
                                                    {/* Tags Row */}
                                                    <div class="flex flex-wrap gap-2 items-center mb-1">
                                                        <div
                                                            class={`badge ${pub.data.type === "Journal"
                                                                    ? "badge-secondary"
                                                                    : "badge-accent"
                                                                } badge-outline text-xs font-bold uppercase tracking-wider`}
                                                        >
                                                            {pub.data.type}
                                                        </div>
                                                        {pub.data.project && (
                                                            <div class="badge badge-ghost text-xs gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3 opacity-70">
                                                                    <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                                                                </svg>
                                                                {pub.data.project}
                                                            </div>
                                                        )}
                                                        <span class="text-xs text-base-content/50 font-mono">
                                                            | {pub.data.publication_date}
                                                        </span>
                                                    </div>

                                                    <h3 class="text-xl font-bold leading-tight">
                                                        <a
                                                            href={pub.data.doi}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            class="hover:text-primary transition-colors"
                                                        >
                                                            {pub.data.paper_title}
                                                        </a>
                                                    </h3>

                                                    <p class="text-sm font-medium text-base-content/80 italic">
                                                        {pub.data.venue}
                                                    </p>

                                                    <p class="text-sm text-base-content/60 leading-relaxed">
                                                        {pub.data.authors.join(", ")}
                                                    </p>
                                                </div>

                                                {/* Button */}
                                                <div class="flex-shrink-0 pt-1">
                                                    <a
                                                        href={pub.data.doi}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="btn btn-sm btn-outline btn-primary gap-2"
                                                    >
                                                        Read Paper
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}