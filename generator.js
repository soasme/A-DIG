#!/usr/bin/env node
import { runCli } from './core/command.js';
export * from './core/puzzle_generator.js';
export * from './core/rule_engine.js';

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  runCli(process.argv.slice(2));
}
