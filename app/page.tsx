import type { Metadata } from "next";
import {
  FetchBlocks,
  FetchPage,
  type ListBlockChildrenResponseEx,
  type PageObjectResponseEx,
} from "rotion";
import Blocks from "./components/blocks";
import styles from "./page.module.css";

const title =
  "Call for Participation: SEPIQ VHH-Epitope-Prediction Challenge 2026";

export default async function Home() {
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

  return (
    <>
      <div className={styles.title}>{title}</div>
      <h1 className={styles.tagline}> {tagline} </h1>
      <Blocks blocks={blocks} />
    </>
  );
}
