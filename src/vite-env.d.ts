/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
  showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>
}
