/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { getAiMove } from './server/aiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3005;

  app.use(express.json());

  // AI Move Endpoint
  app.post('/api/ai-move', async (req, res) => {
    try {
      const aiResponse = await getAiMove(req.body);
      res.json(aiResponse);
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      if (error.message && error.message.includes('missing')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to get AI move' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
