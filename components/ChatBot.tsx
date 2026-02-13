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

// Gunakan tipe yang sama dengan App Tab
type AppTab = 'opportunities' | 'sources' | 'logs' | 'analytics' | 'vault' | 'video';

interface ChatBotProps {
  language: Language;
  opportunities: Opportunity[];
  totalROI: number;
  onExecuteScan: () => void;
  onNavigate: (tab: AppTab) => void;
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
    "Scan for new alpha signals",
    "Go to Analytics",
    "How do I withdraw?",
    "Go to Video Intelligence"
  ] : [
    "Pindai sinyal alpha baru",
    "Buka Intel Pasar",
    "Bagaimana cara tarik dana?",
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
        1. Alpha Terminal (opportunities)
        2. Market Intel (analytics)
        3. Global Vault (vault)
        4. Video Intel (video)
        5. Feed Sources (sources)
        6. Protocol Logs (logs)
      `;

      const systemInstruction = `
        You are "SENTINEL", the CSO for MoneyFinder Pro.
        Available Features: ${featureMap}
        Current Opportunities: ${opportunities.length}, Total ROI: $${totalROI.toLocaleString()}
        Language: ${language === 'id' ? 'Indonesian' : 'English'}.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: controlTools }],
          temperature: 0.7,
        }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const fc of response.functionCalls) {
          const { name, args } = fc;
          setMessages(prev => [...prev, { role: 'system', text: `[SYSTEM]: Executing ${name.replace(/_/g, ' ').toUpperCase()}`, isExecuting: true }]);
          if (name === 'scan_market') onExecuteScan();
          if (name === 'navigate_to_tab') onNavigate(args.tabName as AppTab);
          if (name === 'filter_search') onSearch(args.query as string);
        }
        
        const followUp = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ role: 'user', parts: [{ text }] }],
          config: { systemInstruction }
        });
        setMessages(prev => [...prev, { role: 'model', text: followUp.text || 'Process initialized.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || 'Connection stable.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sentinel connection error. Please retry." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-96 h-[550px] bg-[#070b14] border border-indigo-500/30 rounded-[2rem] shadow-2xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-6 backdrop-blur-3xl">
          <div className="p-4 bg-indigo-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-black text-white text-xs uppercase tracking-widest">Sentinel CSO</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isEn ? 'Waiting for command...' : 'Menunggu perintah...'}</p>
                <div className="grid grid-cols-1 gap-2 w-full">
                  {SUGGESTED_PROMPTS.map(p => (
                    <button key={p} onClick={() => sendMessage(p)} className="text-left p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white transition-all">{p}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed ${
                  m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none flex gap-1">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }} className="p-4 bg-slate-950 border-t border-slate-800/50 flex gap-2">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder="..." 
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-600" 
            />
            <button type="submit" disabled={isTyping || !inputValue.trim()} className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </button>
          </form>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all active:scale-95">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </button>
    </div>
  );
});

export default ChatBot;