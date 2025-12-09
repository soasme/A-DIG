import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../components/Footer";
import { listGameArchiveSummaries } from "../lib/gameData";
import styles from "./archives.module.css";

export const ARCHIVES_PER_PAGE = 20;

type ArchiveListPageProps = {
  pageNumber: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function pageHref(page: number) {
  return page === 1 ? "/archives" : `/archives/page/${page}`;
}

export default async function ArchiveListPage({ pageNumber }: ArchiveListPageProps) {
  const archives = await listGameArchiveSummaries();
  const totalPages = Math.max(1, Math.ceil(archives.length / ARCHIVES_PER_PAGE));

  if (pageNumber < 1 || pageNumber > totalPages) {
    return notFound();
  }

  const start = (pageNumber - 1) * ARCHIVES_PER_PAGE;
  const currentArchives = archives.slice(start, start + ARCHIVES_PER_PAGE);

  const previousHref = pageNumber > 1 ? pageHref(pageNumber - 1) : null;
  const nextHref = pageNumber < totalPages ? pageHref(pageNumber + 1) : null;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Puzzle Archives</p>
          <h1 className={styles.title}>Every Case We Have Solved</h1>
          <p className={styles.subtitle}>
            Revisit previous logic grid challenges. Each puzzle comes with a unique cast of
            characters and carefully woven clues.
          </p>
        </header>

        {currentArchives.length === 0 ? (
          <p className={styles.empty}>
            No archived puzzles yet. Come back after the next investigation.
          </p>
        ) : (
          <div className={styles.grid}>
            {currentArchives.map((archive) => (
              <Link key={archive.id} href={`/archives/${archive.id}`} className={styles.card}>
                <h2 className={styles.cardTitle}>Clues of Who? - #{archive.id}</h2>
                <p className={styles.cardDescription}>
                  {archive.gameSetting
                    ? archive.gameSetting
                    : `Featuring ${archive.characterCount} characters and ${archive.clueCount} clues inside a ${archive.gridSize} grid.`}
                </p>
                <div className={styles.meta}>
                  <span className={styles.pill}>{archive.gridSize} grid</span>
                  <span className={styles.pill}>{archive.characterCount} characters</span>
                  <span className={styles.pill}>{archive.clueCount} clues</span>
                  <span className={`${styles.pill} ${styles.timestamp}`}>
                    Published {formatDate(archive.publishedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Archives pagination">
            {previousHref ? (
              <Link className={styles.pageLink} href={previousHref}>
                Previous
              </Link>
            ) : (
              <span className={`${styles.pageLink} ${styles.pageLinkDisabled}`} aria-disabled="true">
                Previous
              </span>
            )}

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;
              const href = pageHref(page);
              const isActive = page === pageNumber;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`${styles.pageLink} ${isActive ? styles.pageLinkActive : ""}`}
                >
                  {page}
                </Link>
              );
            })}

            {nextHref ? (
              <Link className={styles.pageLink} href={nextHref}>
                Next
              </Link>
            ) : (
              <span className={`${styles.pageLink} ${styles.pageLinkDisabled}`} aria-disabled="true">
                Next
              </span>
            )}
          </nav>
        )}

        <Footer
          className={styles.footer}
          navClassName={styles.footerNav}
          linkClassName={styles.footerLink}
        />
      </div>
    </div>
  );
}
