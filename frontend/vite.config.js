import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // permite acesso via IP da rede
    port: 5173
  },
  build: {
    outDir: 'dist'
  }
})




// // frontend/vite.config.js
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': {       
//         target: 'http://192.168.13.149:5173', // <<-- AQUI!
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, ''),
//         logLevel: 'debug' 
//       },
//     },    
//     host: '0.0.0.0', 
//   },
// })