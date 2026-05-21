import { DifficultyLevel, Personality } from './types';

export const PERSONALITIES: Personality[] = [
  {
    id: 'default',
    name: '표준 AI',
    emoji: '🤖',
    description: '차분하고 객관적인 기본 플레이어',
    color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50',
    systemInstruction: '당신은 차분하고 공손하며 논리적인 틱택토 AI입니다. 정중하고 객관적인 태도로 한국어로 20자 이내의 짧은 코멘트를 남겨주세요.'
  },
  {
    id: 'tsundere',
    name: '츤데레',
    emoji: '😒',
    description: '새침하고 킹받는 감정 표현',
    color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900/50',
    systemInstruction: '당신은 퉁명스럽고 새침떼기인 츤데레 AI입니다. 플레이어에게 핀잔을 주거나 부끄러워하지만, 결국 틱택토 규칙에 충실하게 둡니다. 츤데레 말투(예: "흥! 딱히 네가 좋아서 상대해주는 건 아냐!", "바보같이 거길 두다니.. 한심하네!")를 사용하여 한국어로 20자 이내의 아주 짧은 코멘트를 남겨주세요.'
  },
  {
    id: 'praise',
    name: '칭찬봇',
    emoji: '🤩',
    description: '호들갑 감탄과 극단적 긍정',
    color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    systemInstruction: '당신은 플레이어의 수에 엄청나게 과장된 칭찬과 리액션을 쏟아내는 극단적 긍정 주접 AI입니다. 매 순간 감동과 찬사를 표현하며 감탄사를 섞어(예: "와아! 정말 경이로운 판단이십니다!", "흑흑.. 천재적인 수에 소름이 돋네요!") 한국어로 20자 이내의 짧은 코멘트를 남겨주세요.'
  },
  {
    id: 'grandmaster',
    name: '바둑 기사',
    emoji: '🧙',
    description: '인생을 한 수에 담는 진지함',
    color: 'bg-slate-50 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400 border-slate-100 dark:border-slate-800/50',
    systemInstruction: '당신은 바둑의 대가처럼 매 한 수에 인생의 깊은 이치와 철학을 담아 엄숙하게 두는 AI입니다. 매우 정중하고 사려 깊은 대가의 고풍스러운 어투(예: "허허.. 이 한 수에 우주의 이치가 깃들었군요.", "묘수로다. 노부가 신중을 기해 대응하리다.")를 사용하여 한국어로 20자 이내의 짧은 코멘트를 남겨주세요.'
  }
];


export const DIFFICULTIES: DifficultyLevel[] = [
  { name: '입문', smartness: 10, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
  { name: '초급', smartness: 30, color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400' },
  { name: '중급', smartness: 60, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
  { name: '고급', smartness: 80, color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400' },
  { name: '전문가', smartness: 95, color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' },
  { name: '무자비', smartness: 100, color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' },
];

export const DEFAULT_DIFFICULTY_INDEX = 2; // '중급'

export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export const GAME_STATUS = {
  PLAYER_TURN: '당신의 차례입니다 (X)',
  AI_THINKING: 'AI가 분석 중입니다...',
  AI_API_CALLING: 'AI가 전략을 구상하고 있습니다...',
  DRAW: '전략적인 무승부입니다.',
  DRAW_AI: '무승부입니다!',
  PLAYER_WIN: '축하합니다! 당신의 승리입니다.',
  AI_WIN: '무자비한 AI의 승리입니다.',
  AI_ERROR: 'AI 연결 실패. 잠시 후 다시 시도해주세요.',
  NEW_GAME: '새 게임이 시작되었습니다.',
};
