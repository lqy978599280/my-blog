import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  publicDir: false,
  build: {
    lib: {
      entry: './src/main.js',
      name: 'BlogWidgets',
      formats: ['iife'],
      fileName: () => 'blog-widgets.js',
    },
    outDir: 'dist/widgets',
    emptyOutDir: true,
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        assetFileNames: 'blog-widgets.[ext]',
      },
    },
    cssCodeSplit: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
});
