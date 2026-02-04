import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { handleCodexRequest } from './server/codex-handler'

const codexApiPlugin = (): Plugin => ({
  name: 'codex-api',
  configureServer(server) {
    server.middlewares.use('/api/codex', (req, res) => {
      handleCodexRequest(req, res).catch((error) => {
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(`Codex API error: ${error instanceof Error ? error.message : String(error)}`)
      })
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), codexApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
