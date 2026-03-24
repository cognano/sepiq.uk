import Blocks from "../components/blocks";
import { GetContents } from "../lib/contents";
import styles from "./page.module.css";

export default async function Brand() {
  const { blocks } = await GetContents("brand");

  return (
    <div className={styles.main}>
      <div className={styles.mainInner}>
        <Blocks blocks={blocks} />
      </div>
    </div>
  );
}
