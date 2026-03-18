import styles from "./footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p>&copy; {year} SEPIQ</p>
      </div>
    </footer>
  );
}
