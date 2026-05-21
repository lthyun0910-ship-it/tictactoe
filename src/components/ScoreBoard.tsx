import { Score } from '../types';

interface ScoreBoardProps {
  score: Score;
}

export function ScoreBoard({ score }: ScoreBoardProps) {
  return (
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
  );
}
