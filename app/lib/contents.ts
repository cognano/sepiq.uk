import {
  type DBPageBase,
  FetchBlocks,
  FetchDatabase,
  type FetchDatabaseArgs,
  FetchPage,
  type ListBlockChildrenResponseEx,
  type PageObjectResponseEx,
  type RichTextItemResponse,
} from "rotion";

type ContentsDBPage = DBPageBase & {
  properties: {
    Name: {
      type: "title";
      title: RichTextItemResponse[];
      id: string;
    };
    Slug: {
      type: "select";
      select: { name: string } | null;
      id: string;
    };
  };
};

const contentsQuery = {
  database_id: process.env.NOTION_CONTENTS_DB_ID as string,
} as FetchDatabaseArgs;

export const GetContents = async (
  slug: string,
): Promise<ListBlockChildrenResponseEx> => {
  const { results } = await FetchDatabase(contentsQuery);
  const page = results.find((v) => {
    const p = v as unknown as ContentsDBPage;
    return p.properties.Slug?.select?.name === slug;
  }) as unknown as ContentsDBPage | undefined;

  if (!page) {
    throw new Error(`Content not found for slug: ${slug}`);
  }

  const page_id = page.id;
  const fetched = (await FetchPage({ page_id })) as PageObjectResponseEx;
  const last_edited_time = fetched.last_edited_time;
  return (await FetchBlocks({
    block_id: page_id,
    last_edited_time,
  })) as ListBlockChildrenResponseEx;
};
