import React, { useState, useRef } from "react";
import { UploadCloud, Sparkles, ShieldCheck, ArrowRight, LayoutGrid, CheckCircle2 } from "lucide-react";
import { ROOM_PRESETS } from "../data/presets";
import { RoomPreset } from "../types";

interface ImageUploaderProps {
  onSelectImage: (base64Data: string, mimeType: string, presetInfo?: RoomPreset) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onSelectImage }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).");
      return;
    }

    setIsLoadingFile(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onSelectImage(result, file.type);
      }
      setIsLoadingFile(false);
    };
    reader.onerror = () => {
      alert("Erro ao ler o arquivo de imagem.");
      setIsLoadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handlePresetSelect = async (preset: RoomPreset) => {
    setSelectedPresetId(preset.id);
    setIsLoadingFile(true);
    try {
      const response = await fetch(preset.imageUrl, { mode: "cors" });
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        onSelectImage(base64Data, blob.type || "image/jpeg", preset);
        setIsLoadingFile(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.warn("Direct blob fetch fallback", err);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = preset.imageUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        onSelectImage(dataUrl, "image/jpeg", preset);
        setIsLoadingFile(false);
      };
      img.onerror = () => {
        alert("Não foi possível carregar o exemplo selecionado. Envie uma foto do seu dispositivo.");
        setIsLoadingFile(false);
      };
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 space-y-6 animate-in fade-in duration-300">
      {/* Hero Intro Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-slate-100/80 via-slate-50/40 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Design Arquitetônico com IA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transforme ambientes mantendo a geometria original
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            Carregue a foto do seu ambiente ou selecione um espaço de demonstração. A IA projeta novos materiais, pisos, revestimentos, cores e iluminação com realismo fotográfico e fidelidade espacial 1:1.
          </p>
        </div>
      </div>

      {/* Upload Dropzone Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Passo 1
            </span>
            <h2 className="text-sm font-bold text-slate-900">
              Faça upload da imagem do ambiente
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">JPG • PNG • WEBP</span>
        </div>

        <div
          id="image-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative w-full h-48 sm:h-52 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-slate-900 bg-slate-100/90 scale-[1.005]"
              : "border-slate-300/80 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-400"
          }`}
        >
          <input
            ref={fileInputRef}
            id="room-file-input"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-3 text-center px-4">
            <div className="p-3.5 bg-white rounded-2xl shadow-xs border border-slate-200 group-hover:scale-105 transition-transform duration-200">
              {isLoadingFile ? (
                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent animate-spin rounded-full" />
              ) : (
                <UploadCloud className="w-6 h-6 text-slate-800" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                Arraste a foto do ambiente ou{" "}
                <span className="text-slate-900 underline underline-offset-4 decoration-slate-300 hover:decoration-slate-900">
                  selecione do computador
                </span>
              </p>
              <p className="text-xs text-slate-500 font-sans">
                Pontos de fuga, linhas estruturais e luz natural são preservados com precisão
              </p>
            </div>
          </div>
        </div>

        {/* Minimal Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perspectiva</span>
              <span className="text-xs font-semibold text-slate-800">Linhas de fuga fixadas</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Luz Global</span>
              <span className="text-xs font-semibold text-slate-800">Janelas e sombras integradas</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ergonomia</span>
              <span className="text-xs font-semibold text-slate-800">Escala de mobília 1:1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Gallery */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Passo 2 (Opcional)
            </span>
            <h2 className="text-sm font-bold text-slate-900">
              Ou escolha um ambiente pronto para testar
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/80">
            5 Ambientes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {ROOM_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                onClick={() => handlePresetSelect(preset)}
                disabled={isLoadingFile}
                className={`group relative flex flex-col text-left overflow-hidden rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "border-slate-900 ring-2 ring-slate-900/20 shadow-sm"
                    : "border-slate-200/80 bg-slate-50/50 hover:border-slate-400 hover:bg-white hover:shadow-xs"
                }`}
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-200">
                  <img
                    src={preset.imageUrl}
                    alt={preset.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-900/90 text-white backdrop-blur-xs">
                    {preset.roomType}
                  </span>
                </div>
                <div className="p-2.5 space-y-0.5">
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {preset.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    {preset.style}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

