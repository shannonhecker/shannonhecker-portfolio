import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cpSync, existsSync, readdirSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const htmlInputs = Object.fromEntries(
  readdirSync(rootDir)
    .filter((file) => extname(file) === ".html")
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

      for (const file of ["CNAME", "robots.txt", "sitemap.xml"]) {
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
