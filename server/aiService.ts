import { GoogleGenAI, Type } from "@google/genai";

interface AiMoveRequest {
  board: (string | null)[];
  difficulty: string;
  smartness: number;
  customApiKey?: string;
  personalitySystemInstruction?: string;
}

export async function getAiMove({ board, difficulty, smartness, customApiKey, personalitySystemInstruction }: AiMoveRequest) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please provide it in settings or environment.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const temperature = Math.max(0.1, 1.5 - ((smartness / 100) * 1.4));

  const boardDisplay = board.map((cell, idx) => cell || (idx + 1));
  const emptyCells = board
    .map((cell, idx) => cell === null ? (idx + 1) : null)
    .filter(val => val !== null);

  const systemInstruction = `당신은 틱택토 게임의 AI 플레이어입니다. 항상 JSON 형식으로만 응답합니다.

성격 및 톤앤매너 지침:
${personalitySystemInstruction || '당신은 차분하고 공손하며 논리적인 틱택토 AI입니다. 정중하고 객관적인 태도로 한국어로 20자 이내의 짧은 코멘트를 남겨주세요.'}

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
  "comment": "<위의 성격/톤앤매너 지침을 준수한 한국어 20자 이내의 짧은 코멘트>"
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
    model: "gemini-2.0-flash",
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

  return JSON.parse(response.text || '{}');
}
