import Image from "next/image";
import styles from "./header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <Image src="/sepiq.svg" width={180} height={60} alt="SEPIQ" />
    </header>
  )
};
