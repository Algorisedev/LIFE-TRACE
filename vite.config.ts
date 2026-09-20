import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Custom Vite plugin to serve the root /datasets directory as static files
function datasetsPlugin() {
  return {
    name: 'datasets-static-server',
    configureServer(server) {
      server.middlewares.use('/datasets', (req, res, next) => {
        const filePath = path.join(process.cwd(), 'datasets', req.url || '');
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.csv': 'text/csv; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.tsv': 'text/tab-separated-values; charset=utf-8',
            '.xml': 'application/xml; charset=utf-8',
          };
          res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
          fs.createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), datasetsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  worker: {
    format: 'es',
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
