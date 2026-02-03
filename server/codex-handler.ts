import type { IncomingMessage, ServerResponse } from 'http'
import { spawn } from 'child_process'

interface CodexRequestPayload {
  prompt: string
  model?: string
  cliCommand?: string
}

function resolveCliCommand(payload: CodexRequestPayload): string {
  return (
    payload.cliCommand?.trim() ||
    process.env.CODEX_CLI_COMMAND ||
    'codex'
  )
}

function resolveModel(payload: CodexRequestPayload): string | undefined {
  return payload.model?.trim() || process.env.CODEX_MODEL || undefined
}

export async function handleCodexRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Method Not Allowed')
    return
  }

  const body = await new Promise<string>((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })

  let payload: CodexRequestPayload
  try {
    payload = JSON.parse(body) as CodexRequestPayload
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(`Invalid JSON: ${error}`)
    return
  }

  if (!payload.prompt?.trim()) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Prompt is required')
    return
  }

  const cliCommand = resolveCliCommand(payload)
  const model = resolveModel(payload)

  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
  })

  const env = { ...process.env }
  if (model) {
    env.CODEX_MODEL = model
  }

  const child = spawn(cliCommand, [], {
    shell: true,
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  let stderr = ''

  child.stdout.on('data', (chunk) => {
    res.write(chunk)
  })

  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString()
  })

  child.on('error', (error) => {
    res.write(`\n\n[Codex CLI error] ${error.message}\n`)
    res.end()
  })

  child.on('close', (code) => {
    if (code !== 0) {
      res.write(`\n\n[Codex CLI exited with code ${code}]\n${stderr}\n`)
    }
    res.end()
  })

  child.stdin.write(payload.prompt)
  child.stdin.end()
}
