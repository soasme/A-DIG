#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const [,, inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/toneRewriter.js <input.json> <output.json>');
  process.exit(1);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Missing OPENAI_API_KEY in environment.');
  process.exit(1);
}

const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tonePromptPath = path.resolve(__dirname, '../specs/tone-prompt.md');
const tonePrompt = await fs.readFile(tonePromptPath, 'utf8').catch(() => null);

const input = JSON.parse(await fs.readFile(path.resolve(inputPath), 'utf8'));
const { clues, wrapResult, context } = extractClues(input);

const rewritten = [];
for (const clue of clues) {
  const mechanical = clue.statement || clue.mechanic_statement;
  if (!mechanical) {
    throw new Error('Every clue needs a statement or mechanic_statement field.');
  }
  const rewrittenClue = await rewriteClue({
    mechanical,
    gameSetting: context.gameSetting,
    goodRole: context.goodRole,
    badRole: context.badRole,
  });
  rewritten.push({
    ...clue,
    mechanic_statement: mechanical,
    statement: rewrittenClue.statement,
  });
}

await fs.writeFile(path.resolve(outputPath), JSON.stringify(wrapResult(rewritten), null, 2), 'utf8');
console.log(`Wrote ${rewritten.length} clues to ${outputPath}`);

function extractClues(data) {
  const gameSetting = data.gameSetting || data.setting || '';
  const goodRole = data.goodRole || data.good_role || 'villager';
  const badRole = data.badRole || data.bad_role || 'werewolf';

  if (Array.isArray(data)) {
    return {
      clues: data,
      wrapResult: rewritten => rewritten,
      context: { gameSetting, goodRole, badRole },
    };
  }

  if (Array.isArray(data.puzzle)) {
    return {
      clues: data.puzzle,
      wrapResult: rewritten => ({ ...data, puzzle: rewritten }),
      context: { gameSetting, goodRole, badRole },
    };
  }

  throw new Error('Input must be an array of clues or an object with a puzzle array.');
}

async function rewriteClue({ mechanical, gameSetting, goodRole, badRole }) {
  const systemPrompt = [
    tonePrompt || 'Rewrite mechanical clues into atmospheric social-deduction narration while keeping the logic true.',
    `Game setting: ${gameSetting || 'A village hunts hidden werewolves.'}`,
    `Good role name: ${goodRole}`,
    `Bad role name: ${badRole}`,
    'Return only JSON with keys mechanic_statement (copy the mechanical input exactly) and statement (the atmospheric rewrite). Keep the truth conditions identical.',
  ].join('\n\n');

  const userPrompt = [
    'Rewrite this mechanical clue to match the social-deduction tone. Keep the logic identical.',
    `Mechanical statement: ${mechanical}`,
  ].join('\n\n');

  const body = {
    model,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  };

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned an empty response.');
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse OpenAI response as JSON: ${err.message}`);
  }

  if (!parsed.statement) {
    throw new Error('OpenAI response missing statement.');
  }
  parsed.mechanic_statement = parsed.mechanic_statement || mechanical;
  return parsed;
}
