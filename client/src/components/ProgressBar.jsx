import React from 'react';
import { Sparkles, CheckCircle2 } from './Icons';

export const ProgressBar = ({ percent = 0, showLabel = true, size = 'md', className = '' }) => {
  const clamped = Math.min(100, Math.max(0, percent));

  const heights = {
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5',
  };

  const getGradient = () => {
    if (clamped === 100) return 'from-emerald-400 to-green-500';
    if (clamped > 50) return 'from-amber-400 to-kid-orange';
    return 'from-sky-400 to-brand-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1">
            {clamped === 100 ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed!
              </span>
            ) : (
              <span>Reading Progress</span>
            )}
          </span>
          <span className="font-extrabold text-slate-700">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200/80 rounded-full overflow-hidden shadow-inner ${heights[size] || heights.md}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out ${getGradient()}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
