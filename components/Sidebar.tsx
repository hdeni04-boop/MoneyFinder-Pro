
import React from 'react';
import { Language, Opportunity } from '../types.ts';
import { translations } from '../translations.ts';

interface SidebarProps {
  activeTab: 'opportunities' | 'sources' | 'logs' | 'analytics' | 'vault';
  setActiveTab: (tab: 'opportunities' | 'sources' | 'logs' | 'analytics' | 'vault') => void;
  isScraping: boolean;
  onScrapeNow: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  opportunities: Opportunity[];
  onExit: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isScraping, onScrapeNow, language, setLanguage, opportunities, onExit }) => {
  const t = translations[language];

  const totalValue = opportunities.reduce((acc, curr) => acc + curr.financialValue, 0);
  const potentialCommission = totalValue * 0.05;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="w-64 bg-[#0a0f1c] border-r border-slate-800 flex flex-col p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>

      <div className="flex items-center justify-between mb-10 px-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            M
          </div>
          <h1 className="text-xl font-black tracking-tight text-white uppercase italic">Finder<span className="text-indigo-500">.exe</span></h1>
        </div>
        <button 
          onClick={onExit}
          className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-slate-800 transition-all"
          title="Exit Portal"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
        <button 
          onClick={() => setActiveTab('opportunities')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'opportunities' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          {t.opportunities}
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          {t.analytics}
        </button>
        <button 
          onClick={() => setActiveTab('vault')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'vault' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          {t.vault}
        </button>
        <button 
          onClick={() => setActiveTab('sources')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'sources' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          {t.dataSources}
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {t.systemLogs}
        </button>

        <div className="pt-8 space-y-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4">{t.monetizationTitle}</p>
          <div className="mx-2 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl shadow-inner group transition-all hover:bg-emerald-500/10">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">{t.estCommission}</p>
            <p className="text-xl font-black text-emerald-400">{formatCurrency(potentialCommission)}</p>
          </div>
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800 space-y-4 relative z-10">
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setLanguage('en')}
            className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('id')}
            className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${language === 'id' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            ID
          </button>
        </div>

        <button 
          disabled={isScraping}
          onClick={onScrapeNow}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
            isScraping 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95'
          }`}
        >
          {isScraping ? (
            <div className="flex gap-1">
               <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
               <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {isScraping ? t.scraping : t.scrapeNow}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
