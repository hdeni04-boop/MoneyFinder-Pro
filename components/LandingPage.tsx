
import React from 'react';
import { Language } from '../types.ts';

interface LandingPageProps {
  language: Language;
  onEnter: () => void;
  setLanguage: (lang: Language) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ language, onEnter, setLanguage }) => {
  const isEn = language === 'en';

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Official Navigation */}
      <nav className="h-20 border-b border-slate-800/50 px-8 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#070b14]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            M
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">MoneyFinder<span className="text-indigo-500">.Pro</span></span>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">{isEn ? 'Intelligence' : 'Intelijen'}</a>
          <a href="#security" className="hover:text-white transition-colors">{isEn ? 'Security' : 'Keamanan'}</a>
          <a href="#pricing" className="hover:text-white transition-colors">{isEn ? 'Pricing' : 'Harga'}</a>
          <a href="#network" className="hover:text-white transition-colors">{isEn ? 'Network' : 'Jaringan'}</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-[10px] font-black rounded-lg ${isEn ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>EN</button>
            <button onClick={() => setLanguage('id')} className={`px-3 py-1 text-[10px] font-black rounded-lg ${!isEn ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>ID</button>
          </div>
          <button 
            onClick={onEnter}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            {isEn ? 'Enter Terminal' : 'Masuk Terminal'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="relative pt-32 pb-24 px-8 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full opacity-20 pointer-events-none">
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-indigo-600 rounded-full blur-[150px]"></div>
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-600 rounded-full blur-[150px]"></div>
          </div>

          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
              {isEn ? 'Official Enterprise Hub v3.0' : 'Hub Perusahaan Resmi v3.0'}
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
              {isEn ? 'The Future of' : 'Masa Depan'}
              <br />
              <span className="text-indigo-500">{isEn ? 'Wealth Intelligence' : 'Intelijen Kekayaan'}</span>
            </h1>

            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
              {isEn 
                ? 'Join 50,000+ professionals using the industry-standard for real-time market alpha discovery. Secure, autonomous, and powered by Quantum AI.' 
                : 'Bergabunglah dengan 50.000+ profesional yang menggunakan standar industri untuk penemuan alpha pasar real-time. Aman, otonom, dan ditenagai oleh AI Quantum.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
              <button 
                onClick={onEnter}
                className="w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all hover:-translate-y-1 active:scale-95"
              >
                {isEn ? 'Launch Alpha Terminal' : 'Luncurkan Terminal Alpha'}
              </button>
              <button className="w-full sm:w-auto px-12 py-5 bg-slate-900 border border-slate-800 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-slate-800 transition-all active:scale-95">
                {isEn ? 'Request Demo' : 'Minta Demo'}
              </button>
            </div>
            
            <div className="pt-16 flex items-center justify-center gap-12 grayscale opacity-40">
               <img src="https://upload.wikimedia.org/wikipedia/commons/5/5a/Forbes_logo.svg" className="h-6" alt="Forbes" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" className="h-6" alt="Amazon" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="h-6" alt="Google" />
            </div>
          </div>
        </section>

        {/* Intelligence Features */}
        <section id="features" className="px-8 py-32 bg-slate-900/10 border-y border-slate-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
               <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-4">{isEn ? 'Core Technology' : 'Teknologi Inti'}</h2>
               <p className="text-3xl md:text-5xl font-black tracking-tighter text-white">{isEn ? 'Intelligence Beyond Human Limits' : 'Intelijen Melampaui Batas Manusia'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-6 group">
                <div className="w-16 h-16 rounded-[2rem] bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{isEn ? 'Quantum Analysis' : 'Analisa Quantum'}</h3>
                <p className="text-slate-500 text-base leading-relaxed">{isEn ? 'Utilizing Gemini 3.0 Pro neural architectures to parse global data feeds in milliseconds, identifying patterns invisible to standard scanners.' : 'Memanfaatkan arsitektur neural Gemini 3.0 Pro untuk mengurai feed data global dalam milidetik, mengidentifikasi pola yang tak terlihat pemindai standar.'}</p>
              </div>
              <div className="space-y-6 group">
                <div className="w-16 h-16 rounded-[2rem] bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{isEn ? 'Global Settlement' : 'Penyelesaian Global'}</h3>
                <p className="text-slate-500 text-base leading-relaxed">{isEn ? 'Enterprise-grade liquidity bridges. Instant withdrawals to Global Banks, E-Wallets (DANA/OVO), and physical Retail Points.' : 'Jembatan likuiditas kelas perusahaan. Penarikan instan ke Bank Global, E-Wallet (DANA/OVO), dan Poin Ritel fisik.'}</p>
              </div>
              <div className="space-y-6 group">
                <div className="w-16 h-16 rounded-[2rem] bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-500 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 6.247a11.955 11.955 0 003.858 18.255 12.015 12.015 0 0013.929 0 11.955 11.955 0 003.858-18.255l-1.109-.123z" /></svg>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{isEn ? 'Secure Custody' : 'Penyimpanan Aman'}</h3>
                <p className="text-slate-500 text-base leading-relaxed">{isEn ? 'Military-grade encryption for all data points. Your intellectual alpha is protected by hardware-level security protocols.' : 'Enkripsi kelas militer untuk semua poin data. Alpha intelektual Anda dilindungi oleh protokol keamanan tingkat hardware.'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Compliance Section */}
        <section id="security" className="py-32 px-8">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
             <div className="flex-1 space-y-8">
                <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">{isEn ? 'Compliance Framework' : 'Kerangka Kepatuhan'}</h2>
                <h3 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-none">{isEn ? 'Trusted by Institutional Investors' : 'Dipercaya oleh Investor Institusi'}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{isEn ? 'Our platform adheres to rigorous international standards for data privacy and financial security. We utilize end-to-end encryption for all API interactions and identity verification.' : 'Platform kami mematuhi standar internasional yang ketat untuk privasi data dan keamanan finansial. Kami menggunakan enkripsi end-to-end untuk semua interaksi API dan verifikasi identitas.'}</p>
                <div className="grid grid-cols-2 gap-6 pt-4">
                   <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
                      <p className="text-2xl font-black text-white">SOC2</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Compliance Ready</p>
                   </div>
                   <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
                      <p className="text-2xl font-black text-white">GDPR</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Data Privacy</p>
                   </div>
                </div>
             </div>
             <div className="flex-1 relative">
                <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full"></div>
                <div className="relative bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 6.247a11.955 11.955 0 003.858 18.255 12.015 12.015 0 0013.929 0 11.955 11.955 0 003.858-18.255l-1.109-.123z" /></svg>
                      </div>
                      <div>
                         <p className="text-sm font-black uppercase text-white tracking-widest">{isEn ? 'Security Status' : 'Status Keamanan'}</p>
                         <p className="text-xs text-emerald-500 font-bold">{isEn ? 'All Systems Nominal' : 'Semua Sistem Normal'}</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[98%]"></div></div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                         <span>{isEn ? 'Encryption Level' : 'Level Enkripsi'}</span>
                         <span>AES-256 Bit</span>
                      </div>
                   </div>
                   <div className="mt-12 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50 italic text-slate-400 text-sm">
                      "{isEn ? 'The most secure alpha hunting tool I have ever used in my 15 years on Wall Street.' : 'Alat berburu alpha paling aman yang pernah saya gunakan selama 15 tahun di Wall Street.'}"
                      <p className="mt-4 text-white font-black not-italic text-xs">— Sarah J., Senior Portfolio Manager</p>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section id="pricing" className="py-32 px-8 bg-[#090e1a]">
           <div className="max-w-6xl mx-auto text-center space-y-16">
              <div className="space-y-4">
                 <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em]">{isEn ? 'Pricing Plans' : 'Paket Harga'}</h2>
                 <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white">{isEn ? 'Flexible Access for Every Professional' : 'Akses Fleksibel untuk Setiap Profesional'}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {['Starter', 'Professional', 'Enterprise'].map((tier, idx) => (
                    <div key={tier} className={`p-10 rounded-[2.5rem] border flex flex-col items-start text-left transition-all hover:-translate-y-2 ${idx === 1 ? 'bg-slate-900 border-indigo-600 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)]' : 'bg-slate-900/40 border-slate-800'}`}>
                       <h4 className="text-xl font-black uppercase tracking-tight text-white mb-2">{tier}</h4>
                       <div className="flex items-baseline gap-1 mb-6">
                          <span className="text-4xl font-black text-white">${[0, 199, 999][idx]}</span>
                          <span className="text-sm font-bold text-slate-500 uppercase">/ {isEn ? 'mo' : 'bln'}</span>
                       </div>
                       <ul className="space-y-4 mb-10 flex-1">
                          {isEn ? [
                            'Automated Market Scanning',
                            'Standard Alpha Scoring',
                            'Basic Global Payouts',
                            idx > 0 ? 'Premium High-Alpha Feeds' : '',
                            idx > 0 ? 'Quantum AI Strategist Access' : '',
                            idx > 1 ? 'Dedicated Account Manager' : '',
                          ].filter(Boolean).map(f => (
                            <li key={f} className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                               <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                               {f}
                            </li>
                          )) : [
                            'Pemindaian Pasar Otomatis',
                            'Skor Alpha Standar',
                            'Payout Global Dasar',
                            idx > 0 ? 'Feed Alpha Tinggi Premium' : '',
                            idx > 0 ? 'Akses Strategis AI Quantum' : '',
                            idx > 1 ? 'Manajer Akun Khusus' : '',
                          ].filter(Boolean).map(f => (
                            <li key={f} className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                               <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                               {f}
                            </li>
                          ))}
                       </ul>
                       <button onClick={onEnter} className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${idx === 1 ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                          {isEn ? 'Get Started' : 'Mulai Sekarang'}
                       </button>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Network Section */}
        <section id="network" className="py-32 px-8">
           <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-[3.5rem] p-16 relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent"></div>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">{isEn ? 'Our Official Global Ecosystem' : 'Ekosistem Global Resmi Kami'}</h2>
              <p className="text-slate-400 mb-16 max-w-2xl text-lg leading-relaxed">{isEn ? 'Strategic partnerships with leading financial hubs ensure your terminal always has access to the most liquid dark pools and exclusive market data.' : 'Kemitraan strategis dengan hub finansial terkemuka memastikan terminal Anda selalu memiliki akses ke dark pool paling likuid dan data pasar eksklusif.'}</p>
              
              <div className="flex flex-wrap justify-center gap-x-20 gap-y-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                <div className="text-3xl font-black italic tracking-tighter">CITIBANK</div>
                <div className="text-3xl font-black italic tracking-tighter">HSBC</div>
                <div className="text-3xl font-black italic tracking-tighter">DBS_SG</div>
                <div className="text-3xl font-black italic tracking-tighter">MUFG</div>
                <div className="text-3xl font-black italic tracking-tighter">JPMORGAN</div>
                <div className="text-3xl font-black italic tracking-tighter">BARCLAYS</div>
              </div>
              
              <div className="mt-20 flex flex-col items-center gap-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">{isEn ? 'Network Coverage' : 'Cakupan Jaringan'}</p>
                 <div className="flex items-center gap-12">
                    <div className="text-center"><p className="text-4xl font-black text-white">142+</p><p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Countries</p></div>
                    <div className="text-center"><p className="text-4xl font-black text-white">50M+</p><p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Transactions</p></div>
                    <div className="text-center"><p className="text-4xl font-black text-white">1.2B</p><p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Processed</p></div>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* Official Footer */}
      <footer className="bg-[#03060a] border-t border-slate-800/50 py-20 px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
             <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">M</div>
                  <span className="text-xl font-black italic tracking-tighter uppercase">MoneyFinder<span className="text-indigo-500">.Pro</span></span>
                </div>
                <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                  {isEn 
                    ? 'The industry-leading platform for digital asset realization and market opportunity discovery. Delivering institutional-grade tools to your browser.' 
                    : 'Platform terkemuka di industri untuk realisasi aset digital dan penemuan peluang pasar. Menghadirkan alat tingkat institusi ke browser Anda.'}
                </p>
             </div>
             <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-white mb-6">Platform</h5>
                <ul className="space-y-4 text-xs font-bold text-slate-500">
                   <li><a href="#" className="hover:text-indigo-400 transition-colors">Alpha Terminal</a></li>
                   <li><a href="#" className="hover:text-indigo-400 transition-colors">API Docs</a></li>
                   <li><a href="#" className="hover:text-indigo-400 transition-colors">Security Audit</a></li>
                   <li><a href="#" className="hover:text-indigo-400 transition-colors">Institutional Access</a></li>
                </ul>
             </div>
             <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-white mb-6">Support</h5>
                <ul className="space-y-4 text-xs font-bold text-slate-500">
                   <li><a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
                   <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact Relations</a></li>
                   <li><a href="#" className="hover:text-indigo-400 transition-colors">Status Board</a></li>
                   <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                </ul>
             </div>
          </div>

          <div className="pt-12 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">© 2024 MoneyFinder Corporation (Global) Ltd. All rights reserved.</span>
              <span className="text-[9px] text-slate-700 font-medium">Licensed under International Financial Protocol Code X-119.</span>
            </div>
            
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <a href="#" className="hover:text-white transition-colors">{isEn ? 'Terms' : 'Syarat'}</a>
              <a href="#" className="hover:text-white transition-colors">{isEn ? 'Privacy' : 'Privasi'}</a>
              <a href="#" className="hover:text-white transition-colors">{isEn ? 'Legal' : 'Legal'}</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>

            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/50 rounded-full border border-slate-800">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
               <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Network Status: Optimized</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
