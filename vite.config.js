const Path = require("path");
const vuePlugin = require("@vitejs/plugin-vue");
const packageJson = require("./package.json");
import vuetify from "vite-plugin-vuetify";

const { defineConfig } = require("vite");

/**
 * https://vitejs.dev/config
 */
const config = defineConfig({
  define: {
    VITE_APP_VERSION: JSON.stringify(packageJson.version),
  },
  root: Path.join(__dirname, "src", "renderer"),
  publicDir: "public",
  server: {
    port: 8080,
  },
  open: false,
  build: {
    outDir: Path.join(__dirname, "build", "renderer"),
    emptyOutDir: true,
  },
  plugins: [
    vuePlugin(),
    vuetify({
      autoImport: true,
    }),
  ],
});

module.exports = config;
