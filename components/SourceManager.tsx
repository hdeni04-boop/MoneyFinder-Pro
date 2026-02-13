
import React, { useState } from 'react';
import { Source, CollectorType, Language } from '../types.ts';
import { translations } from '../translations.ts';

interface SourceManagerProps {
  sources: Source[];
  language: Language;
  onAdd: (source: Omit<Source, 'id'>) => void;
  onUpdate: (source: Source) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const SourceManager: React.FC<SourceManagerProps> = ({ sources, language, onAdd, onUpdate, onDelete, onToggleActive }) => {
  const t = translations[language];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: CollectorType.RSS
  });

  const resetForm = () => {
    setFormData({ name: '', url: '', type: CollectorType.RSS });
    setEditingSource(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (source: Source) => {
    setEditingSource(source);
    setFormData({ name: source.name, url: source.url, type: source.type });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSource) {
      onUpdate({ ...editingSource, ...formData });
    } else {
      onAdd({ ...formData, isActive: true });
    }
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t.dataSources}</h2>
        <button 
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          {t.addSource}
        </button>
      </div>

      <div className="grid gap-4">
        {sources.map(source => (
          <div key={source.id} className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-white truncate">{source.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-700 text-slate-300">
                  {source.type}
                </span>
              </div>
              <p className="text-sm text-slate-400 truncate font-mono bg-slate-900/40 p-1 px-2 rounded">{source.url}</p>
              {source.lastRun && (
                <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {t.lastScraped}: {new Date(source.lastRun).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onToggleActive(source.id)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  source.isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                }`}
              >
                {source.isActive ? t.active : t.paused}
              </button>
              
              <button 
                onClick={() => handleOpenEdit(source)}
                className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-all"
                title={t.edit}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              
              <button 
                onClick={() => {
                  if(confirm(t.deleteWarning)) onDelete(source.id);
                }}
                className="p-2 rounded-xl bg-slate-700/50 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 transition-all"
                title={t.delete}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{editingSource ? t.editSource : t.addSource}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.name}</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={t.formNamePlaceholder}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.url}</label>
                <input 
                  required
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder={t.formUrlPlaceholder}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.type}</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as CollectorType})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none"
                >
                  <option value={CollectorType.RSS}>RSS Feed</option>
                  <option value={CollectorType.API}>JSON API</option>
                  <option value={CollectorType.WEB}>Web Scraper</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 bg-slate-800 border border-slate-700 hover:text-white hover:bg-slate-700 transition-all"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  className="flex-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                >
                  {editingSource ? t.save : t.add}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceManager;
