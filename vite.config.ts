/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Every build gets a unique version. It's baked into the app and also written
 * to version.json, so a running app (e.g. from the home screen) can notice
 * that a newer build is live and offer a reload. See src/lib/useUpdateCheck.ts.
 */
const BUILD_VERSION = process.env.GITHUB_RUN_ID ?? String(Date.now());

function versionFile(): Plugin {
  return {
    name: "gamepick-version-file",
    apply: "build",
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ version: BUILD_VERSION }) });
    },
  };
}

// GitHub Pages serves the site from /<repo>/, so the workflow passes BASE_PATH.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), versionFile()],
  define: {
    __APP_VERSION__: JSON.stringify(BUILD_VERSION),
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
