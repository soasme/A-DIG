import type { Metadata } from "next";
import GamePageShell from "./components/GamePageShell";
import { loadLatestGameData } from "./lib/gameData";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const { id, data } = await loadLatestGameData();
  return {
    title: `Clues of Who? - ${id}`,
    description: data.gameSetting || "Logic puzzle archive entry",
  };
}

export default async function Page() {
  const { id, data } = await loadLatestGameData();

  return <GamePageShell id={id} gameData={data} />;
}
