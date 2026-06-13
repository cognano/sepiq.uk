import type { Timeline as TimelineData } from "../lib/timeline";
import styles from "./timeline.module.css";

type Props = {
  events: TimelineData;
};

const CONNECTOR_BASE = 30; // px: line length from the dot to the first label
const ROW = 64; // px: vertical gap between stacked labels on the same side
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
  const placements = levels.map(placement);

  const extent = (above: boolean) =>
    placements
      .filter((p) => p.above === above)
      .reduce((max, p) => Math.max(max, CONNECTOR_BASE + p.depth * ROW), 0);

  const aboveSpace = Math.max(48, extent(true) + LABEL_SPACE);
  const belowSpace = extent(false) + LABEL_SPACE;

  return (
    <div className={styles.timeline} style={{ paddingTop: `${aboveSpace}px` }}>
      <div className={styles.line} style={{ top: `${aboveSpace}px` }} />
      <div className={styles.track} style={{ minHeight: `${belowSpace}px` }}>
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
          const { above, depth } = placements[i];
          return (
            <div
              key={`${i}-${event.name}`}
              className={`${styles.point} ${above ? styles.pointAbove : styles.pointBelow}`}
              style={{ left: `${lefts[i]}%` }}
            >
              <span className={styles.dot} />
              <span
                className={styles.connector}
                style={{ height: `${CONNECTOR_BASE + depth * ROW}px` }}
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
