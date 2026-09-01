import type { CSSProperties } from "react";
import type { Timeline as TimelineData } from "../lib/timeline";
import styles from "./timeline.module.css";

type Props = {
  events: TimelineData;
};

type Domain = { start: number; end: number };

type Tick = { left: number; label: string; year: number | null };

const DAY = 24 * 60 * 60 * 1000;

const formatDate = (time: number): string =>
  new Date(time).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

const formatRange = (start: number, end: number | null): string =>
  end === null
    ? formatDate(start)
    : `${formatDate(start)} – ${formatDate(end)}`;

const monthStart = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), 1);
const nextMonthStart = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth() + 1, 1);

// A date-only string ("2026-09-01") parses as UTC midnight; render it in the
// local timezone so a day is never lost west of Greenwich.
const parseDate = (date: string): number => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).getTime();
};

// Domain spans from the start of the first event's month to the start of the
// month after the last one, so month ticks bracket every bar.
const buildDomain = (rows: Row[]): Domain => {
  const start = monthStart(
    new Date(Math.min(...rows.map((r) => r.start))),
  ).getTime();
  const end = nextMonthStart(
    new Date(Math.max(...rows.map((r) => r.end ?? r.start))),
  ).getTime();
  return { start, end };
};

const pct = (time: number, { start, end }: Domain): number =>
  end === start ? 0 : ((time - start) / (end - start)) * 100;

// One tick per month start across the whole domain. The year is spelled out on
// the first tick and every January to keep the scale readable but compact.
const buildTicks = (domain: Domain): Tick[] => {
  const ticks: Tick[] = [];
  let d = new Date(domain.start);
  let i = 0;
  while (d.getTime() <= domain.end) {
    ticks.push({
      left: pct(d.getTime(), domain),
      label: d.toLocaleDateString("en-GB", { month: "short" }),
      year: i === 0 || d.getMonth() === 0 ? d.getFullYear() : null,
    });
    d = nextMonthStart(d);
    i += 1;
  }
  return ticks;
};

type Row = {
  name: string;
  start: number;
  end: number | null;
};

export default function Timeline({ events }: Props) {
  if (events.length === 0) {
    return null;
  }

  const rows: Row[] = events.map((e) => {
    const start = parseDate(e.date);
    const end = e.endDate ? parseDate(e.endDate) : null;
    return {
      name: e.name,
      start,
      end: end !== null && end > start ? end : null,
    };
  });

  const domain = buildDomain(rows);
  const ticks = buildTicks(domain);

  // Today's marker, only when the challenge period actually contains it.
  const now = Date.now();
  const today =
    now >= domain.start && now <= domain.end ? pct(now, domain) : null;

  return (
    <div className={styles.timeline}>
      <div className={styles.axis}>
        {ticks.map((tick) => (
          <span
            key={tick.left}
            className={styles.month}
            style={{ left: `${tick.left}%` }}
          >
            {tick.label}
            {tick.year !== null ? (
              <span className={styles.year}>{tick.year}</span>
            ) : null}
          </span>
        ))}
      </div>

      <ol className={styles.rows}>
        {rows.map((row, i) => {
          // An open-ended event is a milestone: it gets a marker, not a bar.
          const left = pct(row.start, domain);
          const width =
            row.end === null ? 0 : pct(row.end + DAY, domain) - left;
          const barStyle = {
            left: `${left}%`,
            width: `${width}%`,
          } as CSSProperties;

          return (
            <li key={`${i}-${row.name}`} className={styles.row}>
              <div className={styles.meta}>
                <span className={styles.date}>
                  {formatRange(row.start, row.end)}
                </span>
                <span className={styles.name}>{row.name}</span>
              </div>
              <div className={styles.track}>
                {ticks.map((tick) => (
                  <span
                    key={tick.left}
                    className={styles.grid}
                    style={{ left: `${tick.left}%` }}
                  />
                ))}
                {today !== null ? (
                  <span
                    className={styles.today}
                    style={{ left: `${today}%` }}
                  />
                ) : null}
                {row.end === null ? (
                  <span
                    className={styles.milestone}
                    style={{ left: `${left}%` }}
                  />
                ) : (
                  <span className={styles.bar} style={barStyle} />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
