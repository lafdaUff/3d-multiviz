import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import dataManagerPlugin from './src/dev/vite-plugin-data-manager';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    svgr(),
    ...(command === 'serve' ? [dataManagerPlugin()] : []),
  ],
}))
