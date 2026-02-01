import styles from "./header.module.css";
import SepiqLogo from "./SepiqLogo";

export default function Header() {
  return (
    <header className={styles.header}>
      <SepiqLogo />
    </header>
  );
}
