/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CODEX_CLI_COMMAND: string
  readonly VITE_CODEX_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
