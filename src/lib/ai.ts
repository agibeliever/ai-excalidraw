import { EXCALIDRAW_SYSTEM_PROMPT } from './prompt'
import type { ElementSummary } from '@/components/excalidraw/wrapper'

export interface AIConfig {
  cliCommand: string
  model: string
}

const STORAGE_KEY = 'ai-excalidraw-config'

/**
 * 获取 AI 配置（优先环境变量，其次 localStorage）
 */
export function getAIConfig(): AIConfig {
  // 优先从环境变量读取
  const envConfig: AIConfig = {
    cliCommand: import.meta.env.VITE_CODEX_CLI_COMMAND || 'codex',
    model: import.meta.env.VITE_CODEX_MODEL || 'gpt-4o',
  }

  // 如果环境变量已配置，直接返回
  if (envConfig.cliCommand) {
    return envConfig
  }

  // 否则从 localStorage 读取
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AIConfig>
      return {
        cliCommand: parsed.cliCommand || envConfig.cliCommand,
        model: parsed.model || envConfig.model,
      }
    }
  } catch {
    // ignore
  }

  return envConfig
}

/**
 * 保存 AI 配置到 localStorage
 */
export function saveAIConfig(config: AIConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    console.warn('Failed to save AI config')
  }
}

/**
 * 检查配置是否有效
 */
export function isConfigValid(config: AIConfig): boolean {
  return !!(config.cliCommand && config.model)
}

/**
 * 构建包含选中元素信息的用户消息
 */
function buildUserMessage(userMessage: string, selectedElements?: ElementSummary[]): string {
  if (!selectedElements || selectedElements.length === 0) {
    return userMessage
  }

  // 分离主元素和绑定元素
  const mainElements = selectedElements.filter(el => !el.containerId)
  const boundElements = selectedElements.filter(el => el.containerId)

  // 构建元素描述
  const formatElement = (el: ElementSummary, indent = '') => {
    const parts = [`id: ${el.id}`, `type: ${el.type}`]
    if (el.text) parts.push(`text: "${el.text}"`)
    parts.push(`position: (${el.x}, ${el.y})`)
    parts.push(`size: ${el.width}x${el.height}`)
    if (el.strokeColor) parts.push(`strokeColor: ${el.strokeColor}`)
    if (el.backgroundColor && el.backgroundColor !== 'transparent') {
      parts.push(`backgroundColor: ${el.backgroundColor}`)
    }
    return `${indent}- ${parts.join(', ')}`
  }

  // 构建上下文
  let elementsContext = ''
  for (const el of mainElements) {
    elementsContext += formatElement(el) + '\n'
    // 添加该元素的绑定元素（如形状内的文字）
    const children = boundElements.filter(b => b.containerId === el.id)
    for (const child of children) {
      elementsContext += formatElement(child, '  ') + ' (绑定在 ' + el.id + ' 内的文字)\n'
    }
  }
  
  // 添加没有父元素的绑定元素（理论上不应该发生）
  const orphanBound = boundElements.filter(b => !mainElements.find(m => m.id === b.containerId))
  for (const el of orphanBound) {
    elementsContext += formatElement(el) + '\n'
  }

  return `用户选中了以下元素，请基于这些元素进行修改：
${elementsContext}
用户的请求：${userMessage}

注意：修改现有元素时，请保持相同的 id，这样会更新而不是新建元素。`
}

/**
 * 流式调用 Codex CLI
 */
export async function streamChat(
  userMessage: string,
  onChunk: (content: string) => void,
  onError?: (error: Error) => void,
  config?: AIConfig,
  selectedElements?: ElementSummary[]
): Promise<void> {
  const finalConfig = config || getAIConfig()

  if (!isConfigValid(finalConfig)) {
    onError?.(new Error('请先配置 Codex CLI'))
    return
  }

  const contextualMessage = buildUserMessage(userMessage, selectedElements)
  const prompt = `${EXCALIDRAW_SYSTEM_PROMPT}\n\n用户请求：\n${contextualMessage}\n`

  try {
    const response = await fetch('/api/codex', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: finalConfig.model,
        cliCommand: finalConfig.cliCommand,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Codex CLI 请求失败: ${response.status} ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      const fallback = await response.text()
      onChunk(fallback)
      return
    }

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        onChunk(decoder.decode(value, { stream: true }))
      }
    }
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error(String(error)))
  }
}
