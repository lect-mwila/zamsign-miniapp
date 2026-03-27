import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert';
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const config = defineConfig({
  base: process.env.GH ? '/zamsign-miniapp/': '/',
  resolve:{
	  tsconfigPaths: true
    // tsconfigPaths({ projects: ['./tsconfig.json'] }),
  },
  plugins: [
    process.env.HTTPS && mkcert(),
    react(),
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
