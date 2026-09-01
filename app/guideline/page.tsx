import Link from "next/link";
import Blocks from "../components/blocks";
import { GetContents } from "../lib/contents";
import styles from "../styles/content.module.css";

export default async function Guideline() {
  const { title, blocks } = await GetContents("guideline");

  return (
    <div className={styles.main}>
      <div className={styles.mainInner}>
        <h1 className={styles.title}>{title}</h1>
        <Blocks blocks={blocks} />
        <div className={styles.ctaRow}>
          <Link
            href="https://huggingface.co/spaces/sepiq-2026/SEPIQ-2026-Challenge"
            className={styles.primaryButton}
          >
            Join the Challenge
          </Link>
          <Link href="/detail" className={styles.secondaryButton}>
            See the Details
          </Link>
        </div>
      </div>
    </div>
  );
}
