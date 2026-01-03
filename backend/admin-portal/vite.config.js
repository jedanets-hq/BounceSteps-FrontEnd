import { defineConfig } from 'vite';

export default defineConfig({
    root: './',
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: './index.html'
            }
        }
    },
    server: {
        port: 8080,
        strictPort: false,
        open: true,
        proxy: {
            '/api': {
                target: 'https://isafarinetworkglobal-2.onrender.com',
                changeOrigin: true,
                secure: true
            }
        }
    },
    publicDir: '../public'
});
