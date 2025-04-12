import { chunker, is } from './chunker.mjs';
import { parseHandlebars, execVm } from './handlebars.mjs';
import { parseTable } from './markdown.mjs';

export const offsetToLineChar = (s, offset) => {
  let count = 0, last = -1;
  for (let i = 0; i < offset; last = ++i) if (s[i] === "\n") count++;
  return `${count + 1}:${-1 == last ? offset : offset - last}`;
}

export class MacroSyntaxError extends Error {
  constructor(ref, msg) {
    super(`Macro syntax error at ${ref}: ${msg} `);
  }
}
export const err = (ref, s) => {
  throw new MacroSyntaxError(ref, s);
};

/**
 * String parser for Macro syntax.
 *
 * @param {String} str - Macro syntax input
 * @return {Object[]} - Flattened AST tokens
 */
export const parseMacro = str => {
  // begin multi-pass tokenizer
  let chunks;
  const I3 = (i, e) =>
    chunks.slice(i, e); // identity; preserve all tokens as-is
  const toText = (i2, s) => (i, e) =>
    [['X', i2, s.slice(i, e)]]; // all tokens are text
  const lineno = i => offsetToLineChar(str, i);
  const CRLF = /\r\n/.test(str);
  const END = /\n$/.test(str);
  if (!END) str += CRLF ? "\r\n" : "\n"; // easier to parse, if present

  // split line-by-line, distinguishing comment lines from non-comment lines
  chunks = chunker(str,
    /(^[ \t]*)(\/\/ ?)(  )?(.*?)(\r?\n|$)/gm, (m, i2, e2) => {
      const r = [];
      const [, indent3, comment, indent2, text, newline] = m;
      if (indent3) r.push(['3', lineno(i2), indent3]); // indent (outside macro)
      if (comment) r.push(['C', lineno(i2), comment]); // single-line comment (inside macro)
      if (indent2) r.push(['2', lineno(i2), indent2]); // indent (inside macro)
      if (text) {
        // identify #directives
        r.push(...chunker(text,
          /(^#metacode)|(^#meta)\s+(.+)$|(^#macro (\w{1,99})\(([\w\d, ]{0,99})\))|(^#table (\w{1,99}))|(^#metagen)|(^#metaend)/g, (m, i3, e3) =>
          is(m[1]) ? [['S', lineno(i2), m[1]]] :  // start block
            is(m[2]) ? [['I', lineno(i2), m[2], m[3], m[0]]] :  // inline
              is(m[4]) ? [['M', lineno(i2), m[5], m[6], m[4]]] :  // macro
                is(m[7]) ? [['T', lineno(i2), m[8], m[7]]] :  // table
                  is(m[9]) ? [['G', lineno(i2), m[9]]] :  // gen
                    is(m[10]) ? [['E', lineno(i2), m[10]]] :  // end
                      [], toText(lineno(i2), text))); // all others are block text
      }
      if (newline) r.push(['R', lineno(i2), newline]);  // line-break
      return r;
    }, (i, e) => [['X', i, str.slice(i, e)]]);

  // semantic grammar check (validate fsm transitions)
  // also drop old generated code
  {
    const OUTSIDE = 0, INSIDE = 1, INLINE = 3, CODE = 2;
    let fsm = 0; // OUTSIDE -> {INSIDE, INLINE} -> CODE
    chunks = chunks.filter(chunk => {
      const [c, i] = chunk;

      // S
      if ('S' == c) {
        if (OUTSIDE == fsm) {
          fsm = INSIDE;
          return true;
        }
        if (INSIDE == fsm) {
          err(str, i, "#metacode should be followed by one of #macro, #table, or #metagen--not another #metacode");
        }
        if (INLINE == fsm) {
          err(str, i, "#meta should be followed by statement -- not #metacode");
        }
        if (CODE == fsm) {
          // NOT ok to start inside code
          err(str, i, "#metagen should be followed by #metaend");
        }
      }

      // I
      if ('I' == c) {
        if (OUTSIDE == fsm) {
          fsm = INLINE;
          return true;
        }
        if (INSIDE == fsm) {
          err(str, i, "#metacode should be followed by one of #macro, #table, or #metagen--not #meta");
        }
        if (INLINE == fsm) {
          err(str, i, "#meta should be followed by a statement--not #meta");
        }
      }
      if ('R' == c) {
        if (INLINE == fsm) {
          fsm = CODE;
          return true;
        }

      }

      // G
      if ('G' == c) {
        if (OUTSIDE == fsm) {
          // NOT ok to metagen outside
          err(str, i, "#metagen should be preceded by #metacode");
        }
        if (INSIDE == fsm) {
          // ok and expected
          fsm = CODE;
          return true;
        }
        if (INLINE == fsm) {
          err(str, i, "#metagen should not be used after #meta");
        }
        if (CODE == fsm) {
          // NOT ok to start inside code
          err(str, i, "#metagen should be followed by #metaend");
        }
      }

      // E
      if ('E' == c) {
        if (OUTSIDE == fsm) {
          // NOT ok to metaend outside
          err(str, i, "#metaend should be preceded by #metagen and #metacode");
        }
        if (INLINE == fsm || INSIDE == fsm || CODE == fsm) {
          fsm = OUTSIDE;
          return true;
        }
      }

      // if (CODE == fsm) {
      //   // DROP everything between #metagen and #metaend
      //   // its going to be replaced by our compiled output
      //   return false;
      // }

      // the rest can stay
      return true;
    });
  }

  let symbols = () => chunks.map(c => c[0]).join('');
  const outerText = (i, e) => {
    let o = '';
    // macros, tables, and bootstrap
    o = chunks.slice(i, e).map(t => t[t.length - 1]).join('');
    return o;
  };

  const innerText = (fsm, i, e) => {
    let o = '';
    if (1 == fsm) {
      // macros and tables
      o = chunks.slice(i + 2, e).map(t =>
        'XR'.includes(t[0]) ? t[2] : '').join('');
    } else if (2 == fsm) {
      // bootstrap
      o = chunks.slice(i, e).map(t =>
        'R' == t[0] ? t[2] : 'X' == t[0] ? t[2] : '').join('');
    }
    return o;
  };

  // merge markdown table bodies & handlebars template bodies & bootstrap template bodies
  chunks = chunker(symbols(),
    /CSR.+?C[GE]R|CIR/g, ((m2, i2, e2) => // #metacode ... #metagen/#metaend | #meta ... CR LF
      chunker(symbols().slice(i2, e2),
        /(CMR(?:C2XR|CR)+)|(CTR(?:C2XR|CR)+)|(CIR)|((?:CXR|CR)+)/g, (m, i, e) =>
        is(m[1]) ? [['F', chunks[i2 + i + 1][1], chunks[i2 + i + 1][2], chunks[i2 + i + 1][3], innerText(1, i2 + i + 1, i2 + e), outerText(i2 + i, i2 + e)]] :  // #macro
          is(m[2]) ? [['A', chunks[i2 + i + 1][1], chunks[i2 + i + 1][2], innerText(1, i2 + i + 1, i2 + e), outerText(i2 + i, i2 + e)]] :  // #table
            is(m[3]) ? [['N', chunks[i2 + i + 1][2], chunks[i2 + i + 1][3], outerText(i2 + i, i2 + e)]] :  // #meta
              is(m[4]) ? [['0', chunks[i2 + i + 1][1], innerText(2, i2 + i, i2 + e - 1), outerText(i2 + i, i2 + e)]] :  // bootstrap
                [], I3)), I3);

  // reset the output area
  chunks = chunker(symbols(),
    /CGR.*?CER/g, ((m, i, e) =>
      [['Z', i, outerText(i, i + 3), outerText(i + 3, e - 3), outerText(e - 3, e)]]) // #metagen ... #metaend
    , I3);
  chunks = chunker(symbols(),
    /N.+?(3?)CER/g, ((m, i, e) =>
      [
        chunks[i], // N
        ['W', i, outerText(i, i + 1), outerText(i + 1, e - (m[1] ? 4 : 3)), outerText(e - (m[1] ? 4 : 3), e)], // #meta ... #metaend
      ])
    , I3);

  return chunks;
};


/**
 * Compile a macro and return its generated output.
 *
 * @param {String[][]} tokens - Parsed tokens.
 * @return String - Compiled output, intended to replace original input.
 */
export const compileTranslationUnit = (tokens) => {
  let lastIndent = "";
  const indent = (s) => lastIndent + s.replace(/\r?\n(?!$)/g, m => m + lastIndent);
  const macros = {};
  const scope = {};
  let out3 = '';
  let out4 = '';
  for (const t of tokens) {
    const c = t[0];
    if ('3CSXGER'.includes(c)) {
      if ('3' == c) lastIndent = t[2];
      out4 += t[2]; // start
    }
    else if ('W' == c) {
      out4 += out3; // replaced code
      out4 += t[4]; // end
    }
    else if ('Z' == c) {
      out4 += t[2]; // start
      out4 += out3; // replaced code
      out4 += t[4]; // end
    }
    else if ('0' == c) {
      const [, ref, line, _out] = t;
      const [name, ...params] = line.replace(/[)\s\r\n]+/g, '').split(/[(,]/g);
      out3 = execVm(ref, scope, macros, name, params);
      out3 = indent(out3);
      out4 += _out;
    }
    else if ('N' == c) {
      const [, ref, line, _out] = t;
      const [name, ...params] = line.replace(/[)\s\r\n]+/g, '').split(/[(,]/g);
      out3 = execVm(ref, scope, macros, name, params);
      out3 = indent(out3);
      out4 += _out;
    }
    else if ('A' == c) {
      const [, ref, table, md, _out] = t;
      scope[table] = parseTable(md);
      out4 += _out;
    }
    else if ('F' == c) {
      const [, ref, name, _params, body, _out] = t;
      const params = _params.split(/\s*,\s*/g);
      const out2 = parseHandlebars(body);

      // collapse multiple newlines at end of macro to a single
      const last = out2.pop();
      const [c, newlines] = last;
      if ('N' == c) {
        const CRLF = /\r\n/.test(newlines);
        out2.push(['N', CRLF ? "\r\n" : "\n"]);
      }

      macros[name] = { name, params, tokens: out2 };
      out4 += _out;
    }
  }
  return out4;
}