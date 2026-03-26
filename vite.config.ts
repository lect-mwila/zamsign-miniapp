import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import mkcert from 'vite-plugin-mkcert';
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { tanstackRouter } from '@tanstack/router-plugin/vite'

const config = defineConfig({
  base: process.env.GH ? '/zamsign-miniapp/': '/',
  resolve:{
	  tsconfigPaths: true
    // tsconfigPaths({ projects: ['./tsconfig.json'] }),
  },
  plugins: [
    process.env.HTTPS && mkcert(),
	 tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
  ],
   server: process.env.REMOTE ? {
     host: 'zamsign.com',
     https: {
		key: readFileSync(resolve('.perms/zamsign.com+2-key.pem')), //  <-- YOUR KEY
		cert: readFileSync(resolve('.perms/zamsign.com+2.pem')), // <-- YOUR CERT
     },
     port: 443
   } : {
     host: true,
     port: 3000
   },
})

export default config
