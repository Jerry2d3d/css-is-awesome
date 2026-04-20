import styles from "./LogoMark.module.scss";

export default function LogoMark() {
  return (
    <span className={styles.mark} aria-hidden="true">
      <span>CSS</span>
      <span>IS</span>
      <span>AWES</span>
    </span>
  );
}
