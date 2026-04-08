import Image from "next/image";
import Link from "next/link";
import {
  type DBPageBase,
  FetchDatabase,
  type FetchDatabaseArgs,
  type ListBlockChildrenResponseEx,
  type PageObjectResponseEx,
  type RichTextItemResponse,
} from "rotion";
import Blocks from "./components/blocks";
import { GetContents } from "./lib/contents";
import styles from "./page.module.css";

type DBPage = DBPageBase & {
  properties: {
    Name: {
      type: "title";
      title: RichTextItemResponse[];
      id: string;
    };
    URL: {
      type: "url";
      url: string;
      id: string;
    };
  };
};

type SponsorDBPage = DBPageBase & {
  properties: {
    Name: {
      type: "title";
      title: RichTextItemResponse[];
      id: string;
    };
    URL: {
      type: "url";
      url: string;
      id: string;
    };
    Rank: {
      type: "select";
      select: { name: string } | null;
      id: string;
    };
  };
};

type CoOrganizer = {
  name: string;
  imgSrc: string;
  url: string;
};

type CoOrganizers = CoOrganizer[];

type Sponsor = {
  name: string;
  imgSrc: string;
  url: string;
  rank: string;
};

type Sponsors = Sponsor[];

type HomeContents = {
  title: string;
  blocks: ListBlockChildrenResponseEx;
};

const buildCoOrganizer = (page: DBPage): CoOrganizer => {
  const props = page.properties;
  const p = page as unknown as PageObjectResponseEx;
  return {
    name: props.Name.title.map((v) => v.plain_text).join(",") || "",
    url: props.URL.url || "",
    imgSrc: p.cover?.src || "",
  };
};

const buildSponsor = (page: SponsorDBPage): Sponsor => {
  const props = page.properties;
  const p = page as unknown as PageObjectResponseEx;
  return {
    name: props.Name.title.map((v) => v.plain_text).join(",") || "",
    url: props.URL.url || "",
    imgSrc: p.cover?.src || "",
    rank: props.Rank.select?.name || "",
  };
};

const coOrganizersQuery = {
  database_id: process.env.NOTION_COORGANIZERS_DB_ID as string,
  filter: {
    and: [
      {
        property: "Active",
        checkbox: {
          equals: true,
        },
      },
    ],
  },
  sorts: [
    {
      property: "Number",
      direction: "ascending",
    },
  ],
} as FetchDatabaseArgs;

const GetCoOrganizers = async (): Promise<CoOrganizers> => {
  const { results } = await FetchDatabase(coOrganizersQuery);
  return results.map((v) => {
    const p = v as DBPage;
    return buildCoOrganizer(p);
  });
};

const sponsorsQuery = {
  database_id: process.env.NOTION_SPONSORS_DB_ID as string,
  filter: {
    and: [
      {
        property: "Active",
        checkbox: {
          equals: true,
        },
      },
    ],
  },
  sorts: [
    {
      property: "Number",
      direction: "ascending",
    },
  ],
} as FetchDatabaseArgs;

const GetSponsors = async (): Promise<Sponsors> => {
  const { results } = await FetchDatabase(sponsorsQuery);
  return results.map((v) => {
    const p = v as SponsorDBPage;
    return buildSponsor(p);
  });
};

const GetHomeContents = async (): Promise<HomeContents> => {
  const { title, blocks } = await GetContents("hero");
  return { title, blocks };
};

const sponsorRanks = ["Gold", "Silver", "Bronze", "In-kind"] as const;

export default async function Home() {
  const [cont, about, orgs, sponsors] = await Promise.all([
    GetHomeContents(),
    GetContents("whatis").then((c) => c.blocks),
    GetCoOrganizers(),
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

        <h2 className={styles.secondTitle}>Sponsors</h2>
        {sponsorRanks.map((rank) => {
          const items = sponsors.filter((s) => s.rank === rank);
          const rankClass =
            styles[`rank${rank.replace("-", "")}` as keyof typeof styles] || "";
          return (
            <div key={rank} className={`${styles.sponsorRank} ${rankClass}`}>
              <h3 className={styles.rankTitle}>{rank}</h3>
              {items.length === 0 ? (
                <p className={styles.rankEmpty}>Coming soon</p>
              ) : (
                <ul>
                  {items.map((v: Sponsor) => (
                    <li key={v.name}>
                      <a href={v.url} target="_blank" rel="noopener noreferrer">
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
