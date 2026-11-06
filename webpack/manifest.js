const fs = require("fs");
const path = require("path");

const SOURCES = {
  chrome: "./manifest_v3/manifest.json",
  firefox: "./manifest_v2/manifest.json"
};
const TARGET = "../src/browser-extension/public/manifest.json";
const AUTH_SCRIPT = "scripts/content-script-auth.js";
const DEV_AUTH_MATCHES = ["http://localhost/*", "https://localhost/*"];

const [browser, mode] = process.argv.slice(2);
if (!SOURCES[browser] || (mode !== undefined && mode !== "--dev")) {
  throw new Error("Usage: node webpack/manifest.js <chrome|firefox> [--dev]");
}

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, SOURCES[browser]), "utf8"));
if (mode === "--dev") {
  const authEntry = manifest.content_scripts.find(({ js }) => js.includes(AUTH_SCRIPT));
  authEntry.matches.push(...DEV_AUTH_MATCHES);
}
fs.writeFileSync(path.join(__dirname, TARGET), `${JSON.stringify(manifest, null, 2)}\n`);
