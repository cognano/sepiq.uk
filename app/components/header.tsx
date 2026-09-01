"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./header.module.css";
import SepiqLogo from "./SepiqLogo";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/detail", label: "Detail" },
  { href: "/guideline", label: "Guideline" },
  { href: "/brand", label: "Brand" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  // The menu covers the page, so let Escape dismiss it like any other overlay.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className={styles.header}>
      <SepiqLogo />

      <nav className={styles.nav}>
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className={styles.navLink}>
            {label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className={`${styles.toggle} ${open ? styles.toggleOpen : ""}`}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      <nav
        id="mobile-nav"
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
      >
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={styles.panelLink}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
