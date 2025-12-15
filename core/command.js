#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { generateGame, ROWS, COLS, VILLAGER, WEREWOLF } from './puzzle_generator.js';

function printUsage() {
  const defaultRoles = [VILLAGER, WEREWOLF].join(',');
  console.log('Usage: node generator.js [--row N] [--column N] [--roles role1,role2] [--output path]');
  console.log(`Defaults: --row ${ROWS}, --column ${COLS}, --roles ${defaultRoles}`);
  console.log('If --output is omitted, the JSON is printed to stdout.');
}

function parseArgs(argv) {
  const options = { row: ROWS, column: COLS, roles: [VILLAGER, WEREWOLF], output: null, help: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--row' || arg === '-r') {
      const next = Number(argv[i + 1]);
      if (Number.isFinite(next)) {
        options.row = next;
        i++;
      }
    } else if (arg === '--column' || arg === '-c') {
      const next = Number(argv[i + 1]);
      if (Number.isFinite(next)) {
        options.column = next;
        i++;
      }
    } else if (arg === '--roles') {
      const next = argv[i + 1];
      if (typeof next === 'string') {
        const [good, bad] = next
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        if (good && bad) {
          options.roles = [good, bad];
        }
        i++;
      }
    } else if (arg === '--output') {
      const next = argv[i + 1];
      if (typeof next === 'string') {
        options.output = next;
        i++;
      }
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

export function runCli(argv = process.argv.slice(2)) {
  const { row, column, roles, output, help } = parseArgs(argv);
  if (help) {
    printUsage();
    return;
  }
  const game = generateGame(row, column, roles);
  const json = JSON.stringify(game, null, 2);
  if (output) {
    writeFileSync(output, json);
  } else {
    console.log(json);
  }
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  runCli(process.argv.slice(2));
}
