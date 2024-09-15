import { chunker, is } from './chunker.mjs';
import { parseHandlebars, execVm } from './handlebars.mjs';
import { parseTable } from './markdown.mjs';

export class MacroSyntaxError extends Error {
  constructor(msg) {
    super(`Macro syntax error: ${msg}`);
  }
}
const err = s => { throw new MacroSyntaxError(s); };

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
  const toText = (s) => (i, e) =>
    [['X', s.slice(i, e)]]; // all tokens are text

  // split line-by-line, distinguishing comment lines from non-comment lines
  const comment = '//';
  const rx_comment = comment.replace(/\//g, '\\/');
  chunks = chunker(str,
    new RegExp(`^(${rx_comment})|(\r?\n)`, 'gm'), (m, i, e) =>
    is(m[1]) ? [['C', comment]] :  // single-line comment
      is(m[2]) ? [['R', m[2]]] :  // line-break
        [], (i, e) =>
    // identify #metacode directives
    chunker(str.slice(i, e),
      /(^ #metacode)|(^ #macro (\w{1,99})\(([\w\d, ]{0,99})\))|(^ #table (\w{1,99}))|(^ #metagen)|(^ #metaend)|(^   )/g, (m, i, e) =>
      is(m[1]) ? [['S', m[1]]] :  // start
        is(m[2]) ? [['M', m[3], m[4], m[2]]] :  // macro
          is(m[5]) ? [['T', m[6], m[5]]] :  // table
            is(m[7]) ? [['G', m[7]]] :  // gen
              is(m[8]) ? [['E', m[8]]] :  // end
                is(m[9]) ? [['2', m[9]]] :  // indent2
                  [], toText(str.slice(i, e))) // all others are block text          
  );

  // semantic grammar check (validate fsm transitions)
  // also drop old generated code
  {
    let fsm = 0; // 0 outside, 1 inside, 2 code
    chunks = chunks.filter(chunk => {
      const c = chunk[0];

      // S
      if (0 == fsm && 'S' == c) {
        // ok and expected
        fsm = 1;
        return true;
      }
      if (1 == fsm && 'S' == c) {
        // ok to restart consecutively
        // ie. when only defining #macro and #table, not yet invoking them
        return true;
      }
      if (2 == fsm && 'S' == c) {
        // NOT ok to start inside code
        err("all #metagen should be followed by #metaend");
      }

      // G
      if (0 == fsm && 'G' == c) {
        // NOT ok to metagen outside
        err("all #metagen should be preceded by #metacode");
      }
      if (1 == fsm && 'G' == c) {
        // ok and expected
        fsm = 2;
        return true;
      }
      if (2 == fsm && 'G' == c) {
        // NOT ok to start inside code
        err("all #metagen should be followed by #metaend");
      }

      // E
      if (0 == fsm && 'E' == c) {
        // NOT ok to metaend outside
        err("all #metaend should be preceded by #metagen and #metacode");
      }
      if (1 == fsm && 'E' == c) {
        // NOT ok to metaend inside
        err("all #metaend should be preceded by #metagen");
      }
      if (2 == fsm && 'E' == c) {
        // ok and expected
        fsm = 0;
        return true;
      }

      // if (2 == fsm) {
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
        'RX'.includes(t[0]) ? t[1] : '').join('');
    } else if (2 == fsm) {
      // bootstrap
      o = chunks.slice(i + 1, e).map(t =>
        'R' == t[0] ? t[1] : 'X' == t[0] ? t[1].substr(1) : '').join('');
    }
    return o;
  };

  // merge markdown table bodies & handlebars template bodies & bootstrap template bodies
  chunks = chunker(symbols(),
    /CSR.+?CGR/g, ((m, i, e) => // #metacode ... #metagen
      chunker(symbols().slice(i, e),
        /(CMR(?:C2XR|CR)+)|(CTR(?:C2XR|CR)+)|((?:CXR|CR)+)/g, (m, i, e) =>
        is(m[1]) ? [['F', chunks[i + 1][1], chunks[i + 1][2], innerText(1, i + 1, e - 1), outerText(i, e)]] :  // #macro
          is(m[2]) ? [['A', chunks[i + 1][1], innerText(1, i + 1, e - 1), outerText(i, e)]] :  // #table
            is(m[3]) ? [['0', innerText(2, i, e), outerText(i, e)]] :  // bootstrap
              [], I3)), I3);

  // reset the output area
  chunks = chunker(symbols(),
    /CGR.+?CER?/g, ((m, i, e) =>
      [['Z', outerText(i, i + 3), outerText(i + 3, e - 3), outerText(e - 3, e)]]) // #metagen ... #metaend
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
  const macros = {};
  const scope = {};
  let out3 = '';
  let out4 = '';
  for (const t of tokens) {
    if ('CSRZ'.includes(t[0])) {
      out4 += t[1];
      if ('Z' == t[0]) {
        // out4 += t[2];
        out4 += out3;
        out4 += t[3];
      }
    }
    if ('0' == t[0]) {
      const [, line, _out] = t;
      const [name, ...params] = line.replace(/[)\s\r\n]+/g, '').split(/[(,]/g);
      out3 = execVm(scope, macros[name], params);
      out4 += _out;
    }
    if ('A' == t[0]) {
      const [, table, md, _out] = t;
      scope[table] = parseTable(md);
      out4 += _out;
    }
    if ('F' == t[0]) {
      const [, name, _params, body, _out] = t;
      const params = _params.split(/,/g);
      const out2 = parseHandlebars(body);
      macros[name] = { name, params, tokens: out2 };
      out4 += _out;
    }
  }
  return out4;
}