import { notFound } from "next/navigation";
import GamePageShell from "../../components/GamePageShell";
import { loadGameDataById } from "../../lib/gameData";

export const revalidate = 0;

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const { data } = await loadGameDataById(id);

    return <GamePageShell id={parseInt(id)} gameData={data} />;
  } catch (error) {
    return notFound();
  }
}
