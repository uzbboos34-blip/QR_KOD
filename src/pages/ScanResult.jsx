import { useSearchParams, useNavigate } from "react-router-dom";
import { QrCode, ArrowLeft, Copy, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function ScanResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const data = searchParams.get("data") || "";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data);
    setCopied(true);
    toast.success("Nusxa olindi!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Animated Background Layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-[150px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
        {/* Floating Icon */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-ping" />
          <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-6 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/10">
            <QrCode className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="text-center space-y-8 w-full">
          <div className="space-y-2">
            <h2 className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Skanerlash Natijasi</h2>
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto" />
          </div>

          <div className="relative py-12 px-4 group">
            {/* Artistic Quotes or Accents */}
            <div className="absolute top-0 left-0 text-6xl text-white/5 font-serif">"</div>
            <div className="absolute bottom-0 right-0 text-6xl text-white/5 font-serif rotate-180">"</div>
            
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-500 tracking-tight leading-tight break-words drop-shadow-sm selection:bg-indigo-500/30">
              {data || "Ma'lumot topilmadi"}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <Button 
              onClick={handleCopy}
              className="h-16 px-10 rounded-full bg-white text-black hover:bg-slate-200 font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5 gap-3"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              {copied ? "Nusxalandi" : "Nusxa olish"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'QR Data', text: data });
                } else {
                  toast.info("Ulashish imkoniyati mavjud emas");
                }
              }}
              className="h-16 w-16 rounded-full border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-white transition-all hover:scale-105 active:scale-95 border-2"
            >
              <Share2 className="w-6 h-6" />
            </Button>

            <Button 
              variant="ghost"
              onClick={() => navigate("/")}
              className="w-full md:w-auto h-16 px-8 rounded-full text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/5 font-bold uppercase tracking-widest text-[10px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Ortga qaytish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
