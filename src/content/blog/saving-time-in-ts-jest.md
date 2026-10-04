---
title: "Slash Your ts-jest Test Times With This"
shortTitle: "Slash your ts-jest test times"
description: "One ts-jest setting cut more than ten minutes off our CI test run. This is the setting, and the catch that comes with it."
stat: "−10 min"
pubDate: "Apr 03 2025"
---
Our CI test suite was taking over ten minutes. When I looked into it, the slow part was `ts-jest` type-checking the code. This one setting sorted it:

```js title="jest.config.js"
module.exports = {
  preset: "ts-jest",
  globals: {
    "ts-jest": { isolatedModules: true },
  },
};
```

With `isolatedModules` on, `ts-jest` compiles each file by itself and skips the slow type analysis across the whole project. The bigger your codebase, the more time you get back. If you're on a newer version of `ts-jest`, it reads the setting from your `tsconfig.json` instead.

There is a catch though. Jest isn't type-checking your code any more, and because files are compiled one at a time it can't spot type errors that cross between files.

So you'll want type-checking as its own step in CI:

<figure class="fig">
<div class="split">
<div><p class="fig__k">Before: one job</p><div class="boxes"><div class="box box--slow">jest<small>type-check + run tests</small></div></div></div>
<div><p class="fig__k">After: two jobs</p><div class="boxes"><div class="box box--fast">jest<small>run tests</small></div><div class="box box--fast">tsc --noEmit<small>type-check</small></div></div></div>
</div>
<figcaption>The type-check moves out of the test run into its own CI job.</figcaption>
</figure>

```bash
tsc --noEmit
```

That way the tests are quick and the types still get checked. They're just two separate jobs now.
