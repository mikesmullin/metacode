# Chunker

A pattern-matching map-reducer. 

- Powerful 3-in-1 function (Tokenizer, Lexer, and Semantic Analyzer)
- Simplifies parser logic, making applications a breeze.

## Key Concept

- Imagine you have a `String`
- You want to find patterns within it, what do you use? RegExp.
- RegExp() receives 1 string as input, and outputs [effectively] an Array of match Objects.

So far this is normal, and you wouldn't think twice about it.
But consider for a moment, what if you convert that Array of Objects back into a String?
Then you could feed it back into the process, and __recursively match patterns__!
- This is a key activity for many types of code, especially Parsers.
- The pattern matching power and expressiveness of RegExp is unmatched,  
  especially when applied recursively.
- To use any other approach is essentially reinventing RegExp.

**TRICK #1**:

- Using `Array.map()`, convert each match `Object` into a single `char` (hereafter `symbol`), returning a `String` (`symbols`).
- You can even use emoji--the JavaScript RegEx parser understands UTF-8! 😂

You may now be wondering, "How can we associate metadata (hereafter `chunk`) with each chosen `symbol`, 
and preserve that with each level of depth in recursive pattern refinement?"

**TRICK #2**:

- Adjacent to the `symbols` string, we maintain a mixed array called `chunks`.
- Throughout each RegExp pass, we carefully ensure `symbols.length==chunks.length`.
- That's because each symbol in the symbols string represents one metadata (using the data structure of your choice).
- Although `RegExp()` pattern-matching occurs against the `symbols` string, 
  the matcher can refer to the same offset in the `chunks` array to set/get additional metadata about the match.
- Subsequent passes incrementally refine the `chunks` array, which also updates the `symbols` string.

You are expected to maintain state of these outside of the fn:
- `symbols.slice(i,l);` // symbols in unmatched range.
- `chunks.slice(i,l);` // corresponding chunks in unmatched range.
  - **NOTE:** `chunks` are not available on first pass (and other passes where you don't provide one to start with).

From here its the same as any Array or Stream manipulation;
the problem lends itself very well to `.map()`, `.flatMap()`, `.reduce()`, etc.

## Behold, the Function

- [chunker.mjs](src/lib/chunker.mjs)

## Its use cases

- [handlebars.mjs](src/lib/handlebars.mjs)
- [macro.mjs](src/lib/macro.mjs)