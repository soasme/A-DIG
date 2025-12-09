import GamePageShell from "./components/GamePageShell";
import { loadLatestGameData } from "./lib/gameData";

export const revalidate = 0;

export default async function Page() {
  const { id, data } = await loadLatestGameData();

  return <GamePageShell id={id} gameData={data} />;
}
