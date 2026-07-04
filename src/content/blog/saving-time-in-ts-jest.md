---
title: "Slash Your ts-jest Test Times With This"
description: "One ts-jest config flag cut our CI test suite by over 10 minutes. Here is the line."
pubDate: "Apr 03 2025"
---

Our CI test suite took 10+ minutes. The `ts-jest` type-check was the bottleneck. One flag fixed it.

```js title="jest.config.js"
module.exports = {
  preset: "ts-jest",
  globals: {
    "ts-jest": { isolatedModules: true },
  },
};
```

`isolatedModules` makes `ts-jest` compile each file on its own and skip the slow project-wide type analysis. The bigger the codebase, the bigger the win. Newer `ts-jest` reads it straight from your `tsconfig.json`.

**The catch:** Jest stops type-checking your code. Files compiled in isolation cannot catch errors that span files.

So make type-checking its own CI step:

```bash
tsc --noEmit
```

Fast tests, types still checked, and two jobs that stopped fighting each other.
