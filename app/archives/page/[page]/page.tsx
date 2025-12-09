import { notFound } from "next/navigation";
import ArchiveListPage, { ARCHIVES_PER_PAGE } from "../../ArchiveListPage";
import { listGameDataIds } from "../../../lib/gameData";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const ids = await listGameDataIds();
  const totalPages = Math.max(1, Math.ceil(ids.length / ARCHIVES_PER_PAGE));

  return Array.from({ length: totalPages }, (_, index) => ({
    page: String(index + 1),
  }));
}

export default function ArchivePaginationPage({
  params,
}: {
  params: { page: string };
}) {
  const pageNumber = Number(params.page);

  if (!Number.isFinite(pageNumber)) {
    return notFound();
  }

  return <ArchiveListPage pageNumber={pageNumber} />;
}
