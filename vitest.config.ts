import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/__tests__/setup.ts'],
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
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
      // Output coverage to standard location for Coveralls
      reportsDirectory: './coverage',
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
