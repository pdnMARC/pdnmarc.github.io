import hashlib
import json
import re
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import pandas as pd

SHEET_ID = "1vhvcqlhc_bTdGScX3iYQ4T9HTD2uLbKD22rsrI_qA8U"
PUBLICATION_GID = "0"
NEWS_GID = "2048258914"

# "MARC Publications" sheet: one tab per project, one row per paper.
PROJECT_PUBLICATIONS_SHEET_ID = "15PZaRMJgW67znlJmfxWFvE1iHpc4NrFmBHFR3n7ldWc"
PROJECT_PUBLICATIONS_JSON = "src/collection_publications/project_publications.json"
YEAR_RE = re.compile(r"\b(19[5-9]\d|20\d\d)\b")
DOI_RE = re.compile(r"(10\.\d{4,9}/[^\s]+)", re.IGNORECASE)


def get_publications():
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={PUBLICATION_GID}"
    df = pd.read_csv(url)
    # drop empty rows
    df = df.dropna(how="any")
    print(df)
    # rename columns to make lower case and remove spaces
    df.columns = [col.strip().replace(" ", "_").lower() for col in df.columns]
    df["authors"] = df["authors"].apply(
        lambda x: [
            y.strip()
            for y in x.strip()
            .replace("\n", " ")
            .replace("\r", " ")
            .replace(",", ";")
            .split(";")
        ]
    )
    # only keep the author if it is not empty
    df["people"] = df["people"].apply(
        lambda x: [author.strip() for author in x.split(" ") if len(author.strip()) > 0]
    )
    df["id"] = df.index + 1
    df.to_json(
        "src/collection_publications/publications.json", orient="records", indent=2
    )
    return df


def get_news():
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={NEWS_GID}"
    df = pd.read_csv(url)
    print(df)
    # drop empty rows
    df = df.dropna(subset=["Title", "Date", "URL"])
    df = df.fillna("")
    # rename columns to make lower case and remove spaces
    df.columns = [col.strip().replace(" ", "_").lower() for col in df.columns]
    df["id"] = df.index + 1
    df.to_json("src/collection_news/social_news.json", orient="records", indent=2)
    return df


def _clean(value):
    """Collapse whitespace/newlines; empty string for blanks and NaN."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    return " ".join(str(value).split())


def _status(value):
    s = _clean(value).lower()
    if s.startswith("publi"):  # also catches the "Publiished" typo
        return "Published"
    if s.startswith("accept"):
        return "Accepted"
    if "review" in s:
        return "Under review"
    return ""


def _doi_and_url(value):
    """Return (doi, url) from a DOI, a doi.org link or any other link."""
    raw = _clean(value)
    match = DOI_RE.search(raw)
    if match:
        doi = match.group(1).rstrip(".,;")
        return doi, f"https://doi.org/{doi}"
    if raw.startswith("http"):
        return "", raw
    return "", ""


def _doi_year(doi):
    """Publication year from the DOI registry (Crossref, DataCite/arXiv) via content negotiation."""
    request = urllib.request.Request(
        f"https://doi.org/{urllib.parse.quote(doi, safe='/')}",
        headers={
            "Accept": "application/vnd.citationstyles.csl+json",
            "User-Agent": "MARC-website-build (mailto:marc@eng.pdn.ac.lk)",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            data = json.load(response)
    except Exception as error:  # network or registry problems must not break the build
        print(f"  year lookup failed for {doi}: {error}")
        return None
    for key in ("issued", "published-print", "published-online", "published"):
        parts = (data.get(key) or {}).get("date-parts") or []
        if parts and parts[0] and parts[0][0]:
            return int(parts[0][0])
    return None


def _column(df, *prefixes):
    """Find a column by (case-insensitive) name prefix; the sheet headers are free text."""
    for col in df.columns:
        name = str(col).strip().lower()
        if any(name == p or name.startswith(p) for p in prefixes):
            return col
    return None


def get_project_publications():
    url = f"https://docs.google.com/spreadsheets/d/{PROJECT_PUBLICATIONS_SHEET_ID}/export?format=xlsx"
    tabs = pd.read_excel(url, sheet_name=None, dtype=str)

    papers = {}
    for tab_name, df in tabs.items():
        project = _clean(tab_name)
        cols = {
            "title": _column(df, "paper title", "title"),
            "type": _column(df, "journal/conference"),
            "venue": _column(df, "journal/conference name", "venue"),
            "authors": _column(df, "authors"),
            "status": _column(df, "review status", "status"),
            "doi": _column(df, "doi"),
        }
        # "Journal/Conference" is a prefix of "Journal/Conference Name": pick the exact one for type.
        cols["type"] = next(
            (c for c in df.columns if str(c).strip().lower() == "journal/conference"), cols["type"]
        )
        if cols["title"] is None:
            print(f"  skipping tab {project!r}: no 'Paper Title' column")
            continue

        for _, row in df.iterrows():
            title = _clean(row.get(cols["title"]))
            if not title:
                continue
            doi, link = _doi_and_url(row.get(cols["doi"])) if cols["doi"] else ("", "")
            key = doi.lower() or re.sub(r"[^a-z0-9]", "", title.lower())
            if key in papers:  # the same paper listed under several projects
                if project not in papers[key]["projects"]:
                    papers[key]["projects"].append(project)
                continue
            venue = _clean(row.get(cols["venue"])) if cols["venue"] else ""
            papers[key] = {
                "id": hashlib.sha1(key.encode("utf-8")).hexdigest()[:12],
                "title": title,
                "type": _clean(row.get(cols["type"])).title() if cols["type"] else "",
                "venue": venue,
                "authors": _clean(row.get(cols["authors"])) if cols["authors"] else "",
                "status": _status(row.get(cols["status"])) if cols["status"] else "",
                "doi": doi,
                "url": link,
                "projects": [project],
                "year": None,
            }

    # Year: the year in the venue name (e.g. "2024 MERCon"), else the DOI record, else a year in the link.
    pending = []
    for paper in papers.values():
        venue_year = YEAR_RE.search(paper["venue"])
        if venue_year:
            paper["year"] = int(venue_year.group(1))
        elif paper["doi"]:
            pending.append(paper)
    with ThreadPoolExecutor(max_workers=6) as pool:
        for paper, year in zip(pending, pool.map(lambda p: _doi_year(p["doi"]), pending)):
            paper["year"] = year
    for paper in papers.values():
        if paper["year"] is None and paper["url"]:
            url_year = YEAR_RE.search(paper["url"])
            if url_year:
                paper["year"] = int(url_year.group(1))

    records = list(papers.values())
    with open(PROJECT_PUBLICATIONS_JSON, "w", encoding="utf-8") as fh:
        json.dump(records, fh, ensure_ascii=False, indent=2)
    print(f"  {len(records)} publications from {len(tabs)} project tabs")
    return records


def main():
    print("Syncing publications data...")
    get_publications()
    print("Syncing project publications data...")
    get_project_publications()
    print("Syncing news data...")
    get_news()
    print("Data sync complete.")


if __name__ == "__main__":
    main()
