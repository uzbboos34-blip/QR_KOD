import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import axios from "axios";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, Upload, QrCode, Type, Image, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function QRGenerator() {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [imageQrDataUrl, setImageQrDataUrl] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadedImagePreview, setUploadedImagePreview] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [useSmartQR, setUseSmartQR] = useState(true);
  const fileInputRef = useRef(null);

  // Generate QR from text
  const generateTextQR = async () => {
    if (!text.trim()) return;
    
    let qrValue = text;
    if (useSmartQR) {
      const baseUrl = window.location.origin;
      qrValue = `${baseUrl}/scan-result?data=${encodeURIComponent(text)}`;
    }

    const url = await QRCode.toDataURL(qrValue, { width: 300, margin: 2 });
    setQrDataUrl(url);
  };

  useEffect(() => {
    if (text.trim()) {
      generateTextQR();
    } else {
      setQrDataUrl("");
    }
  }, [text, useSmartQR]);

  // Generate QR for image and description dynamically
  const generateImageQR = async () => {
    if (!uploadedImageUrl) return;
    try {
      const baseUrl = window.location.origin;
      let smartUrl = `${baseUrl}/scan-result?data=${encodeURIComponent(uploadedImageUrl)}`;
      if (imageDescription.trim()) {
        smartUrl += `&caption=${encodeURIComponent(imageDescription.trim())}`;
      }
      const qr = await QRCode.toDataURL(smartUrl, { width: 300, margin: 2 });
      setImageQrDataUrl(qr);
    } catch (error) {
      console.error("Failed to generate image QR code:", error);
    }
  };

  useEffect(() => {
    generateImageQR();
  }, [uploadedImageUrl, imageDescription]);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImagePreview(ev.target.result);
    reader.readAsDataURL(file);

    // Convert file to Base64
    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (error) => reject(error);
      });

    setImageLoading(true);
    try {
      const base64Image = await toBase64(file);

      // URLSearchParams — ImgBB uchun eng ishonchli usul
      const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        new URLSearchParams({
          key: "802ce3485c47dcb8a667c35ce3e626bd",
          image: base64Image,
        })
      );

      if (response.data && response.data.data && response.data.data.url) {
        const file_url = response.data.data.url;
        setUploadedImageUrl(file_url);
      } else {
        throw new Error("Invalid response from ImgBB");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Rasmni yuklashda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setImageLoading(false);
    }
  };

  const downloadQR = (dataUrl, filename) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  };

  return (
    <div className="min-h-full bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black flex flex-col items-center justify-start md:justify-center py-8 md:py-12 px-4 relative overflow-x-hidden overflow-y-visible">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 md:p-10 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
            <QrCode className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">QR Generator</h1>
            <p className="text-slate-400 text-sm font-medium">Matn yoki rasm → <span className="text-indigo-400 font-bold tracking-widest uppercase text-xs ml-1">Premium QR</span></p>
          </div>
        </div>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="w-full h-14 bg-slate-950/50 border border-slate-800 p-1.5 rounded-2xl mb-8">
            <TabsTrigger 
              value="text" 
              className="flex-1 gap-2 rounded-xl text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Type className="w-4 h-4" /> Matn
            </TabsTrigger>
            <TabsTrigger 
              value="image" 
              className="flex-1 gap-2 rounded-xl text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Image className="w-4 h-4" /> Rasm
            </TabsTrigger>
          </TabsList>

          {/* TEXT TAB */}
          <TabsContent value="text" className="space-y-6 outline-none">
            <div className="relative group">
              <Textarea
                placeholder="Matn yoki linkni shu yerga kiriting..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px] bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-base resize-none p-4"
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-700 uppercase tracking-tighter">Text Input</div>
            </div>

            <div className="flex items-center justify-between bg-slate-950/30 border border-slate-800/50 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/20 p-2 rounded-lg">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <Label htmlFor="smart-qr" className="text-slate-200 font-bold cursor-pointer">Smart QR</Label>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Chiroyli natija sahifasi</p>
                </div>
              </div>
              <Switch 
                id="smart-qr" 
                checked={useSmartQR} 
                onCheckedChange={setUseSmartQR}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>

            {qrDataUrl && (
              <div className="flex flex-col items-center gap-6 pt-4 animate-in fade-in zoom-in duration-500">
                <div 
                  className="relative p-4 bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 group cursor-pointer"
                  onClick={() => {
                    if (useSmartQR) {
                      const baseUrl = window.location.origin;
                      window.open(`${baseUrl}/scan-result?data=${encodeURIComponent(text)}`, "_blank");
                    }
                  }}
                >
                  <img
                    src={qrDataUrl}
                    alt="QR kod"
                    className="w-56 h-56 rounded-xl"
                  />
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/20 rounded-3xl transition-all duration-500 flex items-center justify-center">
                    {useSmartQR && (
                      <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white uppercase tracking-widest">
                        Natijani ko'rish
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => downloadQR(qrDataUrl, "qrcode.png")}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg gap-3 shadow-xl shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Download className="w-5 h-5" /> Yuklab olish
                </Button>
              </div>
            )}

            {!qrDataUrl && (
              <div className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-slate-800 rounded-[2rem] text-slate-500 group hover:border-slate-700 transition-all duration-300 bg-slate-950/20">
                <div className="bg-slate-900/50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-500">
                  <QrCode className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-sm font-medium">Matn yozing — QR kod yaratiladi</p>
              </div>
            )}
          </TabsContent>

          {/* IMAGE TAB */}
          <TabsContent value="image" className="space-y-6 outline-none">
            <div
              className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-[2rem] cursor-pointer hover:border-indigo-500/50 transition-all duration-300 bg-slate-950/30 group overflow-hidden relative"
              onClick={() => fileInputRef.current.click()}
            >
              {uploadedImagePreview ? (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img
                    src={uploadedImagePreview}
                    alt="Yuklangan rasm"
                    className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs font-bold uppercase tracking-widest">Rasmni almashtirish</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="bg-slate-900/50 p-4 rounded-full mb-3 group-hover:bg-indigo-500/10 transition-colors">
                    <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <p className="text-slate-400 text-sm font-semibold">Rasm yuklash uchun bosing</p>
                  <p className="text-slate-600 text-xs mt-1 font-mono uppercase tracking-tighter">PNG, JPG, JPEG</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {imageLoading && (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest animate-pulse">Yuklanmoqda...</p>
              </div>
            )}

            {uploadedImageUrl && !imageLoading && (
              <div className="space-y-2 text-left animate-in fade-in duration-300">
                <Label htmlFor="image-desc" className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Rasm ostidagi matn (Ixtiyoriy)</Label>
                <Textarea
                  id="image-desc"
                  placeholder="Rasm ostida chiqadigan matnni yozing (masalan: tabrik, ism yoki telefon)..."
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  className="min-h-[80px] bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm resize-none p-3"
                />
              </div>
            )}

            {imageQrDataUrl && !imageLoading && (
              <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500 pt-2">
                <div 
                  className="relative p-4 bg-white rounded-3xl shadow-2xl group cursor-pointer"
                  onClick={() => {
                    const baseUrl = window.location.origin;
                    let targetUrl = `${baseUrl}/scan-result?data=${encodeURIComponent(uploadedImageUrl)}`;
                    if (imageDescription.trim()) {
                      targetUrl += `&caption=${encodeURIComponent(imageDescription.trim())}`;
                    }
                    window.open(targetUrl, "_blank");
                  }}
                >
                  <img
                    src={imageQrDataUrl}
                    alt="Rasm QR kodi"
                    className="w-56 h-56 rounded-xl"
                  />
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/20 rounded-3xl transition-all duration-500 flex items-center justify-center">
                    <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white uppercase tracking-widest">
                      Natijani ko'rish
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => downloadQR(imageQrDataUrl, "image-qrcode.png")}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg gap-3 shadow-xl shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Download className="w-5 h-5" /> Yuklab olish
                </Button>
              </div>
            )}

            {!imageQrDataUrl && !imageLoading && (
              <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-800 rounded-[2rem] text-slate-500 bg-slate-950/20">
                <QrCode className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm font-medium">Rasm tanlang — QR kod yasaladi</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
    </div>
  );
}