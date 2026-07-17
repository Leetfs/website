"use client";

import styles from "../content.module.css";

export default function StudioPrintButton() {
  return (
    <button className={styles.utilityButton} type="button" onClick={() => window.print()}>
      打印 / PDF
    </button>
  );
}
