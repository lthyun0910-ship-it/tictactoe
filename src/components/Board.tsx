import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../types';
import { RefreshCw, User, Cpu } from 'lucide-react';

interface BoardProps {
  board: Player[];
  isXNext: boolean;
  loading: boolean;
  winner: Player | 'Draw' | null;
  winningLine: number[] | null;
  handleClick: (i: number) => void;
}

export function Board({ board, isXNext, loading, winner, winningLine, handleClick }: BoardProps) {
  return (
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
        <div className="grid grid-cols-3 gap-4 relative">
          {board.map((cell, i) => {
            const isWinningCell = winningLine?.includes(i);
            const isClickable = !cell && !winner && !loading && isXNext;

            return (
              <motion.button
                key={i}
                disabled={!isClickable}
                whileHover={isClickable ? { scale: 1.02 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
                onClick={() => handleClick(i)}
                aria-label={`칸 ${i + 1}: ${cell ? `${cell} 선택됨` : '비어있음'}`}
                className={`aspect-square rounded-[1.5rem] flex items-center justify-center text-5xl font-black transition-all outline-none ${
                  cell === 'X' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 shadow-inner' : 
                  cell === 'O' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 shadow-inner' : 
                  isClickable 
                    ? 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-102 cursor-pointer' 
                    : 'bg-slate-100/30 dark:bg-slate-800/20 opacity-50 cursor-not-allowed'
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
        </div>
          
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
  );
}
