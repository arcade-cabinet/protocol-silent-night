import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [path.resolve(__dirname, './src/__tests__/setup.ts')],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/__tests__/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.d.ts',
        '**/types/',
        'vite.config.ts',
        'vitest.config.ts',
        'playwright.config.ts',
        'e2e/',
        '.github/',
      ],
      all: true,
      lines: 25,
      functions: 25,
      branches: 25,
      statements: 25,
      // Output coverage to standard location for Coveralls
      reportsDirectory: './coverage',
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    // Handle ESM packages that have directory imports or other Node ESM issues
    server: {
      deps: {
        inline: [
          '@jbcom/strata',
          '@react-three/fiber',
          '@react-three/drei',
          '@react-three/postprocessing',
          'three',
        ],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@jbcom/strata/components': path.resolve(
        __dirname,
        './node_modules/@jbcom/strata/dist/components/index.js'
      ),
    },
    conditions: ['node', 'default', 'import'],
  },
});
