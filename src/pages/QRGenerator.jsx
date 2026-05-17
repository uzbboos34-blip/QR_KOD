import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import axios from "axios";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, Upload, QrCode, Type, Image, Sparkles, Share2, MapPin, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const toLatin = (text) => {
  if (!text) return "";
  
  let result = text;
  
  const translations = [
    { cyr: /ул\./gi, lat: "ko'chasi" },
    { cyr: /уlica/gi, lat: "ko'chasi" },
    { cyr: /улица/gi, lat: "ko'chasi" },
    { cyr: /проспект/gi, lat: "shoh ko'chasi" },
    { cyr: /город/gi, lat: "shahri" },
    { cyr: /область/gi, lat: "viloyati" },
    { cyr: /Сельский врачебный пункт/gi, lat: "Qishloq vrachlik punkti" },
    { cyr: /Офис/gi, lat: "Ofis" },
    { cyr: /Давлатобод/gi, lat: "Davlatobod" },
    { cyr: /Самарканд/gi, lat: "Samarqand" },
    { cyr: /Ташкент/gi, lat: "Toshkent" },
    { cyr: /Корахон/gi, lat: "Qoraxon" },
    { cyr: /кучаси/gi, lat: "ko'chasi" },
    { cyr: /куча/gi, lat: "ko'cha" },
    { cyr: /дом/gi, lat: "uy" },
    { cyr: /квартира/gi, lat: "xonadon" }
  ];
  
  translations.forEach(({ cyr, lat }) => {
    result = result.replace(cyr, lat);
  });

  const cyrToLatMap = {
    'А': 'A', 'а': 'a',
    'Б': 'B', 'б': 'b',
    'В': 'V', 'в': 'v',
    'Г': 'G', 'г': 'g',
    'Д': 'D', 'д': 'd',
    'Е': 'E', 'е': 'e',
    'Ё': 'Yo', 'ё': 'yo',
    'Ж': 'J', 'ж': 'j',
    'З': 'Z', 'з': 'z',
    'И': 'I', 'и': 'i',
    'Й': 'Y', 'й': 'y',
    'К': 'K', 'к': 'k',
    'Л': 'L', 'л': 'l',
    'М': 'M', 'м': 'm',
    'Н': 'N', 'н': 'n',
    'О': 'O', 'о': 'o',
    'П': 'P', 'п': 'p',
    'Р': 'R', 'р': 'r',
    'С': 'S', 'с': 's',
    'Т': 'T', 'т': 't',
    'У': 'U', 'у': 'u',
    'Ф': 'F', 'ф': 'f',
    'Х': 'X', 'х': 'x',
    'Ц': 'Ts', 'ц': 'ts',
    'Ч': 'Ch', 'ч': 'ch',
    'Ш': 'Sh', 'ш': 'sh',
    'Щ': 'Shch', 'щ': 'shch',
    'Ъ': '', 'ъ': '',
    'Ы': 'I', 'ы': 'i',
    'Ь': '', 'ь': '',
    'Э': 'E', 'э': 'e',
    'Ю': 'Yu', 'ю': 'yu',
    'Я': 'Ya', 'я': 'ya',
    'Ў': "O'", 'ў': "o'",
    'Қ': 'Q', 'қ': 'q',
    'Ғ': "G'", 'ғ': "g'",
    'Ҳ': 'H', 'ҳ': 'h'
  };

  return result.split('').map(char => {
    return cyrToLatMap[char] !== undefined ? cyrToLatMap[char] : char;
  }).join('');
};

