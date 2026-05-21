import { motion } from 'motion/react';
import { PERSONALITIES } from '../constants';
import { PersonalityId } from '../types';
import { MessageSquare } from 'lucide-react';

interface PersonalitySelectorProps {
  selectedId: PersonalityId;
  onChange: (id: PersonalityId) => void;
}

export function PersonalitySelector({ selectedId, onChange }: PersonalitySelectorProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
        <span className="flex items-center gap-1.5"><MessageSquare size={12} /> AI Personality</span>
        <span>성격 교체 시 리액션이 변합니다</span>
      </div>

      {/* Grid selector */}
      <div className="grid grid-cols-4 gap-2">
        {PERSONALITIES.map((p) => {
          const isSelected = p.id === selectedId;
          return (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(p.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-colors relative outline-none ${
                isSelected
                  ? `${p.color} border-transparent ring-2 ring-indigo-500/20`
                  : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="selected-personality-bg"
                  className="absolute inset-0 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="text-xl mb-1">{p.emoji}</span>
              <span className="text-[10px] font-black uppercase tracking-tight">{p.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Info Description about selected personality */}
      <div className="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-2xl text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed text-center italic border border-slate-100/50 dark:border-slate-800/30">
        "{PERSONALITIES.find((p) => p.id === selectedId)?.description}"
      </div>
    </div>
  );
}
