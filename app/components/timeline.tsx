import type { CSSProperties } from "react";
import type { Timeline as TimelineData } from "../lib/timeline";
import styles from "./timeline.module.css";

type Props = {
  events: TimelineData;
};

const CONNECTOR_BASE = 30; // px: line length from the dot to the first label
const ROW = 64; // px: vertical gap between stacked labels on the same side
const ALT_OFFSET = 104; // px: extra line length for every other label on a side
const LABEL_SPACE = 80; // px: room reserved for the label box itself

type Domain = { start: number; end: number };

type Tick = { left: number; label: string };

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

const formatRange = (date: string, endDate: string): string =>
  endDate ? `${formatDate(date)} – ${formatDate(endDate)}` : formatDate(date);

const monthStart = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), 1);
const nextMonthStart = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth() + 1, 1);

// Domain spans from the start of the first event's month to the start of the
// month after the last event, so month ticks bracket every event.
const buildDomain = (events: TimelineData): Domain => {
  const times = events.map((e) => new Date(e.date).getTime());
  const start = monthStart(new Date(Math.min(...times))).getTime();
  const end = nextMonthStart(new Date(Math.max(...times))).getTime();
  return { start, end };
};

const pct = (time: number, { start, end }: Domain): number =>
  end === start ? 50 : ((time - start) / (end - start)) * 100;

// One tick per month start across the whole domain. The year is shown on
// the first tick and every January to keep the scale readable but compact.
const buildTicks = (domain: Domain): Tick[] => {
  const ticks: Tick[] = [];
  let d = new Date(domain.start);
  let i = 0;
  while (d.getTime() <= domain.end) {
    const label =
      i === 0 || d.getMonth() === 0
        ? d.toLocaleDateString("en-GB", { month: "short", year: "numeric" })
        : d.toLocaleDateString("en-GB", { month: "short" });
    ticks.push({ left: pct(d.getTime(), domain), label });
    d = nextMonthStart(d);
    i += 1;
  }
  return ticks;
};

// Stagger labels when points are horizontally close so that names do not
// overlap. Points are sorted ascending by date, so duplicates are adjacent.
const stackLevels = (lefts: number[]): number[] => {
  const threshold = 8; // percent: labels closer than this share a cluster
  const levels: number[] = [];
  let clusterStart = Number.NEGATIVE_INFINITY;
  let level = 0;
  for (const left of lefts) {
    if (left - clusterStart < threshold) {
      level += 1;
    } else {
      level = 0;
      clusterStart = left;
    }
    levels.push(level);
  }
  return levels;
};

// Even levels go below the line, odd levels above; `depth` is the stacking
// distance from the line on that side. Duplicates thus split to both sides.
const placement = (level: number) => ({
  above: level % 2 === 1,
  depth: Math.floor(level / 2),
});

export default function Timeline({ events }: Props) {
  if (events.length === 0) {
    return null;
  }

  const domain = buildDomain(events);
  const lefts = events.map((e) => pct(new Date(e.date).getTime(), domain));
  const ticks = buildTicks(domain);
  const levels = stackLevels(lefts);

  // Alternate the connector length for consecutive labels on the same side
  // (a zigzag) so neighbouring labels sit at different heights and their text
  // does not overlap. The alternating offset is applied on mobile only (via
  // CSS), so each row carries its base length and the extra offset separately.
  let aboveSeen = 0;
  let belowSeen = 0;
  const rows = levels.map((level) => {
    const { above, depth } = placement(level);
    const tier = above ? aboveSeen++ % 2 : belowSeen++ % 2;
    return {
      above,
      base: CONNECTOR_BASE + depth * ROW,
      alt: tier * ALT_OFFSET,
    };
  });

  const extent = (above: boolean, withAlt: boolean) =>
    rows
      .filter((r) => r.above === above)
      .reduce((max, r) => Math.max(max, r.base + (withAlt ? r.alt : 0)), 0);

  const spaceVars = {
    "--above-space": `${Math.max(48, extent(true, false) + LABEL_SPACE)}px`,
    "--above-space-m": `${Math.max(48, extent(true, true) + LABEL_SPACE)}px`,
    "--below-space": `${extent(false, false) + LABEL_SPACE}px`,
    "--below-space-m": `${extent(false, true) + LABEL_SPACE}px`,
  } as CSSProperties;

  return (
    <div className={styles.timeline} style={spaceVars}>
      <div className={styles.line} />
      <div className={styles.track}>
        {ticks.map((tick) => (
          <div
            key={tick.label}
            className={styles.tick}
            style={{ left: `${tick.left}%` }}
          >
            <span className={styles.tickMark} />
            <span className={styles.tickLabel}>{tick.label}</span>
          </div>
        ))}
        {events.map((event, i) => {
          const { above, base, alt } = rows[i];
          return (
            <div
              key={`${i}-${event.name}`}
              className={`${styles.point} ${above ? styles.pointAbove : styles.pointBelow}`}
              style={{ left: `${lefts[i]}%` }}
            >
              <span className={styles.dot} />
              <span
                className={styles.connector}
                style={
                  {
                    "--base": `${base}px`,
                    "--alt": `${alt}px`,
                  } as CSSProperties
                }
              />
              <div
                className={`${styles.label} ${above ? styles.labelAbove : ""}`}
              >
                <span className={styles.date}>
                  {formatRange(event.date, event.endDate)}
                </span>
                <span className={styles.name}>{event.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
