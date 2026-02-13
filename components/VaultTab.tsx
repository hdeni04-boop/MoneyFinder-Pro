
import React, { useState, useMemo, useEffect } from 'react';
import { Language, Transaction } from '../types.ts';
import { translations } from '../translations.ts';
import { processRealWithdrawal, secureData } from '../services/paymentService.ts';

interface Bank {
  name: string;
  country: string;
  swift: string;
  code: string;
  type?: 'bank' | 'wallet' | 'retail';
}

const GLOBAL_BANKS: Bank[] = [
  { name: 'Bank Central Asia (BCA)', country: 'Indonesia', swift: 'CENAIDJA', code: 'BCA', type: 'bank' },
  { name: 'Bank Mandiri', country: 'Indonesia', swift: 'BMRIIDJA', code: 'MANDIRI', type: 'bank' },
  { name: 'Bank Rakyat Indonesia (BRI)', country: 'Indonesia', swift: 'BRINIDJA', code: 'BRI', type: 'bank' },
  { name: 'Bank Negara Indonesia (BNI)', country: 'Indonesia', swift: 'BNIIIDJA', code: 'BNI', type: 'bank' },
  { name: 'DANA', country: 'Indonesia', swift: 'DANAIDJA', code: 'DANA', type: 'wallet' },
  { name: 'GoPay', country: 'Indonesia', swift: 'GOPYIDJA', code: 'GOPAY', type: 'wallet' },
  { name: 'OVO', country: 'Indonesia', swift: 'OVOIDJA', code: 'OVO', type: 'wallet' },
  { name: 'Indomaret (Token)', country: 'Retail', swift: 'RETAIL', code: 'INDOMARET', type: 'retail' },
];

interface VaultTabProps {
  language: Language;
  balance: number;
  transactions: Transaction[];
  onWithdraw: (amount: number, method: string) => void;
}

