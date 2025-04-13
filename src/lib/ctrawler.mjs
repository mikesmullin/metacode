import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceFolder = path.join(__dirname, '..', '..');
const relWs = (...args) => path.relative(path.join(workspaceFolder), path.join(...args));
const nixPath = (p) => path.posix.normalize(p.replace(/\\/g, '/'));
const fs_exists = async (file) => {
  try {
    const stat = await fs.stat(file);
    return { exists: true, stat };
  } catch (e) {
    return { exists: false, stat: { mtime: null } };
  }
};

// recursively follow .c file's #include statements
export const extract_include_units = async function* (opts) {
  if (!opts) opts = {};
  if (!opts.file) return;
  if (undefined == opts.depth) opts.depth = 0;
  if (undefined == opts.seen) opts.seen = new Set();
  if (undefined == opts.analyze) opts.analyze = false;
  const dname1 = path.dirname(opts.file);

  opts.seen.add(nixPath(opts.file));
  const rl = readline.createInterface({
    input: createReadStream(opts.file),
    crlfDelay: Infinity, // Handle both \n and \r\n newlines
  });
  const RX_INCLUDE1 = /^#include "([^"]+)"/gm;
  const RX_INCLUDE2 = /^#include <([^"]+)>/gm;
  let m;
  for await (const line of rl) {
    while (null != (m = RX_INCLUDE1.exec(line))) {
      const [, include] = m;
      // if (line.includes('nofollow')) continue;
      const cwd = process.cwd();
      const dname2 = path.dirname(include);
      const bname = path.basename(include, '.h');
      const h_file = relWs(path.resolve(cwd, dname1, dname2, `${bname}.h`));
      const { exists: h_exists, stat: { mtime: h_mtime } } = await fs_exists(h_file);

      if (h_exists) {
        if (!opts.seen.has(nixPath(h_file))) {
          opts.seen.add(nixPath(h_file));
          yield { h_file: h_file, h_mtime, depth: opts.depth };
          yield* await extract_include_units({
            file: h_file, depth: opts.depth + 1, seen: opts.seen, analyze: opts.analyze
          });
        }
      }
    }
  }
};