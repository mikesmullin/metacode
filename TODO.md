(parsing errors)
later: regarding real List.h:
- why List.h has `#pragma once` twice?
- why List.h stopped reading after a certain point?

(watch mode compatibility w/ VSCode + code formatter)
Workaround: for now, I run manually, as-needed.
- only replace file if comment parts are different
  - reduces fighting w/ other tools over writing to the file
- IDE doesn't reload consistently; maybe add time delay for IDE fs.watch?

(vm improvements)
Haven't needed these yet.
- handlebars.mjs scope should be tree-based not stack-based
