import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Language, Opportunity } from '../types.ts';
import { translations } from '../translations.ts';

interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
  isExecuting?: boolean;
}

export interface ChatBotHandle {
  triggerBriefing: (text: string) => void;
}

interface ChatBotProps {
  language: Language;
  opportunities: Opportunity[];
  totalROI: number;
  onExecuteScan: () => void;
  onNavigate: (tab: 'opportunities' | 'sources' | 'logs' | 'analytics' | 'vault' | 'video') => void;
  onSearch: (query: string) => void;
}

const controlTools: FunctionDeclaration[] = [
  {
    name: 'scan_market',
    description: 'Trigger the market scanning engine to find new alpha signals.',
    parameters: { type: Type.OBJECT, properties: {}, required: [] }
  },
  {
    name: 'navigate_to_tab',
    description: 'Change the current view of the application.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tabName: { 
          type: Type.STRING, 
          enum: ['opportunities', 'sources', 'logs', 'analytics', 'vault', 'video'],
          description: 'The tab to navigate to.' 
        }
      },
      required: ['tabName']
    }
  },
  {
    name: 'filter_search',
    description: 'Search or filter the opportunities list.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'The search term or category to filter by.' }
      },
      required: ['query']
    }
  }
];

const ChatBot = forwardRef<ChatBotHandle, ChatBotProps>(({ 
  language, 
  opportunities, 
  totalROI, 
  onExecuteScan, 
  onNavigate, 
  onSearch 
}, ref) => {
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isEn = language === 'en';

  const SUGGESTED_PROMPTS = isEn ? [
    "How do I withdraw funds?",
    "Analyze current market trends",
    "Scan for new alpha signals",
    "Go to Video Intelligence"
  ] : [
    "Bagaimana cara tarik dana?",
    "Analisa tren pasar saat ini",
    "Pindai sinyal alpha baru",
    "Buka Intelijen Video"
  ];

  useImperativeHandle(ref, () => ({
    triggerBriefing: (text: string) => {
      setIsOpen(true);
      setMessages(prev => [...prev, { role: 'model', text }]);
    }
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const featureMap = `
        APP FEATURES:
        1. Alpha Terminal (opportunities): View and execute signals. Marking a signal as 'Cashed' earns 5% commission.
        2. Market Intel (analytics): View ROI distribution and risk profiles.
        3. Global Vault (vault): Manage balance and payouts via Xendit.
        4. Video Intel (video): Analyze market videos using Gemini Pro.
        5. Feed Sources (sources): Add/Remove data scrapers (RSS, API, Web).
        6. Protocol Logs (logs): System activity monitoring.
      `;

      const currentStats = `
        CURRENT STATUS:
        - Total Opportunities: ${opportunities.length}
        - Total Potential ROI: $${totalROI.toLocaleString()}
      `;

      const systemInstruction = `
        You are "SENTINEL", the Autonomous Chief Strategy Officer for MoneyFinder Pro.
        ${featureMap}
        ${currentStats}
        
        Tone: Professional, precise, elite. Language: ${language === 'id' ? 'Indonesian' : 'English'}.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: controlTools }],
          temperature: 0.7,
        }
      });

      const candidate = response.candidates[0];
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const fc of response.functionCalls) {
          const { name, args } = fc;
          setMessages(prev => [...prev, { role: 'system', text: `[PROTOCOL]: ${name.replace(/_/g, ' ').toUpperCase()}`, isExecuting: true }]);
          await new Promise(r => setTimeout(r, 600));
          if (name === 'scan_market') onExecuteScan();
          if (name === 'navigate_to_tab') onNavigate(args.tabName as any);
          if (name === 'filter_search') onSearch(args.query as string);
        }
        
        const followUp = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: [{ role: 'user', parts: [{ text }] }, { role: 'model', parts: candidate.content.parts }],
          config: { systemInstruction }
        });
        setMessages(prev => [...prev, { role: 'model', text: followUp.text || 'Process initialized.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || 'Communication error.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sentinel connection unstable. Attempting recovery..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-96 h-[600px] bg-[#070b14] border border-indigo-500/30 rounded-[2.5rem] shadow-[0_0_60px_rgba(79,70,229,0.3)] flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-6 backdrop-blur-3xl ring-1 ring-white/5">
          <div className="p-5 bg-gradient-to-r from-indigo-600 to-indigo-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></div>
              </div>
              <div>
                <span className="font-black text-white text-xs uppercase tracking-[0.2em] block leading-tight">Sentinel CSO</span>
                <span className="text-[8px] text-indigo-200 font-bold uppercase tracking-widest">Protocol Version 3.1</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
                <div className="w-20 h-20 border-2 border-dashed border-indigo-500/30 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full animate-pulse"></div>
                </div>
                <div>
                   <p className="text-xs text-indigo-400 font-black uppercase tracking-[0.2em]">{isEn ? 'System Idle' : 'Sistem Siaga'}</p>
                   <p className="text-[10px] text-slate-500 mt-2 font-medium">{isEn ? 'Ask me about market trends or navigate the terminal.' : 'Tanya saya tentang tren pasar atau navigasi terminal.'}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-2 w-full pt-4">
                  {SUGGESTED_PROMPTS.map(p => (
                    <button 
                      key={p} 
                      onClick={() => sendMessage(p)}
                      className="text-left p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[90%] p-4 rounded-[1.5rem] text-xs leading-relaxed shadow-lg ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : m.role === 'system' 
                      ? 'bg-slate-800/40 text-indigo-400 border border-indigo-500/20 italic font-mono text-[10px]' 
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-wrap'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl rounded-tl-none flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }} className="p-5 bg-slate-950 border-t border-slate-800/50 flex gap-3">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder={isEn ? "Command Sentinel..." : "Perintah Sentinel..."} 
              className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all font-mono" 
            />
            <button 
              type="submit" 
              disabled={isTyping || !inputValue.trim()} 
              className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-indigo-500 disabled:opacity-30 transition-all shadow-xl shadow-indigo-600/20 active:scale-90"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1 active:scale-95 group relative ${
          isOpen ? 'bg-slate-900 text-white border border-indigo-500/50' : 'bg-indigo-600 text-white hover:bg-indigo-500'
        }`}
      >
        {isOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 scale-150"></div>
            <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        )}
        {!isOpen && (
           <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
        )}
      </button>
    </div>
  );
});

export default ChatBot;