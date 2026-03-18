import Link from "next/link";
import styles from "./header.module.css";
import SepiqLogo from "./SepiqLogo";

export default function Header() {
  return (
    <header className={styles.header}>
      <SepiqLogo />
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLink}>Home</Link>
        <Link href="/about" className={styles.navLink}>About</Link>
        <Link href="/brand" className={styles.navLink}>Brand</Link>
      </nav>
    </header>
  );
}
