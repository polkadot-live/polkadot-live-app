/// <reference types="vite-plugin-svgr/client" />

declare global {
  interface Window {
    myAPI: MyAPI;
  }
}
