
import React from 'react';
import { ScrapingLog, Language } from '../types';
import { translations } from '../translations';

interface ScraperPanelProps {
  isScraping: boolean;
  logs: ScrapingLog[];
  language: Language;
}

const ScraperPanel: React.FC<ScraperPanelProps> = ({ isScraping, logs, language }) => {
  const t = translations[language];

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 hidden 2xl:flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center justify-between">
          {t.runtime}
          {isScraping && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>}
        </h2>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${isScraping ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-800 text-slate-600'}`}>
              <svg className={`w-6 h-6 ${isScraping ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{t.collectorMode}</p>
              <p className="text-xs text-slate-500 mt-1">{isScraping ? t.activePulling : t.waiting}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">{t.dbConn}</p>
                <div className="flex items-center gap-2">
                   <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[94%]"></div>
                   </div>
                   <span className="text-[10px] font-bold text-emerald-400">94%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">SQLite: {t.online} | Port: 5000</p>
             </div>
             <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col min-h-0">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase mb-4">{t.recentActivity}</h3>
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
          {logs.map((log) => (
            <div key={log.id} className="text-xs border-l-2 border-slate-700 pl-3 py-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold ${
                  log.level === 'success' ? 'text-emerald-400' : 
                  log.level === 'error' ? 'text-rose-400' : 'text-indigo-400'
                }`}>
                  {log.level.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-600 font-medium">{log.timestamp}</span>
              </div>
              <p className="text-slate-400 leading-snug">{log.message}</p>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-xs text-slate-600 italic">{t.standby}</p>
          )}
        </div>
      </div>

      <div className="p-6 mt-auto">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl border border-slate-700">
          <p className="text-xs text-slate-400 font-medium mb-3">{t.sysHealth}</p>
          <div className="flex gap-1 items-end h-8">
            {[4,7,5,9,11,8,12,6,10,14,13,15].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-indigo-500/30 rounded-t-sm" 
                style={{ height: `${h * 5}%` }}
              ></div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-center uppercase tracking-tighter">{t.memIndex}</p>
        </div>
      </div>
    </div>
  );
};

export default ScraperPanel;
