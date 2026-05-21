import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Trophy, User, Cpu, AlertCircle, Settings2, Trash2, Moon, Sun, Info, X } from 'lucide-react';

type Player = 'X' | 'O' | null;
type Difficulty = '입문' | '초급' | '중급' | '고급' | '전문가' | '무자비';

interface DifficultyLevel {
  name: Difficulty;
  smartness: number;
  color: string;
}

const DIFFICULTIES: DifficultyLevel[] = [
  { name: '입문', smartness: 10, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
  { name: '초급', smartness: 30, color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400' },
  { name: '중급', smartness: 60, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
  { name: '고급', smartness: 80, color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400' },
  { name: '전문가', smartness: 95, color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' },
  { name: '무자비', smartness: 100, color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' },
];

export default function App() {
  // Game State
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [difficultyIndex, setDifficultyIndex] = useState(2); // Start at '중급'
  const [status, setStatus] = useState<string>('당신의 차례입니다 (X)');
  const [aiComment, setAiComment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  // Stats & Progress
  const [score, setScore] = useState({ win: 0, loss: 0, draw: 0 });
  const [winStreak, setWinStreak] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('gemini_api_key') || '';
    }
    return '';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const currentDifficulty = DIFFICULTIES[difficultyIndex];

  // Initial Modal Check
  useEffect(() => {
    const key = sessionStorage.getItem('gemini_api_key');
    if (!key) {
      setShowApiModal(true);
    }
  }, []);

  // Load Scoreboard
  useEffect(() => {
    const savedScore = localStorage.getItem('tictactoe-score');
    if (savedScore) setScore(JSON.parse(savedScore));
    
    const savedStreak = localStorage.getItem('tictactoe-streak');
    if (savedStreak) setWinStreak(Number(savedStreak));

    const savedDifficulty = localStorage.getItem('tictactoe-difficulty');
    if (savedDifficulty) setDifficultyIndex(Number(savedDifficulty));
  }, []);

  // Save Stats
  useEffect(() => {
    localStorage.setItem('tictactoe-score', JSON.stringify(score));
    localStorage.setItem('tictactoe-streak', winStreak.toString());
    localStorage.setItem('tictactoe-difficulty', difficultyIndex.toString());
  }, [score, winStreak, difficultyIndex]);

  useEffect(() => {
    sessionStorage.setItem('gemini_api_key', customApiKey);
  }, [customApiKey]);

  // Dark Mode Toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
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
      // Increase difficulty on win
      if (difficultyIndex < DIFFICULTIES.length - 1) {
        setDifficultyIndex(prev => prev + 1);
      }
    } else if (result === 'O') {
      setScore(s => ({ ...s, loss: s.loss + 1 }));
      setWinStreak(0);
      // Decrease difficulty on loss
      if (difficultyIndex > 0) {
        setDifficultyIndex(prev => prev - 1);
      }
    } else if (result === 'Draw') {
      setScore(s => ({ ...s, draw: s.draw + 1 }));
    }
  };

  const handleAiMove = useCallback(async (currentBoard: Player[]) => {
    setLoading(true);
    setStatus('AI가 전략을 구상하고 있습니다...');
    
    try {
      const resp = await fetch('/api/ai-move', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': customApiKey // Optional header for server to handle
        },
        body: JSON.stringify({ 
          board: currentBoard, 
          difficulty: currentDifficulty.name, 
          smartness: currentDifficulty.smartness,
          customApiKey: customApiKey || undefined
        }),
      });

      if (!resp.ok) throw new Error('AI API Error');
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
          setStatus(result.winner === 'Draw' ? '무승부입니다!' : '무자비한 AI의 승리입니다.');
          updateStats(result.winner);
        } else {
          setIsXNext(true);
          setStatus('당신의 차례입니다 (X)');
        }
      } else {
        // Fallback: Random move if AI fails or suggests invalid move
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
            setStatus('당신의 차례입니다 (X)');
          }
        }
      }
    } catch (err) {
      console.error(err);
      setStatus('AI 연결 실패. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [currentDifficulty, difficultyIndex]);

  const handleClick = (i: number) => {
    if (winner || board[i] || !isXNext || loading) return;

    const nextBoard = [...board];
    nextBoard[i] = 'X';
    setBoard(nextBoard);
    
    const result = calculateWinner(nextBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setStatus(result.winner === 'Draw' ? '전략적인 무승부입니다.' : '축하합니다! 당신의 승리입니다.');
      updateStats(result.winner);
    } else {
      setIsXNext(false);
      setStatus('AI가 분석 중입니다...');
      setTimeout(() => handleAiMove(nextBoard), 600);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setStatus('새 게임이 시작되었습니다.');
    setAiComment('');
    setWinner(null);
    setWinningLine(null);
    setLoading(false);
  };

  const resetStats = () => {
    if (confirm('모든 전적을 초기화하시겠습니까?')) {
      setScore({ win: 0, loss: 0, draw: 0 });
      setWinStreak(0);
      setDifficultyIndex(2);
      resetGame();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg space-y-4"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <Trophy className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">AI Tic-Tac-Toe</h1>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${currentDifficulty.color}`}>
                  {currentDifficulty.name}
                </span>
                <div className="flex gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                        i < winStreak ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50 scale-125' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowApiModal(true)}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-all uppercase tracking-tighter"
            >
              API 키 변경
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-xl transition-colors ${showSettings ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
              title="설정"
            >
              <Settings2 size={20} />
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={resetGame}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* API Key Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  <AlertCircle size={12} /> Custom API Key Override
                </div>
                <input 
                  type="password"
                  placeholder="Enter your Gemini API Key..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl text-xs font-mono border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed px-1">
                  기본적으로 시스템 제공 키를 사용합니다. 개인 키를 입력하면 해당 키가 우선 적용됩니다. (sessionStorage에 저장됨)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score Board */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'YOU', value: score.win, color: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'DRAW', value: score.draw, color: 'text-slate-500 dark:text-slate-400' },
            { label: 'AI', value: score.loss, color: 'text-rose-600 dark:text-rose-400' }
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-2xl text-center border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest">{item.label}</span>
              <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Main Board Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full -z-10 group-hover:bg-indigo-500/10 transition-all duration-1000" />
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl shadow-indigo-900/5 border border-slate-100 dark:border-slate-800">
            {/* Status Info */}
            <div className="flex items-center justify-between mb-6 px-2">
              <div className={`transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-2xl ${isXNext && !winner ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-100 dark:ring-indigo-900/50' : 'opacity-40 text-slate-400'}`}>
                <User size={18} />
                <span className="font-black text-sm uppercase">Player</span>
              </div>
              <div className="h-0.5 flex-1 mx-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-500"
                  animate={{ width: isXNext ? '0%' : '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className={`transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-2xl ${!isXNext && !winner ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 ring-1 ring-rose-100 dark:ring-rose-900/50' : 'opacity-40 text-slate-400'}`}>
                <Cpu size={18} />
                <span className="font-black text-sm uppercase">Gemini</span>
              </div>
            </div>

            {/* Grid */}
            <div className={`grid grid-cols-3 gap-4 relative ${loading || winner ? 'pointer-events-none' : ''}`}>
              {board.map((cell, i) => {
                const isWinningCell = winningLine?.includes(i);
                return (
                  <motion.button
                    key={i}
                    whileHover={!cell && !winner ? { scale: 1.02 } : {}}
                    whileTap={!cell && !winner ? { scale: 0.95 } : {}}
                    onClick={() => handleClick(i)}
                    className={`aspect-square rounded-[1.5rem] flex items-center justify-center text-5xl font-black transition-all ${
                      cell === 'X' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 shadow-inner' : 
                      cell === 'O' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 shadow-inner' : 
                      'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                    } ${isWinningCell ? 'ring-4 ring-yellow-400 dark:ring-yellow-500 scale-105 z-10' : ''}`}
                  >
                    <AnimatePresence mode="wait">
                      {cell && (
                        <motion.span
                          initial={{ scale: 0, rotate: -45, opacity: 0 }}
                          animate={{ 
                            scale: 1, 
                            rotate: 0, 
                            opacity: 1,
                            ...(isWinningCell ? { scale: [1, 1.1, 1] } : {})
                          }}
                          transition={{ 
                            type: 'spring', 
                            damping: 10, 
                            stiffness: 100,
                            ...(isWinningCell ? { repeat: Infinity, duration: 2 } : {})
                          }}
                          className="flex items-center justify-center h-full w-full"
                        >
                          {cell}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
              
              {/* Overlay while thinking */}
              <AnimatePresence>
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-20"
                  >
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                      <RefreshCw size={24} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-300">GEMINI 분석 중...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Console / Comments Section */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">
            <Info size={12} /> Status Console
          </div>
          <div className="min-h-[60px]">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">{status}</p>
            <AnimatePresence mode="wait">
              {aiComment && (
                <motion.div 
                  key={aiComment}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/50"
                >
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-medium italic">
                    " {aiComment} "
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3">
          <button 
            onClick={resetGame}
            className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
              winner 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20 active:scale-95' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {winner ? 'REMATCH' : 'RESET BOARD'}
          </button>
          <button 
            onClick={resetStats}
            title="기록 초기화"
            className="p-4 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-500 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shadow-sm"
          >
            <Trash2 size={24} />
          </button>
        </div>

        <div className="text-center text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em] py-4">
          Powered by Gemini 2.0 Flash
        </div>
      </motion.div>

      {/* API Key Setup Modal */}
      <AnimatePresence>
        {showApiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Gemini API 키 설정</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                      API 키를 입력하면 Gemini AI와 대전할 수 있어요. 없어도 로컬 AI로 바로 플레이 가능합니다.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowApiModal(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                      Gemini API Key
                    </label>
                    <input 
                      type="password"
                      placeholder="AIza..."
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-2xl text-sm font-mono border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button 
                      onClick={() => setShowApiModal(false)}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                    >
                      게임 시작
                    </button>
                    <button 
                      onClick={() => {
                        setCustomApiKey('');
                        setShowApiModal(false);
                      }}
                      className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                    >
                      키 없이 시작
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

