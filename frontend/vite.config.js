import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Set production environment variables
  if (mode === 'production') {
    env.VITE_API_URL = env.VITE_API_URL || 'https://dental-website-backend.fly.dev/api'
    env.VITE_SOCKET_URL = env.VITE_SOCKET_URL || 'https://dental-website-backend.fly.dev'
  }
  
  return {
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
      '@contexts': fileURLToPath(new URL('./src/contexts', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: env.VITE_SOCKET_URL || 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
    // Security headers
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production for security
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          
          // Routing
          'router': ['react-router-dom'],
          
          // UI and animations
          'ui': ['framer-motion', 'react-hot-toast', 'react-loading-skeleton'],
          
          // Forms and validation
          'forms': ['react-hook-form', 'yup', '@hookform/resolvers'],
          
          // Utilities
          'utils': ['lodash', 'date-fns', 'clsx', 'tailwind-merge'],
          
          // Icons
          'icons': ['@heroicons/react', 'react-icons', 'lucide-react'],
          
          // Internationalization
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          
          // Security and crypto
          'security': ['dompurify', 'crypto-js', 'jwt-decode'],
          
          // PDF and file handling
          'pdf': ['jspdf', 'jspdf-autotable'],
          
          // HTTP and networking
          'http': ['axios', 'socket.io-client'],
          
          // Authentication and MFA
          'auth': ['otplib', 'speakeasy', 'qrcode'],
          
          // Admin and vendor specific
          'admin': ['react-select', 'react-phone-number-input'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
    },
    // Tree shaking optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'socket.io-client',
      'dompurify',
      'lodash',
      'date-fns',
      'clsx',
      'tailwind-merge',
    ],
    exclude: [
      'framer-motion', // Exclude from pre-bundling to reduce initial bundle
    ],
  },
  css: {
    devSourcemap: false, // Disable CSS sourcemaps for security
  },
  // Performance optimizations
  esbuild: {
    target: 'es2020',
    supported: {
      'bigint': true,
    },
  },
  // Define environment variables for build time
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || (mode === 'production' ? 'https://dental-website-backend.fly.dev/api' : undefined)),
    'import.meta.env.VITE_SOCKET_URL': JSON.stringify(env.VITE_SOCKET_URL || (mode === 'production' ? 'https://dental-website-backend.fly.dev' : undefined)),
  },
  }
})
