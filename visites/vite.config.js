import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

/**
 * The app is installed on the employees' phones and used in stairwells and
 * basements, so its shell has to open without a connection. Rather than pull
 * in a service-worker toolkit, the build lists the files it just produced and
 * stamps them into sw-template.js.
 */
function serviceWorker() {
  return {
    name: "manny-service-worker",
    apply: "build",
    generateBundle(_options, bundle) {
      const publicDir = here("public");
      const precache = [
        // The shell is reachable under both names, and both are asked for:
        // "/" when the app is launched, "/index.html" by the offline fallback.
        "/",
        "/index.html",
        ...Object.keys(bundle)
          .filter((name) => !name.endsWith(".map"))
          .map((name) => `/${name}`),
        ...filesUnder(publicDir).map(
          (path) => `/${relative(publicDir, path).split("\\").join("/")}`
        ),
      ];

      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: readFileSync(here("sw-template.js"), "utf8")
          .replace("__VERSION__", Date.now().toString(36))
          .replace("__PRECACHE__", JSON.stringify([...new Set(precache)], null, 2)),
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorker()],
});