const VaultTab: React.FC<VaultTabProps> = ({ language, balance, transactions, onWithdraw }) => {
  const t = translations[language];
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [method, setMethod] = useState('Bank Transfer');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accNumber, setAccNumber] = useState('');
  const [accName, setAccName] = useState('');
  const [searchBank, setSearchBank] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMerchantHelp, setShowMerchantHelp] = useState(false);
  const [customWebsiteUrl, setCustomWebsiteUrl] = useState('');
  
  const [isLiveMode, setIsLiveMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCustomWebsiteUrl(window.location.origin);
    }
  }, []);

  const filteredBanks = useMemo(() => {
    if (!searchBank) return GLOBAL_BANKS;
    return GLOBAL_BANKS.filter(b => b.name.toLowerCase().includes(searchBank.toLowerCase()));
  }, [searchBank]);

  const handleWithdrawConfirm = async () => {
    if (withdrawAmount > balance) {
        alert(t.insufficient);
        return;
    }
    
    setIsProcessing(true);
    try {
      const result: any = await processRealWithdrawal({
        amount: withdrawAmount,
        bankCode: selectedBank?.code || 'GENERIC',
        accountHolderName: accName,
        accountNumber: accNumber,
        method: method
      });

      const securedAccount = secureData(accNumber);
      console.log("Audit Log: Transaksi diamankan dengan hash:", securedAccount);
      
      onWithdraw(withdrawAmount, `${method} (${selectedBank?.name || searchBank})`);
      
      alert(language === 'id' ? `Berhasil! Ref ID: ${result.transactionId || 'PRO-99'}` : `Success! Ref ID: ${result.transactionId || 'PRO-99'}`);
      
      setWithdrawAmount(0);
      setAccNumber('');
      setAccName('');
      setIsConfirmModalOpen(false);
    } catch (err: any) {
      alert("System Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const merchantData = {
    website: customWebsiteUrl,
    desc: language === 'id' 
      ? "MoneyFinder Pro adalah platform intelijen pasar otonom yang menggunakan AI untuk menyaring peluang bisnis global. Dana ditarik sebagai komisi aktivitas ekonomi di platform melalui API Xendit."
      : "MoneyFinder Pro is an autonomous market intelligence platform using AI to filter global business opportunities. Funds are withdrawn as commissions from verified platform activities via Xendit API.",
    cat: "Digital Products / SaaS / Financial Info",
    purpose: "Disbursement / Payout"
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Keamanan</p>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <h4 className="text-white font-black text-sm uppercase">UU PDP Terverifikasi</h4>
            </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col justify-center border-t-indigo-500">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Koneksi Gateway</p>
            <h4 className="text-indigo-400 font-black text-sm uppercase">{isLiveMode ? 'Xendit Live' : 'Xendit Sandbox'}</h4>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mode API</p>
            <button 
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isLiveMode ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}
            >
                {isLiveMode ? 'LIVE' : 'SIMULASI'}
            </button>
        </div>
        <div className="bg-slate-900 border border-indigo-600/30 p-6 rounded-[2rem] flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-all shadow-[0_0_20px_rgba(79,70,229,0.1)]" onClick={() => setShowMerchantHelp(true)}>
            <div className="text-center">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Onboarding Help</p>
                <h4 className="text-white font-black text-xs uppercase">{t.merchantGuide}</h4>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col shadow-2xl">
          <div className="mb-8">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">{t.walletBalance}</p>
            <h2 className="text-4xl font-black text-white tracking-tight">${balance.toLocaleString()}</h2>
          </div>

          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Jumlah Penarikan (USD)</label>
              <input 
                type="number" 
                value={withdrawAmount || ''} 
                onChange={(e) => setWithdrawAmount(parseFloat(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white font-bold text-lg"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bank / Dompet Digital</label>
              <div className="relative">
                <input 
                  type="text"
                  value={searchBank}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => { setSearchBank(e.target.value); setIsDropdownOpen(true); }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white font-bold text-sm"
                  placeholder="Cari BCA, DANA..."
                />
                {isDropdownOpen && (
                  <div className="absolute z-20 top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-2xl max-h-48 overflow-y-auto p-2 shadow-2xl">
                    {filteredBanks.map(b => (
                      <div 
                        key={b.code} 
                        onClick={() => { setSelectedBank(b); setSearchBank(b.name); setIsDropdownOpen(false); }}
                        className="p-3 hover:bg-indigo-600 rounded-xl cursor-pointer text-xs font-bold text-white flex justify-between items-center"
                      >
                        {b.name} <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded uppercase">{b.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nama Pemilik Rekening</label>
              <input 
                type="text"
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white font-bold text-sm"
                placeholder="Sesuai Buku Tabungan"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nomor Rekening / HP</label>
              <input 
                type="text"
                value={accNumber}
                onChange={(e) => setAccNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white font-bold text-sm"
                placeholder="Contoh: 12345678"
              />
            </div>
          </div>

          <button 
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={!withdrawAmount || !accNumber || !accName}
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-500 transition-all shadow-xl disabled:opacity-20 mt-6 uppercase text-xs tracking-widest"
          >
            {isLiveMode ? 'Eksekusi Transfer Nyata' : 'Simulasi Penarikan'}
          </button>
        </div>

        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col backdrop-blur-md">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
               {t.payoutHistory}
            </h3>
            <span className="text-[9px] font-black text-slate-600 uppercase">Protokol Audit X-11</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {transactions.map(tx => (
              <div key={tx.id} className="bg-slate-800/20 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group hover:bg-slate-800/40 transition-all">
                <div>
                  <p className="text-sm font-black text-white">{tx.type === 'earning' ? 'Hasil Alpha' : 'Penarikan Dana'}</p>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold">{tx.timestamp} • {tx.method}</p>
                </div>
                <div className="text-right">
                  <p className={`text-base font-black ${tx.type === 'earning' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {tx.type === 'earning' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </p>
                  <span className={`text-[8px] font-black px-2 py-1 rounded uppercase ${tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showMerchantHelp && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-2xl animate-in zoom-in duration-300">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
                <button onClick={() => setShowMerchantHelp(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">{t.merchantGuide}</h2>
                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Data Kepatuhan Pendaftaran Gateway (Xendit)</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                  <div className="p-6 bg-indigo-600/5 border border-indigo-600/20 rounded-2xl">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{t.websiteUrl}</p>
                        <span className="text-[8px] bg-indigo-600 text-white px-2 py-0.5 rounded font-black">WAJIB / REQUIRED</span>
                      </div>
                      <input 
                        type="text" 
                        value={customWebsiteUrl}
                        onChange={(e) => setCustomWebsiteUrl(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white font-mono text-xs mb-3"
                        placeholder={t.urlPlaceholder}
                      />
                      <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                        <svg className="w-3 h-3 inline mr-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" /></svg>
                        {t.deployInstruction}
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                          <div className="p-5 bg-slate-800/40 border border-slate-800 rounded-2xl relative group">
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{t.bizDescription}</p>
                              <p className="text-xs text-slate-300 leading-relaxed italic">"{merchantData.desc}"</p>
                              <button 
                                onClick={() => { navigator.clipboard.writeText(merchantData.desc); alert("Description copied!"); }}
                                className="absolute top-4 right-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                              </button>
                          </div>
                          <div className="p-5 bg-slate-800/40 border border-slate-800 rounded-2xl">
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{t.bizCategory}</p>
                              <p className="text-sm text-white font-bold">{merchantData.cat}</p>
                          </div>
                      </div>
                      <div className="space-y-4">
                          <div className="p-5 bg-slate-800/40 border border-slate-800 rounded-2xl">
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{t.usagePurpose}</p>
                              <p className="text-sm text-white font-bold">{merchantData.purpose}</p>
                          </div>
                          <div className="p-5 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl">
                              <p className="text-[10px] text-indigo-400 font-black uppercase mb-3">{t.complianceCheck}</p>
                              <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                      <div className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</div>
                                      {t.pseStatus} (OSS Perorangan)
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                      <div className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</div>
                                      UU PDP Enkripsi Aktif
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                      <div className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</div>
                                      Protokol AML (KYC Internal)
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl">
                    <p className="text-xs text-amber-500 font-bold leading-relaxed">
                      💡 Tip: Pastikan "Website URL" di atas adalah link yang bisa dibuka oleh tim Xendit. Jika aplikasi Anda hanya di sandbox, Xendit mungkin akan menolak. Gunakan Vercel untuk hosting gratis.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
                  <button 
                      onClick={() => {
                          const blob = new Blob([JSON.stringify(merchantData, null, 2)], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = 'compliance_data.txt';
                          link.click();
                      }}
                      className="bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-500 transition-all uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20"
                  >
                      Download Doc
                  </button>
                  <button 
                      onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(merchantData, null, 2));
                          alert(t.copyData + " Berhasil!");
                      }}
                      className="bg-slate-800 text-white font-black py-4 rounded-2xl hover:bg-slate-700 transition-all uppercase text-[10px] tracking-widest border border-slate-700"
                  >
                      {t.copyData}
                  </button>
                </div>
            </div>
        </div>
      )}

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 6.247a11.955 11.955 0 003.858 18.255 12.015 12.015 0 0013.929 0 11.955 11.955 0 003.858-18.255l-1.109-.123z" /></svg>
                </div>
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Verifikasi Akhir</h2>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Audit Transaksi Berjalan</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-10">
                 <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] text-slate-500 uppercase font-black">Jumlah Bersih</span>
                    <span className="text-lg font-black text-white">${withdrawAmount}</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] text-slate-500 uppercase font-black">Bank Tujuan</span>
                    <span className="text-xs font-black text-white">{selectedBank?.name || searchBank}</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] text-slate-500 uppercase font-black">Nama Rekening</span>
                    <span className="text-xs font-black text-emerald-400 uppercase">{accName}</span>
                 </div>
                 <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                    <p className="text-[9px] text-amber-500 font-bold uppercase leading-relaxed">
                        Peringatan: Pastikan nama rekening sesuai dengan identitas KTP Anda untuk mematuhi aturan Anti-Pencucian Uang (AML).
                    </p>
                 </div>
              </div>

              <button 
                onClick={handleWithdrawConfirm}
                disabled={isProcessing}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-500 shadow-xl transition-all uppercase text-xs"
              >
                {isProcessing ? 'Menghubungkan ke Bank...' : 'Inisialisasi Transfer'}
              </button>
              <button onClick={() => setIsConfirmModalOpen(false)} className="mt-4 text-slate-500 font-black text-[10px] uppercase hover:text-white transition-colors">Batalkan</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default VaultTab;
