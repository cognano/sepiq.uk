import {
  type DBPageBase,
  FetchBlocks,
  FetchDatabase,
  FetchPage,
  type ListBlockChildrenResponseEx,
  type PageObjectResponseEx,
} from "rotion";
import Blocks from "./components/blocks";
import styles from "./page.module.css";

const title =
  "Call for Participation: SEPIQ VHH-Epitope-Prediction Challenge 2026";

type DBPage = DBPageBase & {
  properties: {
    Name: {
      type: 'title'
      title: RichTextItemResponse[]
      id: string
    }
    URL: {
      type: 'url'
      url: string
      id: string
    }
  }
};

type CoOrganizer = {
  name: string
  imgSrc: string | null
  url: string | null
};

type CoOrganizers = CoOrganizer[];

type HomeContents = {
  tagline: string
  blocks: ListBlockChildrenResponseEx
};

const build = (page: DBPage): CoOrganizer => {
  const props = page.properties;
  const p = page as unknown as PageObjectResponseEx;
  return {
    name: props.Name.title.map((v) => v.plain_text).join(',') || '',
    url: props.URL.url || null,
    imgSrc: p.cover?.src || null,
  };
};

const coOrganizersQuery = {
  database_id: process.env.NOTION_COORGANIZERS_DB_ID as string,
  filter: {
    and: [
      {
        property: 'Active',
        checkbox: {
          equals: true,
        },
      },
    ],
  },
  sorts: [
    {
      property: 'Number',
      direction: 'ascending',
    },
  ],
} as FetchDatabaseArgs

const GetCoOrganizers = async (): Promise<CoOrganizers> => {
  const { results } = await FetchDatabase(coOrganizersQuery);
  return results.map((v) => {
    const p = v as DBPage
    return build(p)
  });
};

const GetHomeContents = async (): Promise<HomeContents> => {
  const page_id = process.env.NOTION_HOME_PAGE_ID as string;
  const page = (await FetchPage({ page_id })) as PageObjectResponseEx;
  const block_id = page_id;
  const last_edited_time = page.last_edited_time;
  const blocks = (await FetchBlocks({
    block_id,
    last_edited_time,
  })) as ListBlockChildrenResponseEx;
  const titleProperty = page.properties.title as {
    title: Array<{ plain_text: string }>;
  };
  const tagline = titleProperty.title[0].plain_text;
  return {
    tagline,
    blocks,
  };
};

const GetAbout = async (): Promise<ListBlockChildrenResponseEx> => {
  const page_id = process.env.NOTION_ABOUT_PAGE_ID as string;
  const page = (await FetchPage({ page_id })) as PageObjectResponseEx;
  const block_id = page_id;
  const last_edited_time = page.last_edited_time;
  return (await FetchBlocks({
    block_id,
    last_edited_time,
  })) as ListBlockChildrenResponseEx;
};

export default async function Home() {
  const [cont, about, orgs] = await Promise.all([
    GetHomeContents(),
    GetAbout(),
    GetCoOrganizers(),
  ]);

  return (
    <>
      <div className={styles.main}>
        <div className={styles.mainInner}>
          <div className={styles.title}>{title}</div>
          <h1 className={styles.tagline}> {cont.tagline} </h1>
          <Blocks blocks={cont.blocks} />
        </div>
      </div>

      <div className={styles.coOrganizers}>
        <h2 className={styles.secondTitle}>Co-Organizers</h2>
        <ul>
          {orgs.map((v: CoOrganizer) => (
            <li className={styles.coOrganizer}>
              <a href={v.url} target="_blank" rel="noopener noreferrer">
                <img src={v.imgSrc} alt={v.name} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.main}>
        <div className={styles.mainInner}>
          <Blocks blocks={about} />
        </div>
      </div>
    </>
  );
}
