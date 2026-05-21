import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Trash2, Info, Undo } from 'lucide-react';

import { useTicTacToe } from './hooks/useTicTacToe';
import { Header } from './components/Header';
import { ScoreBoard } from './components/ScoreBoard';
import { Board } from './components/Board';
import { ApiSetupModal } from './components/ApiSetupModal';
import { PersonalitySelector } from './components/PersonalitySelector';
import { HelpModal } from './components/HelpModal';
import { CustomConfirmModal } from './components/CustomConfirmModal';

export default function App() {
  const {
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
    
    // New Hook Actions & States
    history,
    undo,
    personalityId,
    setPersonalityId,
    currentPersonality,
    apiError,
    showConfirmModal,
    setShowConfirmModal,
    triggerResetStats,
    confirmResetStats
  } = useTicTacToe();

  const [showSettings, setShowSettings] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Initial Modal Check
  useEffect(() => {
    const key = sessionStorage.getItem('gemini_api_key');
    if (!key) {
      setShowApiModal(true);
    }
  }, []);

  // Dark Mode Toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg space-y-4"
      >
        <Header 
          currentDifficulty={currentDifficulty}
          winStreak={winStreak}
          loading={loading}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          setShowApiModal={setShowApiModal}
          setShowHelpModal={setShowHelpModal}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          resetGame={resetGame}
        />

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
                  className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl text-xs font-mono border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed px-1">
                  기본적으로 시스템 제공 키를 사용합니다. 개인 키를 입력하면 해당 키가 우선 적용됩니다. (sessionStorage에 저장됨)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Personality Selector */}
        <PersonalitySelector 
          selectedId={personalityId}
          onChange={setPersonalityId}
        />

        <ScoreBoard score={score} />

        <Board 
          board={board}
          isXNext={isXNext}
          loading={loading}
          winner={winner}
          winningLine={winningLine}
          handleClick={handleClick}
        />

        {/* Error Alert Section (Heuristic Error Recovery) */}
        <AnimatePresence>
          {apiError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-3xl border border-rose-100 dark:border-rose-900/50 space-y-2"
            >
              <div className="flex items-center gap-2 text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                <AlertCircle size={14} /> AI 통신 오류가 발생했습니다
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                {apiError}
              </p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                💡 해결 팁: 상단 헤더의 설정(⚙️)을 눌러 Gemini API Key가 유효한지 확인하시거나 네트워크 연결 상태를 확인해보세요. API 키가 없다면 비워두고 '로컬 모드'로도 구동 가능합니다.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Console / Comments Section */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">
            <Info size={12} /> Status Console
          </div>
          <div className="min-h-[80px]">
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
                    {currentPersonality.emoji} "{aiComment}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3">
          {/* UNDO Button */}
          <button 
            onClick={undo}
            disabled={history.length === 0 || loading}
            className={`p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all shadow-sm ${
              history.length === 0 || loading 
                ? 'text-slate-300 dark:text-slate-800 cursor-not-allowed opacity-50' 
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 active:scale-95'
            }`}
            title="한 수 무르기 (Undo)"
          >
            <Undo size={24} />
          </button>

          {/* Rematch / Reset Board Button */}
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

          {/* Reset Stats Button */}
          <button 
            onClick={triggerResetStats}
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

      <ApiSetupModal 
        showApiModal={showApiModal}
        setShowApiModal={setShowApiModal}
        customApiKey={customApiKey}
        setCustomApiKey={setCustomApiKey}
      />

      <HelpModal 
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      <CustomConfirmModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmResetStats}
        title="모든 전적 초기화"
        message="정말로 모든 전적(승/패/무 기록 및 연승 점수, 난이도 단계)을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />
    </div>
  );
}

