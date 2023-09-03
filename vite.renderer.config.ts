import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'node:path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
    targets: [
      {
        src: path.resolve(__dirname, './src/fonts') ,
        dest: path.resolve(__dirname, './vite/build/fonts') ,
      }
    ]
  })]
});
