# AI Excalidraw

使用自然语言描述，让 AI 帮你绘制手绘风格流程图、架构图、示意图。

## 功能特性

- 🎨 **自然语言绘图** - 描述想要的图形，AI 自动生成 Excalidraw 元素
- ⚡ **流式响应** - 实时查看 AI 生成过程，边生成边渲染
- 💬 **多会话管理** - 支持创建多个独立聊天会话
- 📱 **响应式设计** - 适配桌面和移动设备
- 🔧 **本地 CLI** - 通过 Codex CLI 在本地生成 Excalidraw 元素
- 💾 **本地存储** - 画布内容和聊天记录自动保存到浏览器

## 快速开始

### 环境要求

- [Bun](https://bun.sh/) >= 1.0（推荐）或 Node.js >= 18
- 已安装并登录的 Codex CLI（确保 `codex` 命令可用）

### 安装

```bash
# 克隆项目
git clone https://github.com/co-pine/ai-excalidraw.git
cd ai-excalidraw

# 安装依赖
bun install
```

### 启动开发服务器

```bash
bun run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
bun run build
```

构建产物位于 `dist/` 目录。

## 配置 Codex CLI

首次启动会自动弹出设置对话框，你需要配置：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| Codex CLI 命令 | 本机可执行的 Codex CLI 命令 | codex |
| Model | 模型名称（可选） | gpt-4o |

> 建议先在终端确认 `codex` 命令可用，并已在本机完成登录/授权。

配置保存在浏览器 localStorage 中，刷新页面后无需重新配置。

可选环境变量：

- `VITE_CODEX_CLI_COMMAND`: 覆盖默认 CLI 命令
- `VITE_CODEX_MODEL`: 覆盖默认模型

### 生产部署

构建后使用内置的静态服务 + Codex CLI API：

```bash
bun run build
bun run start
```

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS v4
- **绘图库**: [Excalidraw](https://excalidraw.com/)
- **UI 组件**: Radix UI
- **包管理**: Bun

## 目录结构

```
ai-excalidraw/
├── src/
│   ├── components/
│   │   ├── excalidraw/          # Excalidraw 相关组件
│   │   │   ├── index.tsx        # 主编辑器组件，整合画布和聊天面板
│   │   │   ├── wrapper.tsx      # Excalidraw 画布封装
│   │   │   ├── chat-panel.tsx   # 桌面端 AI 聊天面板
│   │   │   ├── mobile-input.tsx # 移动端 AI 输入组件
│   │   │   ├── element-parser.ts # AI 输出解析器，提取 JSON 元素
│   │   │   └── use-chat-history.ts # 聊天历史管理 Hook
│   │   ├── ui/                  # 通用 UI 组件
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── textarea.tsx
│   │   └── settings-dialog.tsx  # Codex CLI 配置对话框
│   ├── lib/
│   │   ├── ai.ts                # Codex CLI 调用封装（流式请求）
│   │   ├── prompt.ts            # Excalidraw 绘图系统提示词
│   │   └── utils.ts             # 工具函数
│   ├── App.tsx                  # 应用入口组件
│   ├── main.tsx                 # React 挂载入口
│   └── index.css                # 全局样式
├── server/
│   ├── codex-handler.ts         # Codex CLI API 处理逻辑
│   └── index.ts                 # 生产静态服务入口
├── public/                      # 静态资源
├── index.html                   # HTML 模板
├── vite.config.ts               # Vite 配置
├── tailwind.config.js           # Tailwind 配置
├── tsconfig.json                # TypeScript 配置
└── package.json
```

## 使用示例

在聊天框中输入自然语言描述，例如：

- "画一个简单的流程图：开始 → 处理 → 结束"
- "画一个前后端分离的架构图"
- "画一个用户登录的时序图"
- "画一个 React 组件的生命周期图"

AI 会自动生成对应的 Excalidraw 图形元素。

## 开源协议

[MIT](LICENSE)

## 支持作者

如果这个项目对你有帮助，欢迎请作者喝瓶水

<img src="./assets/donate.jpg" alt="赞赏码" width="200" />
