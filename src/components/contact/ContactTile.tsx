import { Mail, Phone, Calendar } from "lucide-react";
import styles from "./ContactTile.module.scss";

type TileType = "email" | "phone" | "meeting";

interface ContactTileProps {
  type: TileType;
  title: string;
  desc: string;
  actionLabel: string;
  href: string;
  loading?: boolean;
}

function ContactTile({
  type,
  title,
  desc,
  actionLabel,
  href,
  loading,
}: ContactTileProps) {
  const Icon = type === "email" ? Mail : type === "phone" ? Phone : Calendar;

  if (loading) {
    return (
      <div className={styles.tile}>
        <div className={styles.tile__header}>
          <div className={`${styles.tile__icon} animate-pulse bg-gray-200`} />
          <div
            className={`${styles.tile__title} h-6 w-24 bg-gray-200 rounded-sm animate-pulse`}
          />
        </div>
        <div
          className={`${styles.tile__desc} h-4 w-32 bg-gray-200 rounded-sm animate-pulse mt-2`}
        />
        <div className={styles.tile__footer}>
          <div
            className={`${styles.tile__action} h-5 w-40 bg-gray-200 rounded-sm animate-pulse`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tile}>
      <div className={styles.tile__header}>
        <div className={styles.tile__icon}>
          <Icon size={20} />
        </div>
        <h3 className={styles.tile__title}>{title}</h3>
      </div>
      <p className={styles.tile__desc}>{desc}</p>
      <div className={styles.tile__footer}>
        <a
          className={styles.tile__action}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {actionLabel}
        </a>
      </div>
    </div>
  );
}

export default ContactTile;
