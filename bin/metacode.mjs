#!/usr/bin/env node
import * as fs from 'fs/promises';
import { parseMacro, compileTranslationUnit } from '../src/lib/macro.mjs';

const compileFile = async (filePath) => {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  if (/#metacode\r?\n/g.test(fileContent)) {
    const tokens = parseMacro(fileContent);
    const generatedOutput = compileTranslationUnit(tokens);
    await fs.writeFile(filePath, generatedOutput);
    console.log(`Compiled output injected into ${filePath}`);
  } else {
    console.log(`No metacode block found in ${filePath}`);
  }
};

const watchFile = async (filePath) => {
  console.log(`Watching ${filePath} for changes...`);
  const watcher = fs.watch(filePath);
  for await (const e of watcher) {
    if (e.eventType === 'change') {
      console.log(`File changed: ${e.filename}, recompiling...`);
      await compileFile(e.filename);
    }
  }
};

// cli arg validation
const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide a file to watch and compile.');
  process.exit(1);
}

// compile first-time
await compileFile(filePath);

// (optional) run the watcher loop
if (process.env.WATCH) {
  await watchFile(filePath);
}