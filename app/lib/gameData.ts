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
  publishedAt?: string;
};

export type GameDataWithId = {
  id: number;
  data: GameData;
};

export type GameArchiveSummary = {
  id: number;
  gridSize: string;
  characterCount: number;
  clueCount: number;
  publishedAt: string;
  gameSetting?: string;
};

const GAME_DATA_DIR = path.join(process.cwd(), "app", "data", "gameData");

function assertValidId(id: string) {
  if (!/^[0-9]+$/.test(id)) {
    throw new Error(`Invalid game id: ${id}`);
  }
}

async function discoverGameDataIds(): Promise<number[]> {
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

  return ids.sort((a, b) => a - b);
}

export async function listGameDataIds(): Promise<number[]> {
  const ids = await discoverGameDataIds();
  return [...ids].sort((a, b) => b - a);
}

async function findLatestId(): Promise<string> {
  const ids = await discoverGameDataIds();
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

export async function listGameArchiveSummaries(): Promise<GameArchiveSummary[]> {
  const ids = await listGameDataIds();

  return Promise.all(
    ids.map(async (id) => {
      const fileName = `${id}.json`;
      const filePath = path.join(GAME_DATA_DIR, fileName);
      const [data, stats] = await Promise.all([
        readGameDataFile(String(id)),
        fs.stat(filePath),
      ]);

      const publishedAt = data.publishedAt || stats.mtime.toISOString();

      return {
        id,
        gridSize: `${data.row}x${data.column}`,
        characterCount: data.characters.length,
        clueCount: data.puzzle.length,
        publishedAt,
        gameSetting: data.gameSetting,
      };
    })
  );
}
