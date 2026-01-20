import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

// Plugin to generate version manifest for cache busting
function versionManifestPlugin() {
  return {
    name: 'version-manifest',
    closeBundle() {
      const manifest = {
        version: process.env.npm_package_version || '1.0.0',
        buildTime: new Date().toISOString(),
        buildHash: process.env.GIT_COMMIT || Date.now().toString(36),
        environment: process.env.NODE_ENV || 'production'
      };
      
      // Write version.json to dist folder
      writeFileSync(
        resolve('dist', 'version.json'),
        JSON.stringify(manifest, null, 2)
      );
      
      console.log('\n✅ Version manifest generated:', manifest);
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    versionManifestPlugin()
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        // Generate content-based hashes for cache busting
        // This ensures every file change gets a new filename
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunks (rarely change)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-state': ['@reduxjs/toolkit', 'redux'],
          'vendor-utils': ['axios', 'date-fns', 'clsx']
        }
      }
    }
  },
  server: {
    port: 4028,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 4028,
      clientPort: 4028
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('⚠️  Proxy error - Backend may not be running');
          });
        }
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    },
    cors: true
  },
  preview: {
    port: 4028,
    host: true
  }
});