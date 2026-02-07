import pandas as pd

SHEET_ID = "1lardxEdOL6BTCCHxjU3uGfWWE30H4kxv5pO5OklLwKs"
PUBLICATION_GID = "0"
NEWS_GID = "2048258914"


def get_publications():
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={PUBLICATION_GID}"
    df = pd.read_csv(url)
    print(df)
    # drop empty rows
    df = df.dropna(how="all")
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
    df["people"] = df["people"].apply(
        lambda x: [author.strip() for author in x.split(" ")]
    )
    df["id"] = df.index + 1
    df.to_json(
        "src/publication_collection/publications.json", orient="records", indent=2
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
    df.to_json("src/news_collection/social_news.json", orient="records", indent=2)
    return df


def main():
    print("Syncing publications data...")
    get_publications()
    print("Syncing news data...")
    get_news()
    print("Data sync complete.")


if __name__ == "__main__":
    main()
