"use client";

import { useMemo } from "react";
import type { ListBlockChildrenResponseEx } from "rotion";
import { Page } from "rotion/ui";
import styles from "./blocks.module.css";

type Props = {
  blocks: ListBlockChildrenResponseEx;
  // Images bleed past the text column by default; set this where they are
  // meant to stay inside it.
  containImages?: boolean;
};

type CodeText = { plain_text: string; text: { content: string } };

// rotion renders equations as MathML, where KaTeX turns a top-level `\\` into
// `<mspace linebreak="newline">` — markup browsers ignore, so a multi-line
// formula collapses onto one line. Wrapping the source in `gathered` makes
// KaTeX emit an `<mtable>` instead, which MathML does lay out as rows.
// Environments (aligned, cases, …) already arrange their own rows.
const wrapLineBreaks = (expression: string): string =>
  expression.includes("\\\\") && !expression.includes("\\begin{")
    ? `\\begin{gathered}${expression}\\end{gathered}`
    : expression;

// Notion splits the body of a code block into several rich text runs whenever
// parts of it are annotated (a coloured comment, say), and rotion renders one
// `<pre>` per run — so a single block shows up as several. Join the runs back
// into one; rotion only reads their text, so nothing is lost.
const mergeCodeText = (
  code: Record<string, unknown>,
): Record<string, unknown> => {
  const parts = code.rich_text as CodeText[];
  if (parts.length < 2) {
    return code;
  }
  const content = parts.map((part) => part.text?.content ?? "").join("");
  const [first] = parts;
  return {
    ...code,
    rich_text: [
      { ...first, plain_text: content, text: { ...first.text, content } },
    ],
  };
};

const isCodeValue = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  Array.isArray((value as { rich_text?: unknown }).rich_text);

// Equations and code blocks appear at several depths (blocks, inline rich
// text, table cells), so walk the whole tree rather than each block type.
const normalize = <T,>(node: T): T => {
  if (Array.isArray(node)) {
    return node.map((child) => normalize(child)) as T;
  }
  if (node === null || typeof node !== "object") {
    return node;
  }
  const entries = Object.entries(node as Record<string, unknown>).map(
    ([key, value]) => {
      if (key === "expression" && typeof value === "string") {
        return [key, wrapLineBreaks(value)];
      }
      if (key === "code" && isCodeValue(value)) {
        return [key, mergeCodeText(value)];
      }
      return [key, normalize(value)];
    },
  );
  return Object.fromEntries(entries) as T;
};

export default function Blocks({ blocks, containImages }: Props) {
  const normalized = useMemo(() => normalize(blocks), [blocks]);

  return (
    <div
      className={`${styles.blocks} ${containImages ? styles.containImages : ""}`}
    >
      <Page blocks={normalized} />
    </div>
  );
}
