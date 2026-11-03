// Astro's checker (astro-check) needs TypeScript's JavaScript API, which
// TypeScript 7 doesn't have, so it alone keeps TypeScript 6; the project's own
// TypeScript is 7. Drop this when @astrojs/check supports TypeScript 7.
// pnpm only reads a JavaScript pnpmfile, hence the one .mjs file.
export const hooks = {
  readPackage(pkg) {
    if (pkg.name === "@astrojs/check") {
      delete pkg.peerDependencies?.typescript;
      pkg.dependencies = {
        ...pkg.dependencies,
        typescript: "npm:typescript@6.0.3",
      };
    }
    return pkg;
  },
};
