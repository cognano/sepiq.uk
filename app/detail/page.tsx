import Blocks from "../components/blocks";
import { GetContents } from "../lib/contents";
import styles from "../styles/content.module.css";

export default async function Detail() {
  const { title, blocks } = await GetContents("detail");

  return (
    <div className={styles.main}>
      <div className={styles.mainInner}>
        <h1 className={styles.title}>{title}</h1>
        <Blocks blocks={blocks} containImages />
      </div>
    </div>
  );
}
