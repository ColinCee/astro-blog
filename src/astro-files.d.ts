// TypeScript 7's tsc can't read .astro files (Astro's checker types them), so
// this lets tsc check the .ts files that import one.
declare module "*.astro" {
  const Component: (props: Record<string, unknown>) => unknown;
  export default Component;
}
