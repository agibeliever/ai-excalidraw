import { createServer } from 'http'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { extname, join } from 'path'
import { handleCodexRequest } from './codex-handler'

const port = Number(process.env.PORT || 5173)
const distDir = join(process.cwd(), 'dist')

const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Bad Request')
    return
  }

  if (req.url.startsWith('/api/codex')) {
    await handleCodexRequest(req, res)
    return
  }

  const urlPath = req.url.split('?')[0]
  const normalizedPath = urlPath === '/' ? '/index.html' : urlPath
  let filePath = join(distDir, normalizedPath)

  try {
    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) {
      throw new Error('Not a file')
    }
  } catch {
    filePath = join(distDir, 'index.html')
  }

  const ext = extname(filePath)
  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
  })
  createReadStream(filePath).pipe(res)
})

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
