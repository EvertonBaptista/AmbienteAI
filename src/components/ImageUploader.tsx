import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
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
    <div className="w-full max-w-5xl mx-auto py-6 space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute right-0 top-0 w-64 h-64 bg-slate-50 opacity-40 pointer-events-none -mr-12 -mt-12 rounded-full"></div>
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-slate-900"></span>
            <span>Módulo de Ingestão Arquitetônica</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Transformação Fotorrealista com Geometria Travada
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Faça upload da imagem do ambiente ou escolha um cenário pré-configurado. A IA recalcula os materiais, iluminação e mobília mantendo perspectiva, pontos de fuga e escala 1:1.
          </p>
        </div>
      </div>

      {/* Upload Dropzone Container */}
      <div className="bg-white border border-slate-200 p-6 shadow-xs space-y-4">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          1. Upload do Ambiente (JPG, PNG, WEBP)
        </label>

        <div
          id="image-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative w-full h-44 sm:h-48 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-slate-900 bg-slate-100 scale-[1.005]"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-400"
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
            <div className="p-3 bg-white shadow-xs border border-slate-200 group-hover:scale-105 transition-transform duration-200">
              {isLoadingFile ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent animate-spin rounded-full" />
              ) : (
                <UploadCloud className="w-5 h-5 text-slate-700" />
              )}
            </div>

            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-semibold text-slate-900">
                Arraste a foto do ambiente ou{" "}
                <span className="text-slate-900 underline underline-offset-4">
                  clique para navegar
                </span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Perspectiva & Luz Natural preservadas automaticamente
              </p>
            </div>
          </div>
        </div>

        {/* Technical Metric Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="border border-slate-200 bg-slate-50/70 p-3 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perspectiva</span>
              <span className="text-xs font-semibold text-slate-800">Linhas de fuga 100% fixadas</span>
            </div>
          </div>
          <div className="border border-slate-200 bg-slate-50/70 p-3 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Luz Global</span>
              <span className="text-xs font-semibold text-slate-800">Preservação de janelas e sombras</span>
            </div>
          </div>
          <div className="border border-slate-200 bg-slate-50/70 p-3 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ergonomia</span>
              <span className="text-xs font-semibold text-slate-800">Escala de mobília proporcional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Gallery */}
      <div className="bg-white border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              2. Cenários Pré-Configurados para Teste
            </label>
            <h2 className="text-sm font-bold text-slate-900">
              Selecione um ambiente pronto para testar edições imediatas:
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 border border-slate-200">
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
                className={`group relative flex flex-col text-left overflow-hidden border transition-all duration-200 ${
                  isSelected
                    ? "border-slate-900 ring-1 ring-slate-900"
                    : "border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-white"
                }`}
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-200">
                  <img
                    src={preset.imageUrl}
                    alt={preset.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 bg-slate-900 text-white">
                    {preset.roomType}
                  </span>
                </div>
                <div className="p-2.5 space-y-0.5">
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {preset.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 line-clamp-1 font-mono">
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

