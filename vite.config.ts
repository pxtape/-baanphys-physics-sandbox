import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/-baanphys-physics-sandbox/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'tests/tooling/**/*.test.ts', 'qualification/**/*.test.ts'],
    clearMocks: true,
  },
});
