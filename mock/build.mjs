// Builds the clickable mock (one self-contained HTML page) from the real app
// components: node mock/build.mjs  →  mock/dist/index.html
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const shim = (file) => resolve(root, "mock/shims", file);

// Exact-name swaps: React comes from cdnjs (UMD), Next.js routing from the mock router.
const SWAPS = {
  react: shim("react.ts"),
  "react/jsx-runtime": shim("jsx-runtime.ts"),
  "react-dom/client": shim("react-dom-client.ts"),
  "next/link": shim("next-link.tsx"),
  "next/navigation": shim("next-navigation.ts"),
};
const swapPlugin = {
  name: "mock-swaps",
  setup(b) {
    b.onResolve({ filter: /^(react|react\/jsx-runtime|react-dom\/client|next\/link|next\/navigation)$/ }, (args) => ({
      path: SWAPS[args.path],
    }));
  },
};

const result = await build({
  entryPoints: [resolve(root, "mock/main.tsx")],
  bundle: true,
  write: false,
  format: "iife",
  minify: true,
  target: "es2020",
  jsx: "automatic",
  tsconfig: resolve(root, "tsconfig.json"),
  plugins: [swapPlugin],
  logLevel: "warning",
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

// The app's stylesheet, adapted from "the page is the viewport" to "the app lives in a device screen".
let css = readFileSync(resolve(root, "app/globals.css"), "utf8");
const swaps = [
  // The shell owns the page body; the app's reset applies to its own root.
  [/html,\nbody \{\n  margin: 0;\n  padding: 0;\n\}/, ".app-root {\n  margin: 0;\n  padding: 0;\n}"],
  [/\nbody \{\n  color: var\(--ink\);/, "\n.app-root {\n  color: var(--ink);"],
  [/min-height: 100vh;/g, "min-height: 100cqh;"],
  [/height: 100dvh;/g, "height: 100cqh;"],
  [/@media \(max-width: 400px\)/g, "@container app (max-width: 400px)"],
];
for (const [from, to] of swaps) {
  if (!from.test(css)) throw new Error(`globals.css changed; update mock/build.mjs swap ${from}`);
  css = css.replace(from, to);
}

const template = readFileSync(resolve(root, "mock/template.html"), "utf8");
const html = template.replace("/*APP_CSS*/", () => css).replace("/*APP_JS*/", () => js);
mkdirSync(resolve(root, "mock/dist"), { recursive: true });
writeFileSync(resolve(root, "mock/dist/index.html"), html);
console.log(`mock/dist/index.html  ${(html.length / 1024).toFixed(0)} KB`);
