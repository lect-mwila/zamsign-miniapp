import { defineConfig } from 'vite'
//import tsconfigPaths from 'vite-tsconfig-paths'
import mkcert from 'vite-plugin-mkcert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const config = defineConfig({
  plugins: [
    //tsconfigPaths({ projects: ['./tsconfig.json'] }),
    process.env.HTTPS && mkcert(),
  ],
   server: process.env.REMOTE ? {
     host: 'zamsign.com',
     https: {
       cert: readFileSync(resolve('.perms/zamsign.com+2.pem')), // <-- YOUR CERT
       key: readFileSync(resolve('.perms/zamsign.com+2-key.pem')), //  <-- YOUR KEY
     },
     port: 443
   } : {
     host: true,
     port: 3000
   },
})

export default config