export default function QRGenerator() {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [imageQrDataUrl, setImageQrDataUrl] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadedImagePreview, setUploadedImagePreview] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [locationTitle, setLocationTitle] = useState("");
  const [locationMapUrl, setLocationMapUrl] = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [locationQrDataUrl, setLocationQrDataUrl] = useState("");
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [isLocatingPicker, setIsLocatingPicker] = useState(false);
  const [mapSearchSuggestions, setMapSearchSuggestions] = useState([]);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
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

    try {
      const url = await QRCode.toDataURL(qrValue, { width: 300, margin: 2 });
      setQrDataUrl(url);
    } catch (error) {
      console.error("Failed to generate text QR code:", error);
      setQrDataUrl("");
      toast.error("Matn juda uzun! QR kod sig'imiga mos kelmadi, matnni qisqartiring.");
    }
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
      // 1. Matnni va rasmni serverga yuboramiz
      const uniqueId = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      const payload = {
        id: uniqueId,
        type: 'image',
        content: imageDescription.trim(),
        qrDataUrl: uploadedImageUrl
      };

      const res = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('API xatosi');
      }

      // 2. Qaytarilgan ID asosida qisqa va tiniq QR kod yasaymiz!
      const baseUrl = window.location.origin;
      const smartUrl = `${baseUrl}/scan-result?id=${uniqueId}`;
      
      const qr = await QRCode.toDataURL(smartUrl, { width: 300, margin: 2 });
      setImageQrDataUrl(qr);
      toast.success("QR kod tayyor!");
    } catch (error) {
      console.error("Failed to generate image QR code:", error);
      setImageQrDataUrl("");
      toast.error("Xatolik yuz berdi! Tizim ishlamayapti (Server ulanmagan bo'lishi mumkin).");
    }
  };

  useEffect(() => {
    generateImageQR();
  }, [uploadedImageUrl, imageDescription]);

  // Generate QR for location dynamically
  const generateLocationQR = async () => {
    if (!locationTitle.trim() || !locationMapUrl.trim()) {
      setLocationQrDataUrl("");
      return;
    }
    try {
      const uniqueId = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      const contentData = JSON.stringify({
        title: locationTitle.trim(),
        mapUrl: locationMapUrl.trim(),
        desc: locationDesc.trim()
      });

      const payload = {
        id: uniqueId,
        type: 'location',
        content: contentData,
        qrDataUrl: locationMapUrl.trim(),
        label: locationTitle.trim()
      };

      const res = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('API xatosi');
      }

      const baseUrl = window.location.origin;
      const smartUrl = `${baseUrl}/scan-result?id=${uniqueId}`;
      
      const qr = await QRCode.toDataURL(smartUrl, { width: 300, margin: 2 });
      setLocationQrDataUrl(qr);
      toast.success("Joylashuv QR kodi tayyor!");
    } catch (error) {
      console.error("Failed to generate location QR code:", error);
      setLocationQrDataUrl("");
      toast.error("Xatolik yuz berdi! Serverda xatolik kuzatildi.");
    }
  };

  useEffect(() => {
    generateLocationQR();
  }, [locationTitle, locationMapUrl, locationDesc]);

  const handleShareLocationQR = async () => {
    try {
      const response = await fetch(locationQrDataUrl);
      const blob = await response.blob();
      const file = new File([blob], "location-qrcode.png", { type: "image/png" });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
        });
      } else {
        const baseUrl = window.location.origin;
        let targetUrl = `${baseUrl}/scan-result?type=location&title=${encodeURIComponent(locationTitle.trim())}&mapUrl=${encodeURIComponent(locationMapUrl.trim())}`;
        if (locationDesc.trim()) {
          targetUrl += `&desc=${encodeURIComponent(locationDesc.trim())}`;
        }
        await navigator.share({
          title: "Lokatsiya QR",
          url: targetUrl,
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      const baseUrl = window.location.origin;
      let targetUrl = `${baseUrl}/scan-result?type=location&title=${encodeURIComponent(locationTitle.trim())}&mapUrl=${encodeURIComponent(locationMapUrl.trim())}`;
      if (locationDesc.trim()) {
        targetUrl += `&desc=${encodeURIComponent(locationDesc.trim())}`;
      }
      navigator.clipboard.writeText(targetUrl);
      alert("Havola nusxalandi! Do'stlaringizga yuborishingiz mumkin.");
    }
  };

  // Geolocation loader - automatically fetches user's current GPS location
  const handleDetectCurrentLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocationMapUrl(`https://www.google.com/maps?q=${lat},${lng}`);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        alert("Joylashuvni avtomatik aniqlab bo'lmadi. Iltimos xaritadan tanlang.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Dynamic Leaflet Map picker loader
  useEffect(() => {
    if (!showMapModal) return;

    // Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    
    script.onload = () => {
      const L = window.L;
      
      // Attempt to get user GPS coordinate or default to Tashkent
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          initPickerMap(L, pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          initPickerMap(L, 41.311081, 69.240562); // Tashkent default coords
        }
      );
    };

    document.body.appendChild(script);

    return () => {
      link.remove();
      script.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [showMapModal]);

  const initPickerMap = (L, lat, lng) => {
    // Check if the container actually exists
    const container = document.getElementById("map-picker-container");
    if (!container) return;

    // Clean up old map instance if it was already initialized
    if (container._leaflet_id) {
      container.outerHTML = '<div id="map-picker-container" class="w-full h-[280px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center text-slate-500 text-xs z-10"></div>';
    }

    const map = L.map("map-picker-container").setView([lat, lng], 15);
    mapRef.current = map;
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap"
    }).addTo(map);

    // Draggable marker
    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    markerRef.current = marker;
    
    const updateCoords = (newLat, newLng) => {
      setSelectedCoords({ lat: newLat, lng: newLng });
    };

    // Set default coordinates initially
    updateCoords(lat, lng);

    marker.on("dragend", () => {
      const position = marker.getLatLng();
      updateCoords(position.lat, position.lng);
    });

    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      updateCoords(e.latlng.lat, e.latlng.lng);
    });
  };

  const handleLocateInPicker = () => {
    if (!mapRef.current || !markerRef.current) return;
    setIsLocatingPicker(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        mapRef.current.setView([lat, lng], 16);
        markerRef.current.setLatLng([lat, lng]);
        setSelectedCoords({ lat, lng });
        setIsLocatingPicker(false);
      },
      () => {
        setIsLocatingPicker(false);
        alert("Hozirgi joylashuvingizni aniqlab bo'lmadi.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMapSearch = async () => {
    if (!mapSearchQuery.trim() || !mapRef.current || !markerRef.current) return;
    setIsSearchingMap(true);
    
    let viewboxParam = "";
    try {
      const center = mapRef.current.getCenter();
      const minlon = center.lng - 0.5;
      const maxlon = center.lng + 0.5;
      const minlat = center.lat - 0.5;
      const maxlat = center.lat + 0.5;
      viewboxParam = `&viewbox=${minlon},${minlat},${maxlon},${maxlat}&bounded=0`;
    } catch (_) {}

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=uz&accept-language=uz&limit=5${viewboxParam}&q=${encodeURIComponent(mapSearchQuery.trim())}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setMapSearchSuggestions(data);
      } else {
        setMapSearchSuggestions([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingMap(false);
    }
  };

  // Auto-search Nominatim API on search query typing with 500ms debounce to fetch suggestions (limited strictly to Uzbekistan)
  useEffect(() => {
    if (!mapSearchQuery.trim() || !mapRef.current || !markerRef.current) {
      setMapSearchSuggestions([]);
      return;
    }
    
    const delayDebounceFn = setTimeout(() => {
      const fetchSuggestions = async () => {
        setIsSearchingMap(true);
        
        let viewboxParam = "";
        try {
          const center = mapRef.current.getCenter();
          const minlon = center.lng - 0.5;
          const maxlon = center.lng + 0.5;
          const minlat = center.lat - 0.5;
          const maxlat = center.lat + 0.5;
          viewboxParam = `&viewbox=${minlon},${minlat},${maxlon},${maxlat}&bounded=0`;
        } catch (_) {}

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&countrycodes=uz&accept-language=uz&limit=5${viewboxParam}&q=${encodeURIComponent(mapSearchQuery.trim())}`
          );
          const data = await response.json();
          if (data && data.length > 0) {
            setMapSearchSuggestions(data);
          } else {
            setMapSearchSuggestions([]);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearchingMap(false);
        }
      };
      fetchSuggestions();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [mapSearchQuery]);

  const handleSelectSuggestion = (suggestion) => {
    if (!mapRef.current || !markerRef.current) return;
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    mapRef.current.setView([lat, lng], 16);
    markerRef.current.setLatLng([lat, lng]);
    setSelectedCoords({ lat, lng });
    
    // Fill input with display name and close suggestions
    setMapSearchQuery(toLatin(suggestion.display_name));
    setMapSearchSuggestions([]);
  };

  const handleConfirmLocation = () => {
    if (selectedCoords) {
      setLocationMapUrl(`https://www.google.com/maps?q=${selectedCoords.lat},${selectedCoords.lng}`);
      if (!locationTitle.trim() && mapSearchQuery.trim()) {
        const shortName = mapSearchQuery.split(",")[0] || mapSearchQuery;
        setLocationTitle(shortName.trim());
      }
    }
    setShowMapModal(false);
  };

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

  const handleShareQR = async () => {
    try {
      // Convert dataURL to blob
      const response = await fetch(imageQrDataUrl);
      const blob = await response.blob();
      const file = new File([blob], "qrcode.png", { type: "image/png" });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
        });
      } else {
        // Fallback to sharing the text/url
        const baseUrl = window.location.origin;
        let targetUrl = `${baseUrl}/scan-result?data=${encodeURIComponent(uploadedImageUrl)}`;
        if (imageDescription.trim()) {
          targetUrl += `&caption=${encodeURIComponent(imageDescription.trim())}`;
        }
        await navigator.share({
          title: "QR Kod Havolasi",
          url: targetUrl,
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Simple copy to clipboard fallback
      const baseUrl = window.location.origin;
      let targetUrl = `${baseUrl}/scan-result?data=${encodeURIComponent(uploadedImageUrl)}`;
      if (imageDescription.trim()) {
        targetUrl += `&caption=${encodeURIComponent(imageDescription.trim())}`;
      }
      navigator.clipboard.writeText(targetUrl);
      alert("Havola nusxalandi! Do'stlaringizga yuborishingiz mumkin.");
    }
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
              className="flex-1 gap-2 rounded-xl text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 text-xs md:text-sm"
            >
              <Type className="w-4 h-4" /> Matn
            </TabsTrigger>
            <TabsTrigger 
              value="image" 
              className="flex-1 gap-2 rounded-xl text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 text-xs md:text-sm"
            >
              <Image className="w-4 h-4" /> Rasm
            </TabsTrigger>
            <TabsTrigger 
              value="location" 
              className="flex-1 gap-2 rounded-xl text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 text-xs md:text-sm"
            >
              <MapPin className="w-4 h-4" /> Lokatsiya
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
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="image-desc" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rasm ostidagi matn (Ixtiyoriy)</Label>
                  <span className="text-[10px] font-mono text-slate-500">{imageDescription.length}/2000</span>
                </div>
                <Textarea
                  id="image-desc"
                  placeholder="Rasm ostida chiqadigan matnni yozing (masalan: tabrik, ism yoki telefon)..."
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value.slice(0, 2000))}
                  className="min-h-[80px] bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm resize-none p-3"
                  maxLength={2000}
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
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={() => downloadQR(imageQrDataUrl, "image-qrcode.png")}
                    className="flex-1 h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-base gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Download className="w-5 h-5 text-indigo-400" /> Yuklab olish
                  </Button>
                  <Button
                    onClick={handleShareQR}
                    className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base gap-2 shadow-xl shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Share2 className="w-5 h-5" /> Ulashish
                  </Button>
                </div>
              </div>
            )}

            {!imageQrDataUrl && !imageLoading && (
              <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-800 rounded-[2rem] text-slate-500 bg-slate-950/20">
                <QrCode className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm font-medium">Rasm tanlang — QR kod yasaladi</p>
              </div>
            )}
          </TabsContent>

          {/* LOCATION TAB */}
          <TabsContent value="location" className="space-y-6 outline-none">
            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="loc-title" className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Joy nomi (Masalan: Ofisimiz, Do'konimiz)</Label>
                <input
                  id="loc-title"
                  type="text"
                  placeholder="Joy nomini kiriting..."
                  value={locationTitle}
                  onChange={(e) => setLocationTitle(e.target.value)}
                  className="w-full h-14 bg-slate-950/50 border border-slate-800 text-slate-200 placeholder:text-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm px-4 outline-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loc-url" className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Google Maps Havolasi</Label>
                <div 
                  onClick={() => setShowMapModal(true)}
                  className="relative flex items-center cursor-pointer group"
                >
                  <input
                    id="loc-url"
                    type="text"
                    placeholder="Xaritadan tanlash uchun bosing..."
                    value={locationMapUrl}
                    readOnly
                    className="w-full h-14 bg-slate-950/50 border border-slate-800 text-slate-200 placeholder:text-slate-600 rounded-2xl group-hover:border-indigo-500/30 transition-all text-sm pl-4 pr-12 outline-none cursor-pointer"
                  />
                  <div className="absolute right-2 flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-10 h-10 rounded-xl hover:bg-indigo-500/10 text-indigo-400 group-hover:text-indigo-300 p-0 flex items-center justify-center transition-all"
                    >
                      <MapPin className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="loc-desc" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Qo'shimcha ma'lumot (Ixtiyoriy)</Label>
                  <span className="text-[10px] font-mono text-slate-500">{locationDesc.length}/2000</span>
                </div>
                <Textarea
                  id="loc-desc"
                  placeholder="Ish vaqti, telefon raqam yoki mo'ljal yozishingiz mumkin..."
                  value={locationDesc}
                  onChange={(e) => setLocationDesc(e.target.value.slice(0, 2000))}
                  className="min-h-[80px] bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm resize-none p-3"
                  maxLength={2000}
                />
              </div>
            </div>

            {locationQrDataUrl && (
              <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500 pt-4">
                <div 
                  className="relative p-4 bg-white rounded-3xl shadow-2xl group cursor-pointer"
                  onClick={() => {
                    const baseUrl = window.location.origin;
                    let targetUrl = `${baseUrl}/scan-result?type=location&title=${encodeURIComponent(locationTitle.trim())}&mapUrl=${encodeURIComponent(locationMapUrl.trim())}`;
                    if (locationDesc.trim()) {
                      targetUrl += `&desc=${encodeURIComponent(locationDesc.trim())}`;
                    }
                    window.open(targetUrl, "_blank");
                  }}
                >
                  <img
                    src={locationQrDataUrl}
                    alt="Lokatsiya QR kodi"
                    className="w-56 h-56 rounded-xl"
                  />
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/20 rounded-3xl transition-all duration-500 flex items-center justify-center">
                    <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white uppercase tracking-widest">
                      Natijani ko'rish
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={() => downloadQR(locationQrDataUrl, "location-qrcode.png")}
                    className="flex-1 h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-base gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Download className="w-5 h-5 text-indigo-400" /> Yuklab olish
                  </Button>
                  <Button
                    onClick={handleShareLocationQR}
                    className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base gap-2 shadow-xl shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Share2 className="w-5 h-5" /> Ulashish
                  </Button>
                </div>
              </div>
            )}

            {!locationQrDataUrl && (
              <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-800 rounded-[2rem] text-slate-500 bg-slate-950/20">
                <MapPin className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm font-medium">Joy nomi va havolasini kiriting</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
           {/* Premium Leaflet Map Picker Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in duration-300 text-left">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500 animate-bounce" /> Joylashuvni tanlang
              </h3>
              <button 
                onClick={() => setShowMapModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
              >
                Yopish
              </button>
            </div>

            {/* Address Search Bar (Sorchka) */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Manzilni yozing (avtomatik qidiriladi)..."
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleMapSearch();
                }}
                className="w-full h-11 bg-slate-950/60 border border-slate-800 text-slate-200 placeholder:text-slate-600 rounded-xl pl-9 pr-10 outline-none text-xs focus:border-indigo-500 transition-colors"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
              {isSearchingMap && (
                <div className="absolute right-3 top-[14px] w-4 h-4 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              )}

              {/* Suggestions Dropdown */}
              {mapSearchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-[100] mt-1 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-900/50">
                  {mapSearchSuggestions.map((s, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full px-4 py-3 text-left text-xs text-slate-300 hover:text-white hover:bg-indigo-600/20 transition-all flex items-start gap-2.5 outline-none"
                    >
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="truncate">{toLatin(s.display_name)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map Picker Container */}
            <div className="relative">
              <div 
                id="map-picker-container" 
                className="w-full h-[280px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center text-slate-500 text-xs z-10"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <span>Xarita yuklanmoqda...</span>
                </div>
              </div>

              {/* Floating Current Location GPS Button inside Map */}
              <button
                type="button"
                onClick={handleLocateInPicker}
                disabled={isLocatingPicker}
                className="absolute bottom-4 right-4 z-[1000] w-11 h-11 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95"
                title="Hozirgi joylashuvimga o'tish"
              >
                <MapPin className={`w-5 h-5 ${isLocatingPicker ? 'animate-bounce text-purple-400' : ''}`} />
              </button>
            </div>

            <p className="text-[9px] text-slate-500 text-center uppercase tracking-wide font-semibold">
              Markerni torting yoki kerakli joyni bosing
            </p>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                onClick={() => setShowMapModal(false)}
                className="flex-1 h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold transition-all text-xs"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleConfirmLocation}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-900/20 transition-all text-xs"
              >
                Joylashuvni tasdiqlash
              </Button>
            </div>
          </div>
        </div>
      )}
      
      </div>
    </div>
  );
}