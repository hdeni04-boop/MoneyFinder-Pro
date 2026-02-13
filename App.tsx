
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Opportunity, Source, ScrapingLog, CollectorType, Language, RiskLevel, Transaction } from './types.ts';
import { INITIAL_SOURCES } from './constants.ts';
import { simulateScraping, scoreOpportunities } from './services/gemini.ts';
import { translations } from './translations.ts';
import Sidebar from './components/Sidebar.tsx';
import OpportunityList from './components/OpportunityList.tsx';
import ScraperPanel from './components/ScraperPanel.tsx';
import Header from './components/Header.tsx';
import SourceManager from './components/SourceManager.tsx';
import ChatBot, { ChatBotHandle } from './components/ChatBot.tsx';
import ManualOpportunityForm from './components/ManualOpportunityForm.tsx';
import AnalyticsTab from './components/AnalyticsTab.tsx';
import VaultTab from './components/VaultTab.tsx';
import LandingPage from './components/LandingPage.tsx';

const ITEMS_PER_PAGE = 12;

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [logs, setLogs] = useState<ScrapingLog[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [activeTab, setActiveTab] = useState<'opportunities' | 'sources' | 'logs' | 'analytics' | 'vault'>('opportunities');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'All'>('All');
  const [language, setLanguage] = useState<Language>('id');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'value'>('date');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const chatBotRef = useRef<ChatBotHandle>(null);
  const t = translations[language];

  useEffect(() => {
    const savedSources = localStorage.getItem('mf_sources');
    const savedOpps = localStorage.getItem('mf_opportunities');
    const savedWallet = localStorage.getItem('mf_wallet');
    const savedTxs = localStorage.getItem('mf_transactions');

    if (savedSources) {
      const parsed: Source[] = JSON.parse(savedSources);
      const existingUrls = new Set(parsed.map(s => s.url));
      const missingSources = INITIAL_SOURCES.filter(s => !existingUrls.has(s.url));
      
      if (missingSources.length > 0) {
        const mergedSources = [...parsed, ...missingSources];
        setSources(mergedSources);
        localStorage.setItem('mf_sources', JSON.stringify(mergedSources));
      } else {
        setSources(parsed);
      }
    } else {
      setSources(INITIAL_SOURCES);
    }
    
    if (savedOpps) setOpportunities(JSON.parse(savedOpps));
    if (savedWallet) setWalletBalance(JSON.parse(savedWallet));
    if (savedTxs) setTransactions(JSON.parse(savedTxs));
  }, []);

  useEffect(() => {
    localStorage.setItem('mf_sources', JSON.stringify(sources));
    localStorage.setItem('mf_opportunities', JSON.stringify(opportunities));
    localStorage.setItem('mf_wallet', JSON.stringify(walletBalance));
    localStorage.setItem('mf_transactions', JSON.stringify(transactions));
  }, [sources, opportunities, walletBalance, transactions]);

  const addLog = useCallback((message: string, level: ScrapingLog['level'] = 'info') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      level
    }, ...prev].slice(0, 100));
  }, [language]);

  const executeOpportunity = (oppId: string) => {
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp || opp.status !== 'Open') return;

    const earned = opp.financialValue * 0.05;
    setWalletBalance(prev => prev + earned);
    setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, status: 'Executed' } : o));
    
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'earning',
      amount: earned,
      status: 'completed',
      timestamp: new Date().toLocaleString()
    };
    setTransactions(prev => [tx, ...prev]);
    addLog(`Realized ${earned.toLocaleString()} USD from signal: ${opp.title}`, 'success');
  };

  const handleWithdraw = (amount: number, method: string) => {
    if (amount > walletBalance) return;
    
    setWalletBalance(prev => prev - amount);
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'payout',
      amount: amount,
      status: 'pending',
      timestamp: new Date().toLocaleString(),
      method
    };
    setTransactions(prev => [tx, ...prev]);
    addLog(`Withdrawal initialized: ${amount.toLocaleString()} USD via ${method}`, 'info');
    
    setTimeout(() => {
      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'completed' } : t));
      addLog(`Payout successful for transaction ${tx.id}`, 'success');
    }, 5000);
  };

  const runScraper = async () => {
    if (isScraping) return;
    setIsScraping(true);
    addLog(t.scraping, 'info');
    let newItemsFound = 0;
    
    try {
      const activeSources = sources.filter(s => s.isActive);
      for (const source of activeSources) {
        addLog(language === 'en' ? `Scanning Feed: ${source.name}...` : `Memindai Feed: ${source.name}...`, 'info');
        
        try {
          const rawItems = await simulateScraping(source.name);
          const scoredItems = await scoreOpportunities(rawItems, source.type, source.name, language);

          const newOpps: Opportunity[] = scoredItems.map((item, idx) => ({
            id: `opt-${Date.now()}-${idx}`,
            title: item.title || 'Untitled',
            description: item.description || '',
            sourceId: source.id,
            sourceName: source.name,
            link: '#',
            score: item.score || 0,
            reasoning: item.reasoning || '',
            timestamp: new Date().toISOString(),
            category: item.category || 'General',
            type: source.type,
            financialValue: item.financialValue || 0,
            isPremium: item.isPremium || false,
            riskLevel: (item.riskLevel as RiskLevel) || 'Moderate',
            timeHorizon: (item.timeHorizon as any) || 'Short-term',
            status: 'Open'
          }));

          newItemsFound += newOpps.length;
          setOpportunities(prev => [...newOpps, ...prev].slice(0, 500));
          setSources(prev => prev.map(s => s.id === source.id ? { ...s, lastRun: new Date().toISOString() } : s));
        } catch (sourceError: any) {
          addLog(`${source.name}: ${sourceError.message}`, 'error');
        }
      }
      
      if (newItemsFound > 0) {
        chatBotRef.current?.triggerBriefing(`I have found ${newItemsFound} new alpha signals. Our potential ROI has increased by $${(newItemsFound * 50000).toLocaleString()}.`);
      }
    } catch (error) {
      addLog(`Global Error: ${error instanceof Error ? error.message : 'Unknown'}`, 'error');
    } finally {
      setIsScraping(false);
    }
  };

  const handleAddManualOpportunity = (newOpp: Opportunity) => {
    setOpportunities(prev => [{...newOpp, status: 'Open'}, ...prev]);
    addLog(language === 'en' ? `Manually added alpha signal: ${newOpp.title}` : `Menambahkan sinyal alpha manual: ${newOpp.title}`, 'success');
  };

  const totalPotentialROI = useMemo(() => {
    return opportunities.filter(o => o.status === 'Open').reduce((acc, curr) => acc + curr.financialValue, 0);
  }, [opportunities]);

  const processedOpportunities = useMemo(() => {
    let filtered = opportunities.filter(o => 
      (o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       o.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
       o.sourceName.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (riskFilter === 'All' || o.riskLevel === riskFilter)
    );
    return filtered.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'value') return b.financialValue - a.financialValue;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [opportunities, searchQuery, sortBy, riskFilter]);

  const pagedOpportunities = processedOpportunities.slice(0, visibleCount);

  if (viewMode === 'landing') {
    return <LandingPage language={language} onEnter={() => setViewMode('dashboard')} setLanguage={setLanguage} />;
  }

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-200 overflow-hidden font-sans relative">
      <Sidebar 
        activeTab={activeTab as any} 
        setActiveTab={setActiveTab as any} 
        isScraping={isScraping}
        onScrapeNow={runScraper}
        language={language}
        setLanguage={setLanguage}
        opportunities={opportunities}
        onExit={() => setViewMode('landing')}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          totalOpps={totalPotentialROI}
          language={language}
          opportunities={opportunities}
        />
        
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#070b14]">
          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="text-[11px] text-slate-500 font-black uppercase tracking-widest">
                    {t.showing} <span className="text-indigo-400 font-black">{pagedOpportunities.length}</span> {t.of} <span className="text-white font-black">{processedOpportunities.length}</span> {t.results}
                  </div>
                  <select 
                    value={riskFilter} 
                    onChange={(e) => setRiskFilter(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="All">All Risks</option>
                    <option value="Low">Low Risk</option>
                    <option value="Moderate">Moderate Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Extreme">Extreme Risk</option>
                  </select>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => setIsManualModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    {t.addOpportunity}
                  </button>
                  
                  <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-2xl border border-slate-800 backdrop-blur-md shadow-inner">
                    <button onClick={() => setSortBy('date')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'date' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{t.newest}</button>
                    <button onClick={() => setSortBy('score')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'score' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}>{t.highestScore}</button>
                    <button onClick={() => setSortBy('value')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'value' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}>{t.potentialValue}</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {pagedOpportunities.map(opp => (
                  <div key={opp.id} className="relative group">
                    <OpportunityList opportunities={[opp]} language={language} />
                    {opp.status === 'Open' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); executeOpportunity(opp.id); }}
                        className="absolute bottom-6 right-20 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase py-2 px-4 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
                      >
                        {t.markAsCashed}
                      </button>
                    )}
                    {opp.status === 'Executed' && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {visibleCount < processedOpportunities.length && (
                <div className="flex justify-center pt-8 pb-12">
                  <button onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)} className="px-12 py-4 rounded-3xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95">{t.loadMore}</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && <AnalyticsTab opportunities={opportunities} language={language} />}
          {activeTab === 'vault' && <VaultTab language={language} balance={walletBalance} transactions={transactions} onWithdraw={handleWithdraw} />}
          {activeTab === 'sources' && <SourceManager sources={sources} language={language} onAdd={(d) => setSources(prev => [...prev, { ...d, id: Math.random().toString(36).substr(2, 9), isActive: true }])} onUpdate={(u) => setSources(prev => prev.map(s => s.id === u.id ? u : s))} onDelete={(id) => setSources(prev => prev.filter(s => s.id !== id))} onToggleActive={(id) => setSources(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s))} />}

          {activeTab === 'logs' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center mb-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                <div className="flex flex-col">
                  <h2 className="text-xl font-black uppercase tracking-widest text-white">{t.systemLogs}</h2>
                </div>
                <button onClick={() => setLogs([])} className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all active:scale-95">{t.clearLogs}</button>
              </div>
              <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-8 font-mono text-[11px] h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar shadow-2xl relative">
                {logs.map(log => (
                  <div key={log.id} className="mb-4 flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-slate-800 group">
                    <span className="text-slate-600 shrink-0 font-bold">[{log.timestamp}]</span>
                    <span className={`font-black shrink-0 uppercase tracking-tighter ${log.level === 'error' ? 'text-rose-400' : log.level === 'success' ? 'text-emerald-400' : 'text-sky-400'}`}>{log.level}</span>
                    <span className="text-slate-300 leading-relaxed">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <ScraperPanel isScraping={isScraping} logs={logs.slice(0, 5)} language={language} />
      <ManualOpportunityForm language={language} isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} onAdd={handleAddManualOpportunity} />
      <ChatBot ref={chatBotRef} language={language} opportunities={opportunities} totalROI={totalPotentialROI} onExecuteScan={runScraper} onNavigate={(tab) => setActiveTab(tab as any)} onSearch={(q) => setSearchQuery(q)} />
    </div>
  );
};

export default App;
