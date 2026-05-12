import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: 'Tabby',
  version: pkg.version,
  icons: { 48: 'public/logo.png' },
  action: {
    default_icon: { 48: 'public/logo.png' },
    default_popup: 'src/popup/index.html',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module' as const,
  },
  permissions: ['tabs', 'storage', 'sidePanel'],
  host_permissions: ['https://*/*'],
  content_scripts: [{
    js: ['src/content/main.tsx'],
    matches: ['<all_urls>'],
    run_at: 'document_idle' as const,
  }],
  side_panel: {
    default_path: 'src/dashboard/index.html',
  },
})