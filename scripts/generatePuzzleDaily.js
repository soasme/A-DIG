#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { generateGame, ROWS, COLS } from '../core/puzzle_generator.js';
import gameThemes from '../app/data/gameThemes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../app/data/gameData');

function formatPublishedAt(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
  // Drop milliseconds to keep a stable YYYY-MM-DDT00:00:00Z shape.
  return new Date(start).toISOString().replace('.000Z', 'Z');
}

function dayKey(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

async function findMaxIdAndCheckDate(targetDayKey) {
  const entries = await fs.readdir(dataDir);
  let maxId = 0;

  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue;
    const numericId = Number.parseInt(entry, 10);
    if (Number.isFinite(numericId) && numericId > maxId) {
      maxId = numericId;
    }

    const filePath = path.join(dataDir, entry);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(content);
      const existingDayKey = dayKey(parsed.publishedAt);
      if (existingDayKey === targetDayKey) {
        return { maxId, alreadyExists: true, existingFile: entry };
      }
    } catch (err) {
      console.warn(`Skipping ${entry}: ${err.message}`);
    }
  }

  return { maxId, alreadyExists: false };
}

function pickRandomTheme() {
  if (!Array.isArray(gameThemes) || gameThemes.length === 0) {
    throw new Error('No game themes available.');
  }
  const index = Math.floor(Math.random() * gameThemes.length);
  return gameThemes[index];
}

async function main() {
  const publishedAt = formatPublishedAt();
  const targetDayKey = dayKey(publishedAt);
  const { maxId, alreadyExists, existingFile } = await findMaxIdAndCheckDate(targetDayKey);

  if (alreadyExists) {
    console.log(`Puzzle for ${targetDayKey} already exists (${existingFile}). Skipping.`);
    return;
  }

  const theme = pickRandomTheme();
  const game = generateGame(ROWS, COLS, [theme.goodRole, theme.badRole]);
  game.publishedAt = publishedAt;
  if (theme.gameSetting) {
    game.gameSetting = theme.gameSetting;
  }

  const nextId = maxId + 1;
  const outputPath = path.join(dataDir, `${nextId}.json`);
  await fs.writeFile(outputPath, JSON.stringify(game, null, 2), 'utf8');
  console.log(`Generated puzzle #${nextId} for ${targetDayKey} at ${outputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
