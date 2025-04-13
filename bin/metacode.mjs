#!/usr/bin/env node
import * as fs from 'fs/promises';
import { parseMacro, compileTranslationUnit } from '../src/lib/macro.mjs';
import { extract_include_units } from '../src/lib/ctrawler.mjs';

const parseOne = async (macros, scope, filePath, output = false) => {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  if (/\/\/ #meta/g.test(fileContent)) {
    const tokens = parseMacro(fileContent);
    return compileTranslationUnit(filePath, macros, scope, tokens);
  } else {
    // console.log(`No metacode block found in ${filePath}`);
  }
};

const compileFile = async (filePath) => {
  try {
    const macros = {}, scope = {};
    for await (const m of extract_include_units({ file: filePath })) {
      console.log(`include ${m.h_file}`);
      await parseOne(macros, scope, m.h_file, false);
    }
    const generatedOutput = await parseOne(macros, scope, filePath, true);
    // console.log(generatedOutput);
    console.log(`rewrite ${filePath}`);
    await fs.writeFile(filePath, generatedOutput);
    process.exit(0);
  }
  catch (e) {
    console.error(e);
    process.exit(1);
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