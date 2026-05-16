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
