import { FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";

import { getProjectImageUrl } from "@/services/portfolio";
import type { PortfolioProject } from "@/types/portfolio";
import styles from "./Portfolio.module.css";

interface PortfolioProjectCardProps {
  readonly project: PortfolioProject;
  readonly language: "pl" | "en";
  readonly href: string;
}

export default function PortfolioProjectCard({
  project,
  language,
  href,
}: PortfolioProjectCardProps) {
  const title =
    project.translations[language]?.title || project.translations.pl?.title;
  const description =
    project.translations[language]?.short_description ||
    project.translations.pl?.short_description;

  return (
    <Link to={href} className="block no-underline">
      <article className={styles.card}>
        <div className={styles.cardImage}>
          {project.cover_path ? (
            <img
              src={getProjectImageUrl(project.cover_path)}
              alt={title}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className={styles.cardImagePlaceholder}>
              <FolderOpen size={32} />
            </div>
          )}
        </div>
        <div className={styles.cardContent}>
          <span className={styles.cardCategory}>
            {project.category?.replace("-", " ")}
          </span>
          <h3 className={styles.cardTitle}>{title}</h3>
          {description ? (
            <p className={styles.cardDesc}>{description}</p>
          ) : null}
          {project.technologies && project.technologies.length > 0 ? (
            <div className={styles.cardTech}>
              {project.technologies.slice(0, 3).map((tech) => (
                <span key={tech.id || tech.name} className={styles.techTag}>
                  {tech.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
