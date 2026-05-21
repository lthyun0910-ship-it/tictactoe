export type Player = 'X' | 'O' | null;
export type Difficulty = '입문' | '초급' | '중급' | '고급' | '전문가' | '무자비';

export interface DifficultyLevel {
  name: Difficulty;
  smartness: number;
  color: string;
}

export interface Score {
  win: number;
  loss: number;
  draw: number;
}

export type PersonalityId = 'default' | 'tsundere' | 'praise' | 'grandmaster';

export interface Personality {
  id: PersonalityId;
  name: string;
  emoji: string;
  description: string;
  systemInstruction: string;
  color: string;
}

