
import React, { useState } from 'react';
import { Language, Opportunity } from '../types.ts';
import { translations } from '../translations.ts';
import { GoogleGenAI } from "@google/genai";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalOpps: number; 
  language: Language;
  opportunities: Opportunity[];
}

const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery, totalOpps, language, opportunities }) => {
  const t = translations[language];
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const getAIInsight = async () => {
    if (isAnalysing) return;
    setIsAnalysing(true);
    setInsight(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const top3 = opportunities.sort((a, b) => b.score - a.score).slice(0, 3);
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analisa 3 peluang teratas ini secara singkat (maks 50 kata) and berikan 1 instruksi eksekusi paling cuan dalam ${language === 'id' ? 'Bahasa Indonesia' : 'English'}:
        ${top3.map(o => `- ${o.title} ($${o.financialValue.toLocaleString()})`).join('\n')}`,
      });
      
      setInsight(response.text || "Insight unavailable at this moment.");
    } catch (error) {
      setInsight("Error connecting to intelligence engine.");
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <header className="h-24 border-b border-slate-800/50 px-8 flex items-center justify-between bg-[#070b14]/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.filterPlaceholder}
          className="block w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800/80 rounded-2xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-inner"
        />
      </div>

      <div className="flex-1 px-8 hidden xl:block">
        <div className={`p-3 rounded-2xl border transition-all flex items-center gap-3 h-14 ${insight ? 'bg-indigo-600/10 border-indigo-600/30' : 'bg-slate-900/40 border-slate-800'}`}>
           <button 
             onClick={getAIInsight}
             disabled={isAnalysing || opportunities.length === 0}
             className={`shrink-0 p-2 rounded-xl transition-all ${isAnalysing ? 'bg-amber-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'}`}
           >
             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           </button>
           <div className="flex-1 overflow-hidden">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.aiInsight}</p>
              <p className="text-[10px] text-slate-300 truncate italic">
                {isAnalysing ? t.aiAnalysing : (insight || "Click the bolt for real-time strategic analysis...")}
              </p>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{t.globalDiscovery}</span>
          <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
            {formatCurrency(totalOpps)}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="flex flex-col items-end">
              <span className="text-xs font-black text-white">ALPHA_USER_01</span>
              <span className="text-[10px] font-bold text-amber-500">PRO TERMINAL</span>
            </div>
            <div className="h-12 w-12 rounded-2xl overflow-hidden border-2 border-amber-500/30 p-0.5">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover rounded-xl bg-slate-800" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
