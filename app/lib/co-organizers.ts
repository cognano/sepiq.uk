import {
  type DBPageBase,
  FetchDatabase,
  type FetchDatabaseArgs,
  type PageObjectResponseEx,
  type RichTextItemResponse,
} from "rotion";

type CoOrganizerDBPage = DBPageBase & {
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
  };
};

export type CoOrganizer = {
  name: string;
  imgSrc: string;
  url: string;
};

export type CoOrganizers = CoOrganizer[];

const buildCoOrganizer = (page: CoOrganizerDBPage): CoOrganizer => {
  const props = page.properties;
  const p = page as unknown as PageObjectResponseEx;
  return {
    name: props.Name.title.map((v) => v.plain_text).join(",") || "",
    url: props.URL.url || "",
    imgSrc: p.cover?.src || "",
  };
};

const coOrganizersQuery = {
  database_id: process.env.NOTION_COORGANIZERS_DB_ID as string,
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

export const GetCoOrganizers = async (): Promise<CoOrganizers> => {
  const { results } = await FetchDatabase(coOrganizersQuery);
  return results.map((v) => {
    const p = v as CoOrganizerDBPage;
    return buildCoOrganizer(p);
  });
};
