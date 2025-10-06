import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginString from 'vite-plugin-string'

const vitePluginStringOptions = {
  include: '**/*.gql',                          // apply on graphql files
  exclude: 'node_modules/**',                   // avoid to break something here
  compress: (gql) => gql.replace(/\s+/g, ' ')   // compress the string
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vitePluginString(vitePluginStringOptions)   // import .gql modules as compressed strings
  ],
  base: "/h2o-editor-frontend"
});
