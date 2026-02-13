import React, { useState } from 'react';
import { Opportunity, CollectorType, Language, RiskLevel, TimeHorizon } from '../types';
import { translations } from '../translations';

interface ManualOpportunityFormProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (opportunity: Opportunity) => void;
}

const ManualOpportunityForm: React.FC<ManualOpportunityFormProps> = ({ language, isOpen, onClose, onAdd }) => {
  const t = translations[language];
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sourceName: '',
    category: '',
    score: 50,
    financialValue: 0,
    reasoning: '',
    link: '',
    riskLevel: 'Moderate' as RiskLevel,
    timeHorizon: 'Short-term' as TimeHorizon
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Added 'status' property to satisfy the Opportunity interface requirement
    const newOpp: Opportunity = {
      ...formData,
      id: `manual-${Date.now()}`,
      sourceId: 'manual',
      timestamp: new Date().toISOString(),
      type: CollectorType.WEB,
      isPremium: formData.score > 85,
      status: 'Open'
    };
    onAdd(newOpp);
    onClose();
    setFormData({
      title: '',
      description: '',
      sourceName: '',
      category: '',
      score: 50,
      financialValue: 0,
      reasoning: '',
      link: '',
      riskLevel: 'Moderate',
      timeHorizon: 'Short-term'
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#070b14]/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">{t.manualEntry}</h3>
            <p className="text-xs text-slate-500 font-medium">Inject new intelligence signal directly into terminal.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.name}</label>
              <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="High Potential Alpha Title" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
              <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Detailed signal intelligence..." className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Source Info</label>
              <input required type="text" value={formData.sourceName} onChange={(e) => setFormData({...formData, sourceName: e.target.value})} placeholder="e.g. Secret Intel" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Category</label>
              <input required type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder={t.categoryPlaceholder} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Risk Level</label>
              <select value={formData.riskLevel} onChange={(e) => setFormData({...formData, riskLevel: e.target.value as RiskLevel})} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all">
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Time Horizon</label>
              <select value={formData.timeHorizon} onChange={(e) => setFormData({...formData, timeHorizon: e.target.value as TimeHorizon})} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all">
                <option value="Immediate">Immediate</option>
                <option value="Short-term">Short-term</option>
                <option value="Mid-term">Mid-term</option>
                <option value="Long-term">Long-term</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.oppScore}</label>
              <div className="flex items-center gap-4">
                <input type="range" min="0" max="100" value={formData.score} onChange={(e) => setFormData({...formData, score: parseInt(e.target.value)})} className="flex-1 accent-indigo-600" />
                <span className={`text-lg font-black w-10 text-center ${formData.score > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{formData.score}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.potentialValue} (USD)</label>
              <input required type="number" value={formData.financialValue} onChange={(e) => setFormData({...formData, financialValue: parseInt(e.target.value) || 0})} placeholder={t.valuePlaceholder} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.geminiReasoning}</label>
              <textarea required rows={2} value={formData.reasoning} onChange={(e) => setFormData({...formData, reasoning: e.target.value})} placeholder={t.reasoningPlaceholder} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-500 bg-slate-800 border border-slate-700 hover:text-white hover:bg-slate-700 transition-all active:scale-95">{t.cancel}</button>
            <button type="submit" className="flex-[2] px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">Add Signal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualOpportunityForm;