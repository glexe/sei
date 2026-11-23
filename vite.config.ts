/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';

// file:// on webOS may refuse module scripts, so the bundle is a classic deferred IIFE.
function classicScript(): Plugin {
  return {
    name: 'webos-classic-script',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html) {
      return html
        .replace(/<script type="module" crossorigin/g, '<script defer')
        .replace(/ crossorigin(?=[ >])/g, '');
    },
  };
}

// Wallpapers are found by import.meta.glob, which silently matches nothing if the path breaks.
function requireWallpapers(): Plugin {
  return {
    name: 'require-wallpapers',
    apply: 'build',
    generateBundle(_, bundle) {
      if (!Object.keys(bundle).some((file) => file.endsWith('.jpg'))) {
        this.error('No wallpaper images in the bundle: check the glob in lib/wallpapers');
      }
    },
  };
}

export default defineConfig({
  root: 'app',
  base: './',
  plugins: [
    preact({ babel: { plugins: [['babel-plugin-react-compiler', { target: '18' }]] } }),
    classicScript(),
    requireWallpapers(),
  ],
  resolve: {
    alias: {
      'react-compiler-runtime': decodeURIComponent(
        new URL('./app/src/lib/compilerRuntime/compilerRuntime.ts', import.meta.url).pathname,
      ),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[local]_[hash:base64:5]',
    },
  },
  build: {
    outDir: '../build/app',
    emptyOutDir: true,
    target: 'chrome120', // webOS TV 11 runs Chrome 132
    modulePreload: false,
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    rollupOptions: {
      output: { format: 'iife' },
    },
  },
  server: { port: 5173 },
  test: { include: ['src/**/*.test.ts', '../service/*.test.js'], css: true },
});
