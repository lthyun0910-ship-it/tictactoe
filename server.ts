/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Move Endpoint
  app.post('/api/ai-move', async (req, res) => {
    try {
      const { board, difficulty, smartness, customApiKey } = req.body;

      const apiKey = customApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({ error: 'Gemini API Key is missing. Please provide it in settings or environment.' });
      }

      // Initialize Gemini with the chosen key
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Map smartness to temperature: 10% (1.5) -> 100% (0.1)
      const temperature = Math.max(0.1, 1.5 - ((smartness / 100) * 1.4));

      // board is character array of size 9: ['X', 'O', null, ...]
      const boardDisplay = board.map((cell: string | null, idx: number) => cell || (idx + 1));
      const emptyCells = board
        .map((cell: string | null, idx: number) => cell === null ? (idx + 1) : null)
        .filter((val: number | null) => val !== null);

      const systemInstruction = `당신은 틱택토 게임의 AI 플레이어입니다. 항상 JSON 형식으로만 응답합니다.

규칙:
- 보드는 1~9번 칸으로 구성된 3x3 격자입니다.
- X는 플레이어, O는 당신입니다.
- 당신은 항상 O로 플레이합니다.

난이도별 행동 지침:
- 입문 (smartness 10%): 거의 무작위로 두세요. 자주 실수하세요.
- 초급 (smartness 30%): 가끔 좋은 수를 두지만 실수가 잦습니다.
- 중급 (smartness 60%): 이기는 수와 막는 수는 찾되, 가끔 실수하세요.
- 고급 (smartness 85%): 대부분 최선의 수를 둡니다. 지능적인 플레이를 하세요.
- 전문가/무자비 (smartness 95~100%): 최적의 수만 두세요. 절대 실수하지 마세요.

응답 형식 (반드시 이 JSON만 출력, 다른 텍스트 금지):
{
  "move": <1~9 중 빈 칸 번호>,
  "comment": "<한국어 20자 이내 짧은 코멘트>"
}`;

      const prompt = `난이도: ${difficulty} (smartness: ${smartness}%)

현재 보드:
${boardDisplay[0]} | ${boardDisplay[1]} | ${boardDisplay[2]}
${boardDisplay[3]} | ${boardDisplay[4]} | ${boardDisplay[5]}
${boardDisplay[6]} | ${boardDisplay[7]} | ${boardDisplay[8]}

빈 칸: ${emptyCells.join(', ')}
X = 플레이어, O = 나(AI)

다음 수를 JSON으로 응답하세요.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", // Updated to 2.0-flash as per prompt
        contents: prompt,
        config: {
          systemInstruction,
          temperature,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              move: {
                type: Type.INTEGER,
                description: "The cell number (1-9) to move to."
              },
              comment: {
                type: Type.STRING,
                description: "A short comment in Korean."
              }
            },
            required: ["move", "comment"]
          }
        },
      });

      const aiResponse = JSON.parse(response.text || '{}');
      res.json(aiResponse);
    } catch (error) {
      console.error('Gemini API Error:', error);
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
