import { chunker, is } from './chunker.mjs';

/**
 * String parser for Handlebars syntax.
 * 
 * @param {String} str - Handlebars syntax input
 * @return {Object[]} - Flattened AST tokens
 */
export const parseHandlebars = str => {
  // begin multi-pass tokenizer
  let chunks;
  const I3 = (i, e) =>
    chunks.slice(i, e); // identity; preserve all tokens as-is
  const toText = (s) => (i, e) =>
    [['X', s.slice(i, e)]]; // all tokens are text

  // split by handlebars
  chunks = chunker(str,
    /{{~(.*?)~}}|{{~(.*?)}}|{{(.*?)~}}|{{(.*?)}}/g, (m, i, e) =>
    is(m[1]) ? [['B', m[1]]] :  // handlebars (ws del both)
      is(m[2]) ? [['L', m[2]]] :  // handlebars (ws del left)
        is(m[3]) ? [['R', m[3]]] :  // handlebars (ws del right)
          is(m[4]) ? [['H', m[4]]] :  // handlebars
            [], toText(str)); // all other tokens are text

  // identify whitespace (for optional removal)
  chunks = chunks.flatMap(chunk =>
    'X' != chunk[0] ? [chunk] :
      chunker(chunk[1],
        /( +)|(\t+)|([\r\n]+)/g, (m, i, e) =>
        is(m[1]) ? [['S', m[1]]] :  // space
          is(m[2]) ? [['T', m[2]]] :  // tab
            is(m[3]) ? [['N', m[3]]] :  // newline
              [], toText(chunk[1])));

  // collapse whitespace beside handlebars that request it
  let symbols = () => chunks.map(c => c[0]).join('');
  chunks = chunker(symbols(),
    /[ST](B)[STN]|([BR])[STN]|[ST]([BL])/g, (m, i, e) =>
    is(m[1]) ? chunks.slice(i + 1, e - 1) :  // trim
      is(m[2]) ? chunks.slice(i, e - 1) : // rtrim
        is(m[3]) ? chunks.slice(i + 1, e) : // ltrim
          [], I3);

  // identify #metacode directives
  chunks = chunks.map(chunk =>
    !'BLRH'.includes(chunk[0]) ? chunk :
      chunker(chunk[1],
        /(#for (\w+),(\w+) of (\w+))|(#for (\w+) in (\w+))|(#for (\w+) of (\w+))|#for (\w+)|(\/for)|((\w+)\.(\w+))|#(\w+)|(\w+)/g, (m, i, e) =>
        is(m[1]) ? [['2', m[2], m[3], m[4]]] :  // for key-value
          is(m[5]) ? [['K', m[6], m[7]]] :  // for key
            is(m[8]) ? [['V', m[9], m[10]]] :  // for value
              is(m[11]) ? [['@', m[11]]] :  // for this value
                is(m[12]) ? [['E']] :  // end for
                  is(m[13]) ? [['.', m[14], m[15]]] :  // a.b
                    is(m[16]) ? [['#', m[16]]] :  // count
                      is(m[17]) ? [['$', m[17]]] :  // var
                        [], I3)[0]);

  return chunks;
};

const createNode = (value) => ({
  parent: null,
  value,
  children: []
});

const appendNode = (parent, node) => {
  node.parent = parent;
  parent.children.push(node);
  return node;
};

const depthFirstTraversal = function* (node, lvl = 0) {
  yield { lvl, value: node.value };
  for (const child of node.children) {
    for (const grandchild of depthFirstTraversal(child, lvl + 1)) {
      yield { lvl: lvl + 1, value: grandchild.value };
    }
  }
};

/**
 * Sandboxed virtual machine for executing Handlebars template logic (ie. for-loop).
 * 
 * @param {Object} scope - variables will resolve to these values
 * @param {Object} macro - object containing macro function signature and template body
 * @param {String[]} inparams - list of arguments passed to macro
 * @return {String} - compiled template output
 */
export const execVm = (scope, macro, inparams) => {
  let out = '';
  let scopestack = [scope];
  let looptree = createNode({ toks: [] });
  let looptree_nodecur = looptree;
  // reorganize tokens into hierarchy by loop
  for (const t of macro.tokens) {
    // for...loop
    if ('2' == t[0] || 'K' == t[0] || 'V' == t[0] || '@' == t[0]) {
      let k, v, table;
      if ('2' == t[0]) {
        [, k, v, table] = t;
      }
      if ('K' == t[0]) {
        [, k, table] = t;
      }
      if ('V' == t[0]) {
        [, v, table] = t;
      }
      if ('@' == t[0]) {
        [, table] = t;
        v = 'this';
      }
      looptree_nodecur = appendNode(looptree, createNode({ k, v, table, toks: [] }));
    }
    else if ('E' == t[0]) {
      looptree_nodecur = appendNode(looptree_nodecur.parent, createNode({ toks: [] }));
    }
    else {
      looptree_nodecur.value.toks.push(t);
    }
  }

  const resolve = (ref) => {
    // local scope
    const i1 = macro.params.indexOf(ref);
    if (-1 != i1) {
      const resName = inparams[i1];
      return resName;
    }
    // search up scope stack
    for (let i = 0, len = scopestack.length; i < len; i++) {
      if (ref in scopestack[i]) {
        return scopestack[i][ref];
      }
    }
  }
  for (const { lvl, value: loopframe } of depthFirstTraversal(looptree)) {
    const tab = loopframe.table ? resolve(resolve(loopframe.table)) : [{}];
    for (let i = 0, len = tab.length; i < len; i++) {
      const row = tab[i];
      // TODO: this should set and resolve according to lvl tree depth
      // TODO: actually, it should belong as a member of the tree node
      scopestack[0][loopframe.k] = i;
      scopestack[0][loopframe.v] = row;
      for (const t of loopframe.toks) {
        if ('XSTN'.includes(t[0])) {
          out += t[1];
          continue;
        }
        // variable substitution
        if ('.' == t[0]) {
          const [, a, b] = t;
          const _a = resolve(a)
          const _b = _a[b];
          out += _b;
          continue;
        }
        if ('#' == t[0]) {
          const table = t[1];
          const _table = resolve(table);
          const _tabledata = resolve(_table);
          const count = _tabledata.length;
          out += count;
          continue;
        }
        if ('$' == t[0]) {
          const a = t[1];
          out += resolve(a);
          continue;
        }
      }
    }
  }

  return out;
};
