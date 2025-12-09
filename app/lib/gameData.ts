import fs from "fs/promises";
import path from "path";

export type Character = {
  name: string;
  gender?: string;
  row: number;
  column: number;
  characteristic?: string;
};

export type PuzzleCell = {
  row: number;
  column: number;
  role: string;
  mechanic_statement?: string;
  statement?: string;
  deductableCells?: Array<{ row: number; column: number; role: string }>;
};

export type GameData = {
  row: number;
  column: number;
  characters: Character[];
  puzzle: PuzzleCell[];
  roles?: string[];
  gameSetting?: string;
};

export type GameDataWithId = {
  id: number;
  data: GameData;
};

const GAME_DATA_DIR = path.join(process.cwd(), "app", "data", "gameData");

function assertValidId(id: string) {
  if (!/^[0-9]+$/.test(id)) {
    throw new Error(`Invalid game id: ${id}`);
  }
}

async function findLatestId(): Promise<string> {
  const entries = await fs.readdir(GAME_DATA_DIR);
  const ids = entries
    .map((file) => {
      const match = file.match(/^([0-9]+)\.json$/);
      return match ? Number(match[1]) : null;
    })
    .filter((value): value is number => value !== null);

  if (!ids.length) {
    throw new Error("No game data files found");
  }

  return String(Math.max(...ids));
}

async function readGameDataFile(id: string): Promise<GameData> {
  assertValidId(id);
  const filePath = path.join(GAME_DATA_DIR, `${id}.json`);
  const json = await fs.readFile(filePath, "utf-8");
  return JSON.parse(json) as GameData;
}

export async function loadLatestGameData(): Promise<GameDataWithId> {
  const latestId = await findLatestId();
  const data = await readGameDataFile(latestId);
  return { id: Number(latestId), data };
}

export async function loadGameDataById(id: string | number): Promise<GameDataWithId> {
  const normalizedId = String(id);
  const data = await readGameDataFile(normalizedId);
  return { id: Number(normalizedId), data };
}
