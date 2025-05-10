---
title: "Seriously, Slash Your ts-jest Test Times With This"
description: "Found a simple ts-jest tweak that cut our test suite time down by over 10 minutes. You might want to try this."
pubDate: "Apr 03 2025"
---

Okay, so our CI pipeline was starting to feel like a coffee break extending into lunch – TypeScript tests were the main culprit. After some digging, I stumbled upon a ridiculously simple one-liner for `ts-jest` that clawed back over 10 minutes for us. Figured I'd share the wealth!

Here's the little gem:

```diff lang="typescript"
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    }
  },
  // ... rest of your config
};
```
----

**How this works**

Basically, `isolatedModules: true` tells `ts-jest` to process each TypeScript file as a completely separate unit. It skips the full project-wide type analysis that normally happens. Think of it like a quick, focused compilation for each file in isolation, rather than `tsc` looking at the whole picture. This is what gives you that *massive* speed boost, especially noticeable with larger codebases.

**⚠️ The Crucial Caveat: Don't Skip Your Type Checks!**

This speed-up comes with a big string attached: **Jest will no longer be doing type-checking for you.**

Since `isolatedModules` treats files individually, it can't catch type errors that depend on understanding your whole project. So, it's *absolutely critical* that you have a separate, dedicated step in your CI pipeline to handle type verification (e.g., running `tsc --noEmit` or `vue-tsc --noEmit` for Vue projects). If you skip this, you're essentially flying blind on type safety during your tests, and you *will* risk introducing type-related bugs into your system.

**Pro Tip / Future-Proofing:** While tweaking `globals` works, the `ts-jest` folks and general TypeScript wisdom now point towards sticking `isolatedModules: true` right into your `tsconfig.json` (under `compilerOptions`).
