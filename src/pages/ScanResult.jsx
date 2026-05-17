import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ScanResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const data = searchParams.get("data") || "";
  const caption = searchParams.get("caption") || "";

  const isImageUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
    } catch (_) {
      return false;
    }
    return (
      url.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i) !== null ||
      url.includes("i.ibb.co") ||
      url.includes("imgur.com") ||
      url.includes("images.unsplash.com") ||
      url.includes("telegra.ph")
    );
  };

  const handleDownload = async () => {
    try {
      toast.loading("Rasm yuklab olinmoqda...");
      const response = await fetch(data);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const filename = data.split("/").pop().split("?")[0] || "scanned-image.png";
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.dismiss();
      toast.success("Muvaffaqiyatli saqlandi!");
    } catch (error) {
      toast.dismiss();
      // Fallback: open in new tab
      window.open(data, "_blank");
      toast.info("Rasm yangi oynada ochildi, uni bosib turib saqlab olishingiz mumkin");
    }
  };

  // If it's a beautiful image scanned
  if (isImageUrl(data)) {
    return (
      <div className="min-h-full bg-[#050810] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-white">
        {/* Color-matched Ambient Blurred Backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <img 
            src={data} 
            alt="Backdrop" 
            className="w-full h-full object-cover blur-[100px] opacity-[0.25] scale-125 select-none"
          />
          <div className="absolute inset-0 bg-[#050810]/70" />
        </div>

        <div className="w-full max-w-lg relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Main Showcase Container */}
          <div className="w-full bg-slate-900/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col items-center">
            
            {/* Title / Header */}
            <div className="text-center mb-6">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-indigo-400">Skanerlangan Rasm</span>
              <div className="h-[2px] w-8 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-2 rounded-full" />
            </div>

            {/* Image Frame */}
            <div className="relative group w-full aspect-[4/3] rounded-[1.8rem] overflow-hidden border border-white/10 shadow-2xl bg-black/40 mb-6">
              <img 
                src={data} 
                alt="Scanned content" 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            {/* Optional Description / Caption */}
            {caption && (
              <div className="w-full mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md text-left">
                <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap break-words">
                  {caption}
                </p>
              </div>
            )}

            {/* Actions Panel - ONLY Download Button as requested */}
            <div className="w-full">
              <Button 
                onClick={handleDownload}
                className="w-full h-14 rounded-2xl bg-white hover:bg-slate-100 text-black font-extrabold text-base transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5 gap-2.5"
              >
                <Download className="w-5 h-5" /> Rasmni saqlash
              </Button>
            </div>

          </div>

          {/* Return Home Button */}
          <Button 
            variant="ghost"
            onClick={() => navigate("/")}
            className="mt-8 text-slate-500 hover:text-white font-bold tracking-widest uppercase text-[10px] gap-2 rounded-full px-6 py-3 hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" /> Bosh sahifaga
          </Button>

        </div>
      </div>
    );
  }

  // Fallback for regular text / link
  return (
    <div className="min-h-full bg-[#050810] flex items-center justify-center p-8 relative overflow-hidden font-sans">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-50" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tight leading-[1.2] break-words drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-1000">
            {data || "Ma'lumot topilmadi"}
          </h1>
          
          {/* Very subtle indicator that it's a result */}
          <div className="mt-12 h-[2px] w-24 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent mx-auto" />
        </div>
      </div>
    </div>
  );
}
