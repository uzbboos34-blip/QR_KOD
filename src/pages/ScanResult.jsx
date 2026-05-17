import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

export default function ScanResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const data = searchParams.get("data") || "";
  const [copied, setCopied] = useState(false);

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

  // If it's an image, only show the image itself beautifully centered without any UI elements
  if (isImageUrl(data)) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Color-matched Ambient Blurred Backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <img 
            src={data} 
            alt="Backdrop" 
            className="w-full h-full object-cover blur-[100px] opacity-[0.25] scale-125 select-none"
          />
          <div className="absolute inset-0 bg-[#050810]/75" />
        </div>

        {/* Beautiful focused image container */}
        <div className="w-full max-w-2xl relative z-10 flex items-center justify-center animate-in fade-in zoom-in duration-1000 p-2">
          <img 
            src={data} 
            alt="Scanned content" 
            className="max-h-[85vh] max-w-full rounded-[2rem] shadow-[0_30px_80px_rgba(0,0,0,0.9)] border border-white/10 object-contain select-none transition-transform duration-500 hover:scale-[1.01]"
          />
        </div>
      </div>
    );
  }

  // Fallback for regular text / link
  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-8 relative overflow-hidden font-sans">
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
