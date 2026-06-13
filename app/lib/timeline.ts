import {
  type DateResponse,
  type DBPageBase,
  FetchDatabase,
  type FetchDatabaseArgs,
  type RichTextItemResponse,
} from "rotion";

type TimelineDBPage = DBPageBase & {
  properties: {
    Name: {
      type: "title";
      title: RichTextItemResponse[];
      id: string;
    };
    Date: {
      type: "date";
      date: DateResponse | null;
      id: string;
    };
  };
};

export type TimelineEvent = {
  name: string;
  date: string;
  endDate: string;
};

export type Timeline = TimelineEvent[];

const buildTimelineEvent = (page: TimelineDBPage): TimelineEvent => {
  const props = page.properties;
  return {
    name: props.Name.title.map((v) => v.plain_text).join(",") || "",
    date: props.Date.date?.start || "",
    endDate: props.Date.date?.end || "",
  };
};

const timelineQuery = {
  database_id: process.env.NOTION_TIMELINE_DB_ID as string,
  sorts: [
    {
      property: "Date",
      direction: "ascending",
    },
  ],
} as FetchDatabaseArgs;

export const GetTimeline = async (): Promise<Timeline> => {
  const { results } = await FetchDatabase(timelineQuery);
  return results
    .map((v) => {
      const p = v as TimelineDBPage;
      return buildTimelineEvent(p);
    })
    .filter((e) => e.date !== "");
};
