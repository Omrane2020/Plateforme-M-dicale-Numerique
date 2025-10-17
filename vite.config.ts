import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    disabled: false,
    entries: [],
    exclude: [
      'sonner',
      '@radix-ui/react-slot',
      'class-variance-authority',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-label',
      'lucide-react',
      '@radix-ui/react-dialog',
      'react-day-picker',
      '@radix-ui/react-tabs',
      '@radix-ui/react-switch',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-avatar',
      '@radix-ui/react-separator'
    ]
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})