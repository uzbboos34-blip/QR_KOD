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
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />

      <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 md:p-10 relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-8 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga
        </Button>

        <div className="flex flex-col items-center text-center">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5 rounded-3xl shadow-2xl shadow-indigo-500/20 mb-6">
            <QrCode className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Skanerlash Natijasi</h1>
          <p className="text-slate-500 text-sm mb-10">QR kod tarkibidagi ma'lumot muvaffaqiyatli o'qildi</p>

          <div className="w-full bg-slate-950/50 border border-slate-800 rounded-[2rem] p-8 mb-8 relative group">
            <div className="absolute top-4 right-6 text-[10px] font-mono text-indigo-500/50 uppercase tracking-widest font-bold">Data Content</div>
            <p className="text-xl text-slate-200 break-words leading-relaxed font-medium">
              {data || "Ma'lumot topilmadi"}
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <Button 
              onClick={handleCopy}
              className="flex-1 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white gap-2 font-bold"
            >
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              {copied ? "Nusxalandi" : "Nusxa olish"}
            </Button>
            <Button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'QR Data', text: data });
                } else {
                  toast.info("Ulashish imkoniyati mavjud emas");
                }
              }}
              className="h-14 w-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white p-0"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em] pointer-events-none">
        Securely Decoded by Antigravity
      </div>
    </div>
  );
}
