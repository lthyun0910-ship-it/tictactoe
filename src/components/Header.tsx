import { Trophy, Settings2, Moon, Sun, RefreshCw, HelpCircle } from 'lucide-react';
import { DifficultyLevel } from '../types';

interface HeaderProps {
  currentDifficulty: DifficultyLevel;
  winStreak: number;
  loading: boolean;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  setShowApiModal: (show: boolean) => void;
  setShowHelpModal: (show: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  resetGame: () => void;
}

export function Header({ 
  currentDifficulty, 
  winStreak, 
  loading, 
  showSettings, 
  setShowSettings, 
  setShowApiModal,
  setShowHelpModal,
  isDarkMode,
  setIsDarkMode,
  resetGame
}: HeaderProps) {
  return (
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
          onClick={() => setShowHelpModal(true)}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title="도움말 및 규칙"
        >
          <HelpCircle size={20} />
        </button>
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
  );
}

