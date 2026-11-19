import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cpSync, existsSync, readdirSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const htmlInputs = Object.fromEntries(
  readdirSync(rootDir)
    .filter((file) => file === "game.html")
    .map((file) => [basename(file, ".html"), resolve(rootDir, file)])
);

function copyStaticSiteFiles() {
  return {
    name: "copy-static-site-files",
    closeBundle() {
      const distDir = resolve(rootDir, "dist");
      const assetsDir = resolve(rootDir, "assets");

      if (existsSync(assetsDir)) {
        cpSync(assetsDir, resolve(distDir, "assets"), { recursive: true });
      }

      // The restored pages already ship as standalone HTML. Only the game
      // needs Vite to bundle its TypeScript entry and its dynamic imports.
      const pages = readdirSync(rootDir).filter(name => name.endsWith(".html") && name !== "game.html");
      for (const file of [...pages, "CNAME", "robots.txt", "sitemap.xml"]) {
        const source = resolve(rootDir, file);
        if (existsSync(source)) cpSync(source, resolve(distDir, file));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyStaticSiteFiles()],
  build: {
    rollupOptions: {
      input: htmlInputs,
    },
  },
});
