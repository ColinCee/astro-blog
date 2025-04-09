---
title: "First post"
description: "Lorem ipsum dolor sit amet"
pubDate: "Apr 03 2025"
heroImage: "/blog-placeholder-3.jpg"
---

I saved over 10 minutes running tests and here's how you can do it with a simple one liner. Caveats below.

```diff lang="typescript"
// jest.config.js
module.exports = {
  // ... other config
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
+     isolatedModules: true, // Added line gets TS coloring + diff style
-     // someOldOption: false, // Removed line might show similarly
      diagnostics: false, // Unchanged line gets normal TS coloring
    }
  },
  // ... rest of config
};
```
