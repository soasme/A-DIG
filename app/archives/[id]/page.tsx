import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GamePageShell from "../../components/GamePageShell";
import { listGameDataIds, loadGameDataById } from "../../lib/gameData";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const ids = await listGameDataIds();
  return ids.map((id) => ({ id: String(id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data } = await loadGameDataById(id);
    return {
      title: `Clues of Who? - ${id}`,
      description: data.gameSetting || "Archived logic puzzle",
    };
  } catch {
    return {
      title: `Clues of Who? - ${id}`,
      description: "Archived logic puzzle",
    };
  }
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const { data } = await loadGameDataById(id);

    return <GamePageShell id={parseInt(id, 10)} gameData={data} />;
  } catch (error) {
    return notFound();
  }
}
