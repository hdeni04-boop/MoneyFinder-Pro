
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

  // Load state from localStorage
  useEffect(() => {
    try {
      const savedSources = localStorage.getItem('mf_sources');
      const savedOpps = localStorage.getItem('mf_opportunities');
      const savedWallet = localStorage.getItem('mf_wallet');
      const savedTxs = localStorage.getItem('mf_transactions');

      if (savedSources) setSources(JSON.parse(savedSources));
      else setSources(INITIAL_SOURCES);
      
      if (savedOpps) setOpportunities(JSON.parse(savedOpps));
      if (savedWallet) setWalletBalance(JSON.parse(savedWallet));
      if (savedTxs) setTransactions(JSON.parse(savedTxs));
    } catch (e) {
      console.error("Failed to load state", e);
      setSources(INITIAL_SOURCES);
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (sources.length > 0) localStorage.setItem('mf_sources', JSON.stringify(sources));
    if (opportunities.length > 0) localStorage.setItem('mf_opportunities', JSON.stringify(opportunities));
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
  }, []);

  const executeOpportunity = (oppId: string) => {
    setOpportunities(prev => prev.map(o => {
      if (o.id === oppId && o.status === 'Open') {
        const earned = o.financialValue * 0.05;
        setWalletBalance(prevBalance => prevBalance + earned);
        
        const tx: Transaction = {
          id: `tx-${Date.now()}`,
          type: 'earning',
          amount: earned,
          status: 'completed',
          timestamp: new Date().toLocaleString()
        };
        setTransactions(prevTxs => [tx, ...prevTxs]);
        addLog(`Alpha realized: +$${earned.toLocaleString()}`, 'success');
        return { ...o, status: 'Executed' };
      }
      return o;
    }));
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
    addLog(`Withdrawal initialized: $${amount.toLocaleString()}`, 'info');
    
    setTimeout(() => {
      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'completed' } : t));
      addLog(`Withdrawal completed!`, 'success');
    }, 4000);
  };

  const runScraper = async () => {
    if (isScraping) return;
    setIsScraping(true);
    addLog(t.scraping, 'info');
    let totalAdded = 0;
    
    try {
      const activeSources = sources.filter(s => s.isActive);
      for (const source of activeSources) {
        addLog(`${t.activePulling}: ${source.name}`, 'info');
        const rawItems = await simulateScraping(source.name);
        if (!rawItems || rawItems.length === 0) continue;

        const scoredItems = await scoreOpportunities(rawItems, source.type, source.name, language);

        const newOpps: Opportunity[] = scoredItems.map((item, idx) => ({
          id: `opt-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
          title: item.title || 'Signal detected',
          description: item.description || '',
          sourceId: source.id,
          sourceName: source.name,
          link: '#',
          score: item.score || 0,
          reasoning: item.reasoning || '',
          timestamp: new Date().toISOString(),
          category: item.category || 'Market',
          type: source.type,
          financialValue: item.financialValue || 0,
          isPremium: (item.score || 0) > 85,
          riskLevel: (item.riskLevel as RiskLevel) || 'Moderate',
          timeHorizon: (item.timeHorizon as any) || 'Short-term',
          status: 'Open'
        }));

        if (newOpps.length > 0) {
          totalAdded += newOpps.length;
          setOpportunities(prev => {
            // Deduplicate by title to prevent spamming
            const existingTitles = new Set(prev.map(o => o.title));
            const filteredNew = newOpps.filter(o => !existingTitles.has(o.title));
            return [...filteredNew, ...prev].slice(0, 500);
          });
        }
      }
      
      if (totalAdded > 0) {
        addLog(`Scan complete. ${totalAdded} signals identified.`, 'success');
        chatBotRef.current?.triggerBriefing(`Market scan complete. Identified ${totalAdded} high-potential business signals.`);
      } else {
        addLog("Scan complete. No new signals detected.", 'info');
      }
    } catch (error) {
      addLog(`System failure: ${error instanceof Error ? error.message : 'Unknown'}`, 'error');
    } finally {
      setIsScraping(false);
    }
  };

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
          totalOpps={opportunities.filter(o => o.status === 'Open').reduce((acc, c) => acc + c.financialValue, 0)}
          language={language}
          opportunities={opportunities}
        />
        
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="text-[11px] text-slate-500 font-black uppercase tracking-widest">
                    {t.showing} <span className="text-indigo-400">{pagedOpportunities.length}</span> {t.of} <span className="text-white">{processedOpportunities.length}</span> {t.results}
                  </div>
                  <select 
                    value={riskFilter} 
                    onChange={(e) => setRiskFilter(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Risks</option>
                    <option value="Low">Low Risk</option>
                    <option value="Moderate">Moderate Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Extreme">Extreme Risk</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsManualModalOpen(true)} className="px-4 py-2 rounded-xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 text-[10px] font-black uppercase">
                    {t.addOpportunity}
                  </button>
                  <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
                    <button onClick={() => setSortBy('date')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${sortBy === 'date' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{t.newest}</button>
                    <button onClick={() => setSortBy('score')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${sortBy === 'score' ? 'bg-amber-500 text-black' : 'text-slate-500'}`}>{t.highestScore}</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {pagedOpportunities.map(opp => (
                  <div key={opp.id} className="relative group">
                    <OpportunityList opportunities={[opp]} language={language} />
                    {opp.status === 'Open' && (
                      <button 
                        onClick={() => executeOpportunity(opp.id)}
                        className="absolute bottom-6 right-20 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase py-2 px-4 rounded-xl shadow-lg transition-all active:scale-95"
                      >
                        {t.markAsCashed}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {visibleCount < processedOpportunities.length && (
                <div className="flex justify-center pt-8">
                  <button onClick={() => setVisibleCount(p => p + ITEMS_PER_PAGE)} className="px-12 py-4 rounded-3xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest">{t.loadMore}</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && <AnalyticsTab opportunities={opportunities} language={language} />}
          {activeTab === 'vault' && <VaultTab language={language} balance={walletBalance} transactions={transactions} onWithdraw={handleWithdraw} />}
          {activeTab === 'sources' && <SourceManager sources={sources} language={language} onAdd={(d) => setSources(prev => [...prev, { ...d, id: Math.random().toString(36).substr(2, 9), isActive: true }])} onUpdate={(u) => setSources(prev => prev.map(s => s.id === u.id ? u : s))} onDelete={(id) => setSources(prev => prev.filter(s => s.id !== id))} onToggleActive={(id) => setSources(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s))} />}
          {activeTab === 'logs' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-8 font-mono text-[11px] h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                {logs.map(log => (
                  <div key={log.id} className="mb-2 flex gap-4">
                    <span className="text-slate-600">[{log.timestamp}]</span>
                    <span className={`font-bold ${log.level === 'error' ? 'text-rose-400' : log.level === 'success' ? 'text-emerald-400' : 'text-sky-400'}`}>{log.level.toUpperCase()}</span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <ScraperPanel isScraping={isScraping} logs={logs.slice(0, 5)} language={language} />
      <ManualOpportunityForm language={language} isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} onAdd={(o) => setOpportunities(p => [o, ...p])} />
      <ChatBot ref={chatBotRef} language={language} opportunities={opportunities} totalROI={opportunities.reduce((acc, c) => acc + c.financialValue, 0)} onExecuteScan={runScraper} onNavigate={(tab) => setActiveTab(tab as any)} onSearch={(q) => setSearchQuery(q)} />
    </div>
  );
};

export default App;
