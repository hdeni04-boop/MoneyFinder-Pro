
import React from 'react';
import { Opportunity, Language } from '../types';
import { translations } from '../translations';

interface AnalyticsTabProps {
  opportunities: Opportunity[];
  language: Language;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ opportunities, language }) => {
  const t = translations[language];

  const categoryROI = opportunities.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.financialValue;
    return acc;
  }, {} as Record<string, number>);

  // Fix: Explicitly cast entries to [string, number][] to ensure arithmetic operations like b[1] - a[1] are valid.
  const sortedCategories = (Object.entries(categoryROI) as [string, number][]).sort((a, b) => b[1] - a[1]);
  // Fix: Explicitly cast values to number[] to ensure they can be spread into Math.max as numbers.
  const maxROI = Math.max(...(Object.values(categoryROI) as number[]), 1);

  const scoreBuckets = [0, 20, 40, 60, 80, 100];
  const distribution = scoreBuckets.slice(0, -1).map((min, i) => {
    const max = scoreBuckets[i + 1];
    const count = opportunities.filter(o => o.score >= min && o.score < max).length;
    return { range: `${min}-${max}`, count };
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, notation: 'compact' }).format(val);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ROI BY CATEGORY */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-md shadow-2xl">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
             <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.8)]"></div>
             {t.roiByCategory}
          </h3>
          <div className="space-y-6">
            {sortedCategories.map(([cat, val]) => (
              <div key={cat} className="space-y-2">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                   <span className="text-slate-300">{cat}</span>
                   <span className="text-emerald-400">{formatCurrency(val)}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000" 
                    // Fix: Arithmetic operations now use typed number values from sortedCategories and maxROI.
                    style={{ width: `${(val / maxROI) * 100}%` }}
                   ></div>
                </div>
              </div>
            ))}
            {sortedCategories.length === 0 && <p className="text-xs text-slate-600 italic">No data detected in terminal...</p>}
          </div>
        </div>

        {/* ALPHA DISTRIBUTION */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-md shadow-2xl">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
             <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
             {t.alphaDistribution}
          </h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {distribution.map((d, i) => {
              const height = opportunities.length > 0 ? (d.count / opportunities.length) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div 
                    className="w-full bg-indigo-600/20 border border-indigo-500/30 rounded-t-xl relative group transition-all hover:bg-indigo-600/40"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  >
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[10px] px-2 py-1 rounded border border-slate-700 font-bold whitespace-nowrap">
                        {d.count} Signals
                     </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{d.range}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* STRATEGIC KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl text-center group hover:border-indigo-500/50 transition-colors">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Risk Profile</p>
            <p className="text-xl font-black text-indigo-400">BALANCED</p>
         </div>
         <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl text-center group hover:border-indigo-500/50 transition-colors">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Signal Quality</p>
            <p className="text-xl font-black text-emerald-400">PRIME</p>
         </div>
         <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl text-center group hover:border-indigo-500/50 transition-colors">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Time Velocity</p>
            <p className="text-xl font-black text-amber-400">URGENT</p>
         </div>
         <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl text-center group hover:border-indigo-500/50 transition-colors">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Engine Health</p>
            <p className="text-xl font-black text-sky-400">OPTIMAL</p>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
