import Image from "next/image";
import Link from "next/link";
import Blocks from "./components/blocks";
import Timeline from "./components/timeline";
import { type CoOrganizer, GetCoOrganizers } from "./lib/co-organizers";
import { GetContents } from "./lib/contents";
import { GetSponsors, type Sponsor, sponsorRanks } from "./lib/sponsors";
import { GetTimeline } from "./lib/timeline";
import styles from "./page.module.css";

export default async function Home() {
  const [hero, overview, about, timeline, faq, orgs, celebrate, sponsors] =
    await Promise.all([
      GetContents("hero"),
      GetContents("overview"),
      GetContents("whatis").then((c) => c.blocks),
      GetTimeline(),
      GetContents("faq").then((c) => c.blocks),
      GetCoOrganizers(),
      GetContents("celebrate").then((c) => c.blocks),
      GetSponsors(),
    ]);

  return (
    <>
      <div className={styles.main}>
        <div className={styles.mainInner}>
          <div className={styles.title}>{overview.title}</div>
          <h1 className={styles.tagline}> {hero.title} </h1>
          <Blocks blocks={hero.blocks} />
          <div className={styles.ctaRow}>
            <Link
              href="https://huggingface.co/spaces/sepiq-2026/SEPIQ-2026-Challenge"
              className={styles.challengeButton}
            >
              Join the Challenge
            </Link>
            <Link href="/detail" className={styles.detailButton}>
              See the Details
            </Link>
          </div>
          <div className={styles.overviewBlock}>
            <Blocks blocks={overview.blocks} />
          </div>
          <div className={styles.ctaRow}>
            <Link
              href="https://huggingface.co/spaces/sepiq-2026/SEPIQ-2026-Challenge"
              className={styles.challengeButton}
            >
              Join the Challenge
            </Link>
            <Link href="/detail" className={styles.detailButton}>
              See the Details
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.partnersSection}>
        <div className={styles.timelineSection}>
          <h2 className={styles.secondTitle}>Timeline</h2>
          <Timeline events={timeline} />
        </div>

        <div className={styles.contentBlock}>
          <Blocks blocks={faq} />
        </div>

        <div className={styles.coOrganizers}>
          <h2 className={styles.secondTitle}>Co-Organizers</h2>
          <ul>
            {orgs.map((v: CoOrganizer) => (
              <li key={v.name} className={styles.coOrganizer}>
                <a href={v.url} target="_blank" rel="noopener noreferrer">
                  <Image src={v.imgSrc} alt={v.name} width={300} height={300} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.contentBlock}>
          <Blocks blocks={celebrate} />
          <div className={styles.ctaRow}>
            <Link
              href="https://huggingface.co/spaces/sepiq-2026/SEPIQ-2026-Challenge"
              className={styles.challengeButton}
            >
              Join the Challenge
            </Link>
            <Link href="/detail" className={styles.detailButton}>
              See the Details
            </Link>
          </div>
        </div>

        <div className={styles.sponsorsSection}>
          <h2 className={styles.secondTitle}>Sponsors</h2>
          {sponsorRanks.map((rank) => {
            const items = sponsors.filter((s) => s.rank === rank);
            const rankClass =
              styles[`rank${rank.replace("-", "")}` as keyof typeof styles] ||
              "";
            return (
              <div key={rank} className={`${styles.sponsorRank} ${rankClass}`}>
                <h3 className={styles.rankTitle}>{rank}</h3>
                {items.length === 0 ? (
                  <p className={styles.rankEmpty}>Coming soon</p>
                ) : (
                  <ul>
                    {items.map((v: Sponsor) => (
                      <li key={v.name}>
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={v.imgSrc}
                            alt={v.name}
                            width={300}
                            height={300}
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.mainInner}>
          <Blocks blocks={about} />
          <div className={styles.buttonGroup}>
            <Link href="/about" className={styles.aboutButton}>
              Learn More
            </Link>
            <Link href="/brand" className={styles.brandButton}>
              Brand
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
