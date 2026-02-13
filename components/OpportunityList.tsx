
import React, { useState } from 'react';
import { Opportunity, Language } from '../types.ts';
import { translations } from '../translations.ts';

interface OpportunityListProps {
  opportunities: Opportunity[];
  language: Language;
}

const OpportunityList: React.FC<OpportunityListProps> = ({ opportunities, language }) => {
  const t = translations[language];
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'Low': return 'text-emerald-400 bg-emerald-400/10';
      case 'Moderate': return 'text-sky-400 bg-sky-400/10';
      case 'High': return 'text-amber-400 bg-amber-400/10';
      case 'Extreme': return 'text-rose-400 bg-rose-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
           <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-400">{t.noOppsFound}</h3>
        <p className="text-slate-500 mt-2">{t.noOppsSub}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {opportunities.map((opp) => (
          <div 
            key={opp.id} 
            onClick={() => setSelectedOpp(opp)}
            className={`group cursor-pointer bg-slate-900/40 hover:bg-slate-800/60 border ${opp.isPremium ? 'border-amber-500/30 hover:border-amber-500' : 'border-slate-800 hover:border-indigo-500/50'} rounded-3xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] flex flex-col h-full relative overflow-hidden`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${opp.isPremium ? 'bg-amber-500 text-black' : 'bg-indigo-600 text-white'}`}>
                {opp.category}
              </span>
              <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${getRiskColor(opp.riskLevel)}`}>
                {opp.riskLevel} RISK
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-4 leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2 min-h-[3rem]">
              {opp.title}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/30">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.potentialValue}</p>
                <p className="text-sm font-black text-emerald-400">{formatCurrency(opp.financialValue)}</p>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/30">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.timeHorizon}</p>
                <p className="text-sm font-black text-indigo-400">{opp.timeHorizon}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[24px] font-black text-indigo-500 shadow-inner">
                   {opp.score}
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-300">{opp.sourceName}</span>
                   <span className="text-[8px] text-slate-600 uppercase font-black">{new Date(opp.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-600 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </div>
        ))}
      </div>

      {selectedOpp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#070b14]/95 backdrop-blur-2xl">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className={`relative h-48 ${selectedOpp.isPremium ? 'bg-gradient-to-br from-amber-600/20 via-slate-900 to-slate-900' : 'bg-gradient-to-br from-indigo-600/20 via-slate-900 to-slate-900'} p-8 flex flex-col justify-end border-b border-slate-800`}>
              <button 
                onClick={() => setSelectedOpp(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="flex flex-col">
                <div className="flex gap-2 mb-3">
                   <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white">{selectedOpp.category}</span>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getRiskColor(selectedOpp.riskLevel)}`}>{selectedOpp.riskLevel} RISK</span>
                </div>
                <h2 className="text-3xl font-black text-white leading-tight">{selectedOpp.title}</h2>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.oppScore}</p>
                  <p className={`text-2xl font-black ${selectedOpp.score > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{selectedOpp.score}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.potentialValue}</p>
                  <p className="text-2xl font-black text-emerald-400">{formatCurrency(selectedOpp.financialValue)}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.timeHorizon}</p>
                  <p className="text-lg font-black text-indigo-400 mt-1">{selectedOpp.timeHorizon}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                   {t.geminiReasoning}
                </h4>
                <p className="text-slate-300 italic text-lg leading-relaxed bg-slate-900/50 p-6 rounded-2xl border border-slate-800">"{selectedOpp.reasoning}"</p>
              </div>

              <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
                <button onClick={() => setSelectedOpp(null)} className="px-6 py-3 rounded-xl text-slate-400 font-bold hover:text-white transition-all uppercase text-[11px] tracking-widest">CLOSE</button>
                <button className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all uppercase text-[11px] tracking-widest">PROCEED TO SIGNAL</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityList;
