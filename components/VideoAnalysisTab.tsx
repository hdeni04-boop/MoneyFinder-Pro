
import React, { useState, useRef } from 'react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';
import { analyzeVideo } from '../services/gemini.ts';

interface VideoAnalysisTabProps {
  language: Language;
}

const VideoAnalysisTab: React.FC<VideoAnalysisTabProps> = ({ language }) => {
  const t = translations[language];
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setResults(null);
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;
    setIsAnalyzing(true);
    setResults(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(videoFile);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const analysis = await analyzeVideo(base64, videoFile.type, language);
        setResults(analysis);
        setIsAnalyzing(false);
      };
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please ensure the video is under 20MB.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
             <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.8)]"></div>
             {t.uploadVideo}
          </h3>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center p-10 cursor-pointer hover:border-indigo-500/50 transition-all hover:bg-indigo-500/5 group relative overflow-hidden min-h-[300px]`}
          >
            {videoPreview ? (
              <video src={videoPreview} className="absolute inset-0 w-full h-full object-cover opacity-20" muted />
            ) : null}

            <div className="relative z-10 flex flex-col items-center text-center">
              <svg className="w-12 h-12 text-slate-600 group-hover:text-indigo-400 transition-colors mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <p className="text-sm font-black text-white uppercase tracking-widest mb-2">{videoFile ? videoFile.name : t.dropVideo}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{t.videoLimits}</p>
            </div>
            <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>

          <button 
            disabled={!videoFile || isAnalyzing}
            onClick={handleAnalyze}
            className={`mt-6 w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 ${
              isAnalyzing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 active:scale-95'
            }`}
          >
            {isAnalyzing ? (
              <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            )}
            {isAnalyzing ? t.analyzingVideo : t.analyzeVideo}
          </button>
        </div>

        {/* Results Section */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
             <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
             {t.videoAnalysisResults}
          </h3>

          <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2 min-h-[400px]">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t.analyzingVideo}</p>
              </div>
            ) : results ? (
              <div className="space-y-8 animate-in fade-in duration-700">
                <section>
                   <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">{t.mainTopic}</h4>
                   <p className="text-white text-xl font-black leading-tight">{results.mainTopic}</p>
                </section>

                <section>
                   <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">{t.keyTakeaways}</h4>
                   <ul className="space-y-2">
                     {results.keyTakeaways.map((item: string, i: number) => (
                       <li key={i} className="flex gap-3 text-sm text-slate-300">
                         <span className="text-indigo-500 font-black">0{i+1}</span>
                         {item}
                       </li>
                     ))}
                   </ul>
                </section>

                <section>
                   <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">{t.bizOpps}</h4>
                   <div className="grid grid-cols-1 gap-3">
                      {results.identifiedOpportunities.map((opp: string, i: number) => (
                        <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl text-xs text-emerald-100 font-medium">
                           {opp}
                        </div>
                      ))}
                   </div>
                </section>

                <section>
                   <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">{t.riskAssessment}</h4>
                   <p className="text-sm text-slate-400 italic">"{results.riskAssessment}"</p>
                </section>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <svg className="w-16 h-16 text-slate-800 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">No intelligence analyzed yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-indigo-600/5 border border-indigo-600/20 p-6 rounded-2xl">
         <p className="text-xs text-indigo-400 font-bold leading-relaxed flex items-center gap-2">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
           Sentinel Quantum Protocol: Video intelligence is processed via Gemini Pro 3 Vision models for enterprise-grade accuracy.
         </p>
      </div>
    </div>
  );
};

export default VideoAnalysisTab;
