import Image from "next/image";
import Link from "next/link";
import type { ListBlockChildrenResponseEx } from "rotion";
import Blocks from "./components/blocks";
import Timeline from "./components/timeline";
import { type CoOrganizer, GetCoOrganizers } from "./lib/co-organizers";
import { GetContents } from "./lib/contents";
import { GetSponsors, type Sponsor, sponsorRanks } from "./lib/sponsors";
import { GetTimeline } from "./lib/timeline";
import styles from "./page.module.css";

type HomeContents = {
  title: string;
  blocks: ListBlockChildrenResponseEx;
};

const GetHomeContents = async (): Promise<HomeContents> => {
  const { title, blocks } = await GetContents("hero");
  return { title, blocks };
};

export default async function Home() {
  const [cont, about, timeline, faq, orgs, celebrate, sponsors] =
    await Promise.all([
      GetHomeContents(),
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
          <div className={styles.title}>
            Call for Participation: SEPIQ VHH-Epitope-Prediction Challenge 2026
          </div>
          <h1 className={styles.tagline}> {cont.title} </h1>
          <Blocks blocks={cont.blocks} />
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
