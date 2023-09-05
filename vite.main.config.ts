import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import { resolve } from 'path'
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    browserField: false,
    mainFields: ['module', 'jsnext:main', 'jsnext'],
    alias: [
      {
        find: "@",
        replacement: resolve(__dirname, "./src"),
      },
      {
        find: "@app",
        replacement: resolve(__dirname, "./src/renderer"),
      },
    ],
  },
  plugins: [ 
    eslint(),
    svgr(),
  ],
});
