import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ApiSetupModalProps {
  showApiModal: boolean;
  setShowApiModal: (show: boolean) => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
}

export function ApiSetupModal({ 
  showApiModal, 
  setShowApiModal, 
  customApiKey, 
  setCustomApiKey 
}: ApiSetupModalProps) {
  return (
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
  );
}
