import { useState, useEffect, useCallback } from 'react';
import { Player, Score, PersonalityId } from '../types';
import { DIFFICULTIES, DEFAULT_DIFFICULTY_INDEX, WINNING_LINES, GAME_STATUS, PERSONALITIES } from '../constants';

export function useTicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [difficultyIndex, setDifficultyIndex] = useState(DEFAULT_DIFFICULTY_INDEX);
  const [status, setStatus] = useState<string>(GAME_STATUS.PLAYER_TURN);
  const [aiComment, setAiComment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const [score, setScore] = useState<Score>({ win: 0, loss: 0, draw: 0 });
  const [winStreak, setWinStreak] = useState(0);
  
  // Custom Heuristics & Personality States
  const [history, setHistory] = useState<any[]>([]);
  const [personalityId, setPersonalityId] = useState<PersonalityId>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('tictactoe-personality') as PersonalityId) || 'default';
    }
    return 'default';
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [customApiKey, setCustomApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('gemini_api_key') || '';
    }
    return '';
  });

  const currentDifficulty = DIFFICULTIES[difficultyIndex];
  const currentPersonality = PERSONALITIES.find(p => p.id === personalityId) || PERSONALITIES[0];

  useEffect(() => {
    const savedScore = localStorage.getItem('tictactoe-score');
    if (savedScore) setScore(JSON.parse(savedScore));
    
    const savedStreak = localStorage.getItem('tictactoe-streak');
    if (savedStreak) setWinStreak(Number(savedStreak));

    const savedDifficulty = localStorage.getItem('tictactoe-difficulty');
    if (savedDifficulty) setDifficultyIndex(Number(savedDifficulty));
  }, []);

  useEffect(() => {
    localStorage.setItem('tictactoe-score', JSON.stringify(score));
    localStorage.setItem('tictactoe-streak', winStreak.toString());
    localStorage.setItem('tictactoe-difficulty', difficultyIndex.toString());
  }, [score, winStreak, difficultyIndex]);

  useEffect(() => {
    sessionStorage.setItem('gemini_api_key', customApiKey);
  }, [customApiKey]);

  useEffect(() => {
    localStorage.setItem('tictactoe-personality', personalityId);
  }, [personalityId]);

  const calculateWinner = (squares: Player[]) => {
    for (let i = 0; i < WINNING_LINES.length; i++) {
      const [a, b, c] = WINNING_LINES[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    if (squares.every(square => square !== null)) {
      return { winner: 'Draw' as const, line: null };
    }
    return null;
  };

  const updateStats = (result: Player | 'Draw') => {
    if (result === 'X') {
      setScore(s => ({ ...s, win: s.win + 1 }));
      setWinStreak(prev => Math.min(prev + 1, 6));
      if (difficultyIndex < DIFFICULTIES.length - 1) {
        setDifficultyIndex(prev => prev + 1);
      }
    } else if (result === 'O') {
      setScore(s => ({ ...s, loss: s.loss + 1 }));
      setWinStreak(0);
      if (difficultyIndex > 0) {
        setDifficultyIndex(prev => prev - 1);
      }
    } else if (result === 'Draw') {
      setScore(s => ({ ...s, draw: s.draw + 1 }));
    }
  };

  const handleAiMove = useCallback(async (currentBoard: Player[]) => {
    setLoading(true);
    setStatus(GAME_STATUS.AI_API_CALLING);
    setApiError(null);
    
    try {
      const resp = await fetch('/api/ai-move', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': customApiKey 
        },
        body: JSON.stringify({ 
          board: currentBoard, 
          difficulty: currentDifficulty.name, 
          smartness: currentDifficulty.smartness,
          customApiKey: customApiKey || undefined,
          personalitySystemInstruction: currentPersonality.systemInstruction
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gemini API 호출에 실패했습니다. API 키나 인터넷 연결 상태를 확인해주세요.');
      }
      
      const data = await resp.json();
      
      const moveIdx = data.move - 1;
      if (moveIdx >= 0 && moveIdx < 9 && currentBoard[moveIdx] === null) {
        const nextBoard = [...currentBoard];
        nextBoard[moveIdx] = 'O';
        setBoard(nextBoard);
        setAiComment(data.comment);
        
        const result = calculateWinner(nextBoard);
        if (result) {
          setWinner(result.winner);
          setWinningLine(result.line);
          setStatus(result.winner === 'Draw' ? GAME_STATUS.DRAW_AI : GAME_STATUS.AI_WIN);
          updateStats(result.winner);
        } else {
          setIsXNext(true);
          setStatus(GAME_STATUS.PLAYER_TURN);
        }
      } else {
        const available = currentBoard.map((c, i) => c === null ? i : null).filter(v => v !== null) as number[];
        if (available.length > 0) {
          const randomIdx = available[Math.floor(Math.random() * available.length)];
          const nextBoard = [...currentBoard];
          nextBoard[randomIdx] = 'O';
          setBoard(nextBoard);
          setAiComment('오류로 인해 임의의 수를 둡니다.');
          const result = calculateWinner(nextBoard);
          if (result) {
            setWinner(result.winner);
            setWinningLine(result.line);
            updateStats(result.winner);
          } else {
            setIsXNext(true);
            setStatus(GAME_STATUS.PLAYER_TURN);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setStatus(GAME_STATUS.AI_ERROR);
      setApiError(err.message || 'AI 플레이어와의 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentDifficulty, difficultyIndex, customApiKey, currentPersonality]);

  const handleClick = (i: number) => {
    if (winner || board[i] || !isXNext || loading) return;

    // Save state to history before player's action
    const snapshot = {
      board: [...board],
      isXNext,
      winner,
      winningLine,
      score: { ...score },
      winStreak,
      difficultyIndex,
      status,
      aiComment
    };
    setHistory(prev => [...prev, snapshot]);
    setApiError(null);

    const nextBoard = [...board];
    nextBoard[i] = 'X';
    setBoard(nextBoard);
    
    const result = calculateWinner(nextBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setStatus(result.winner === 'Draw' ? GAME_STATUS.DRAW : GAME_STATUS.PLAYER_WIN);
      updateStats(result.winner);
    } else {
      setIsXNext(false);
      setStatus(GAME_STATUS.AI_THINKING);
      setTimeout(() => handleAiMove(nextBoard), 600);
    }
  };

  const undo = () => {
    if (history.length === 0 || loading) return;

    const previousState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));

    setBoard(previousState.board);
    setIsXNext(previousState.isXNext);
    setWinner(previousState.winner);
    setWinningLine(previousState.winningLine);
    setScore(previousState.score);
    setWinStreak(previousState.winStreak);
    setDifficultyIndex(previousState.difficultyIndex);
    setStatus(previousState.status);
    setAiComment('무르기를 실행하여 한 수 물러났습니다.');
    setApiError(null);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setStatus(GAME_STATUS.NEW_GAME);
    setAiComment('');
    setWinner(null);
    setWinningLine(null);
    setLoading(false);
    setApiError(null);
    setHistory([]);
  };

  const triggerResetStats = () => {
    setShowConfirmModal(true);
  };

  const confirmResetStats = () => {
    setScore({ win: 0, loss: 0, draw: 0 });
    setWinStreak(0);
    setDifficultyIndex(DEFAULT_DIFFICULTY_INDEX);
    resetGame();
    setShowConfirmModal(false);
  };

  return {
    board,
    isXNext,
    currentDifficulty,
    status,
    aiComment,
    loading,
    winner,
    winningLine,
    score,
    winStreak,
    customApiKey,
    setCustomApiKey,
    handleClick,
    resetGame,
    
    // New states and methods
    history,
    undo,
    personalityId,
    setPersonalityId,
    currentPersonality,
    apiError,
    setApiError,
    showConfirmModal,
    setShowConfirmModal,
    triggerResetStats,
    confirmResetStats
  };
}

