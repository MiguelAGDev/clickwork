import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // The backend CORS only allows FRONTEND_URL (http://localhost:5173 in dev).
  // strictPort makes Vite fail instead of silently moving to 5174, which would
  // look like "every request is blocked" with no obvious cause.
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    // Fixed API origin for tests, so they never depend on a local .env file.
    env: {
      VITE_API_URL: "http://localhost:3000",
    },
  },
})
