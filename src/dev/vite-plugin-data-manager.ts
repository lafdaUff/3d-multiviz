import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const FILES: Record<string, string> = {
  database: 'database.json',
  dataschema: 'dataschema.json',
  collectionconfig: 'collectionconfig.json',
};

function collectBody(req: { on: (event: string, cb: (data: Buffer) => void) => void }, cb: (buf: Buffer) => void) {
  const chunks: Buffer[] = [];
  req.on('data', (chunk: Buffer) => chunks.push(chunk));
  req.on('end', () => cb(Buffer.concat(chunks)));
}

export default function dataManagerPlugin(): Plugin {
  return {
    name: 'data-manager',
    configureServer(server) {
      const dataDir = path.resolve(server.config.root, 'src/data');
      const publicDir = path.resolve(server.config.root, 'public');

      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/__data-manager/upload-model') && req.method === 'POST') {
          const url = new URL(req.url, 'http://localhost');
          const filename = url.searchParams.get('filename');
          if (!filename || !filename.endsWith('.glb')) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'filename query param required (.glb)' }));
            return;
          }

          const slug = filename.replace(/\.glb$/, '');
          const destDir = path.join(publicDir, 'modelos');
          if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

          collectBody(req, (buf) => {
            fs.writeFileSync(path.join(destDir, filename), buf);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, slug }));
          });
          return;
        }
        next();
      });

      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/__data-manager/upload-thumb') && req.method === 'POST') {
          const url = new URL(req.url, 'http://localhost');
          const filename = url.searchParams.get('filename');
          if (!filename) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'filename query param required' }));
            return;
          }

          const destDir = path.join(publicDir, 'thumbs');
          if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

          collectBody(req, (buf) => {
            fs.writeFileSync(path.join(destDir, filename), buf);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          });
          return;
        }
        next();
      });

      server.middlewares.use((req, res, next) => {
        const prefix = '/__data-manager/';
        if (!req.url?.startsWith(prefix)) return next();

        const fileKey = req.url.slice(prefix.length).split('?')[0];
        const fileName = FILES[fileKey];

        if (!fileName) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Unknown file' }));
          return;
        }

        const filePath = path.join(dataDir, fileName);

        if (req.method === 'GET') {
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(content || '[]');
          } catch {
            res.setHeader('Content-Type', 'application/json');
            res.end('[]');
          }
          return;
        }

        if (req.method === 'PUT') {
          let body = '';
          req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}
