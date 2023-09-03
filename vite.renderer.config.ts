import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";
import { viteStaticCopy } from 'vite-plugin-static-copy'
import svgr from "vite-plugin-svgr";
import path from 'node:path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    svgr(),
    react()
  ]
});
