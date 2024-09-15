export const is = v => null != v;

/**
 * Chunker: A pattern-matching map-reducer. Useful to simplify parser logic.
 * 
 * You are expected to maintain state outside of this fn, 
 * within scope of given callbacks:
 * - symbols.slice(i,l); // symbols in unmatched range.
 * - chunks.slice(i,l); // corresponding chunks in unmatched range.
 *   - NOTE: chunks are not available on first pass (and other passes where you don't provide one to start with).
 * 
 * @param {String} symbols - A String of character symbols.
 * @param {RegExp} rx - Regular Expression designed to match a pattern found in the symbol string.
 * @param {Fn(m:Object, i:int, e:int)=>mixed[]} matchCb -
 *   When user decides to keep/filter/transform the matched symbol-chunk set.
 *     i; // start of matched range
 *     e; // end of matched range
 * @param {Fn(i:int, e:int)=>mixed[]} betweenCb - (optional)
 *   When user decides to keep/filter/transform the unmatched symbol-chunk set.
 *     i; // start of unmatched range
 *     e; // length of unmatched range
 * @return mixed[] - An ordered list of tokens returned by `matchCb` and `betweenCb`.
 */
export const chunker = (symbols, rx, matchcb, unmatchcb) => {
  const r = [];
  let lastIndex = 0, m, addChunks;
  while (is(m = rx.exec(symbols))) {
    if (unmatchcb && lastIndex < m.index) {
      addChunks = unmatchcb(lastIndex, m.index);
      r.push(...addChunks);
    }

    lastIndex = rx.lastIndex;

    addChunks = matchcb(m, m.index, m.index + m[0].length)
    r.push(...addChunks);
  }

  if (unmatchcb && lastIndex < symbols.length) {
    addChunks = unmatchcb(lastIndex, symbols.length)
    r.push(...addChunks);
  }
  return r;
};