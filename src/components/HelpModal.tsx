import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Key, MessageSquare, Info } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          {/* Backdrop Click */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 z-10 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-lg">
                  <Info size={16} />
                </div>
                <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">
                  게임 안내 및 규칙
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-600 dark:text-slate-300">
              {/* 1. Basic Rules */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  <Trophy size={14} /> 기본 틱택토 규칙
                </div>
                <p className="text-xs leading-relaxed">
                  가로, 세로, 대각선 중 먼저 <span className="font-bold text-slate-800 dark:text-white">3개의 돌(X)</span>을 일렬로 놓으면 승리합니다. 승리 시 연승 트래커가 채워집니다.
                </p>
              </div>

              {/* 2. Auto Difficulty */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                  <Trophy size={14} /> 자동 난이도 승강제 (Auto-Difficulty)
                </div>
                <div className="bg-amber-50/50 dark:bg-amber-950/10 p-3 rounded-2xl border border-amber-100/50 dark:border-amber-900/20 text-[11px] leading-relaxed">
                  이 게임은 플레이어의 실력에 반응합니다.
                  <ul className="list-disc pl-4 mt-1.5 space-y-1">
                    <li><span className="font-bold text-emerald-600">플레이어 승리 시:</span> 난이도가 한 단계 상승합니다.</li>
                    <li><span className="font-bold text-rose-600">플레이어 패배 시:</span> 난이도가 한 단계 하락하고 연승 게이지가 초기화됩니다.</li>
                  </ul>
                  최종 단계인 <span className="font-bold text-purple-600">"무자비(Smartness 100%)"</span> AI의 벽을 무너뜨려 보세요!
                </div>
              </div>

              {/* 3. API Key setup */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                  <Key size={14} /> Gemini API 키 등록 권장
                </div>
                <p className="text-xs leading-relaxed">
                  개인 <span className="font-bold text-slate-800 dark:text-white">Gemini API Key</span>를 등록하시면, Gemini 2.0 Flash 모델의 고급 추론 능력이 적용되어 한층 더 스마트하고 예측 불가한 틱택토 게임을 즐기실 수 있습니다. (sessionStorage에 안전하게 저장됩니다.)
                </p>
              </div>

              {/* 4. AI Personalities */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                  <MessageSquare size={14} /> AI 성격 및 실시간 코멘트
                </div>
                <p className="text-xs leading-relaxed">
                  헤더 아래에서 원하는 **AI 성격**을 지정할 수 있습니다. 성격 변경 시, Gemini AI가 사용자의 수에 맞춰 실시간으로 대답하는 말투와 리액션(티키타카)이 변화합니다.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                  <div className="p-2 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <span className="font-bold text-indigo-500">🤖 표준 AI:</span> 차분하고 객관적인 대국 해설
                  </div>
                  <div className="p-2 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <span className="font-bold text-rose-500">😒 츤데레 AI:</span> 매운맛 잔소리와 부끄러운 리액션
                  </div>
                  <div className="p-2 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <span className="font-bold text-amber-500">🤩 칭찬봇 AI:</span> 모든 선택에 기립박수와 과장 칭찬
                  </div>
                  <div className="p-2 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <span className="font-bold text-slate-500">🧙 바둑 기사:</span> 심오한 인생의 이치를 담은 철학 해설
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-[0.98]"
              >
                이해했습니다
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
