"use client";

import type { ListBlockChildrenResponseEx } from "rotion";
import { Page } from "rotion/ui";
import styles from "./blocks.module.css";

type Props = {
  blocks: ListBlockChildrenResponseEx;
};

export default function Blocks({ blocks }: Props) {
  return (
    <div className={styles.blocks}>
      <Page blocks={blocks} />
    </div>
  );
}
