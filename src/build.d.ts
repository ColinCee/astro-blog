// Set in astro.config.mjs (vite.define): the commit the site was built from.
// All three are empty when the build ran outside git.
declare const __BUILD__: { hash: string; when: string; subject: string };
