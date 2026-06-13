import {
  type DBPageBase,
  FetchDatabase,
  type FetchDatabaseArgs,
  type PageObjectResponseEx,
  type RichTextItemResponse,
} from "rotion";

type SponsorDBPage = DBPageBase & {
  properties: {
    Name: {
      type: "title";
      title: RichTextItemResponse[];
      id: string;
    };
    URL: {
      type: "url";
      url: string;
      id: string;
    };
    Rank: {
      type: "select";
      select: { name: string } | null;
      id: string;
    };
  };
};

export type Sponsor = {
  name: string;
  imgSrc: string;
  url: string;
  rank: string;
};

export type Sponsors = Sponsor[];

export const sponsorRanks = ["Gold", "Silver", "Bronze", "In-kind"] as const;

const buildSponsor = (page: SponsorDBPage): Sponsor => {
  const props = page.properties;
  const p = page as unknown as PageObjectResponseEx;
  return {
    name: props.Name.title.map((v) => v.plain_text).join(",") || "",
    url: props.URL.url || "",
    imgSrc: p.cover?.src || "",
    rank: props.Rank.select?.name || "",
  };
};

const sponsorsQuery = {
  database_id: process.env.NOTION_SPONSORS_DB_ID as string,
  filter: {
    and: [
      {
        property: "Active",
        checkbox: {
          equals: true,
        },
      },
    ],
  },
  sorts: [
    {
      property: "Number",
      direction: "ascending",
    },
  ],
} as FetchDatabaseArgs;

export const GetSponsors = async (): Promise<Sponsors> => {
  const { results } = await FetchDatabase(sponsorsQuery);
  return results.map((v) => {
    const p = v as SponsorDBPage;
    return buildSponsor(p);
  });
};
