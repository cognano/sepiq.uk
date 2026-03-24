import Blocks from "../components/blocks";
import { GetContents } from "../lib/contents";
import styles from "./page.module.css";

export default async function About() {
  const { blocks } = await GetContents("about");

  return (
    <div className={styles.main}>
      <div className={styles.mainInner}>
        <Blocks blocks={blocks} />
      </div>
    </div>
  );
}
