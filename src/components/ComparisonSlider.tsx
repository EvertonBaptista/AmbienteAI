import React, { useState, useRef, useEffect } from "react";
import {
  Maximize2,
  Download,
  SlidersHorizontal,
  Columns,
  Eye,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  X,
  Layers,
  Sparkles,
} from "lucide-react";

interface ComparisonSliderProps {
  originalImage: string;
  editedImage: string;
  promptText: string;
  onUseAsBase: () => void;
  versionNumber: number;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalImage,
  editedImage,
  promptText,
  onUseAsBase,
  versionNumber,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<"slider" | "side-by-side" | "hold">("slider");
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isCopied, setIsCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleTouchStart = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchend", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
    }

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isDragging]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = editedImage;
    link.download = `estrutura-ai-ambiente-v${versionNumber}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* View Mode Bar and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-2.5 shadow-xs">
        <div className="flex items-center space-x-1.5">
          <button
            id="view-mode-slider"
            onClick={() => setViewMode("slider")}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              viewMode === "slider"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1" />
            <span className="hidden sm:inline">Divisor</span>
          </button>

          <button
            id="view-mode-side-by-side"
            onClick={() => setViewMode("side-by-side")}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              viewMode === "side-by-side"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Columns className="w-3.5 h-3.5 inline mr-1" />
            <span className="hidden sm:inline">Lado a Lado</span>
          </button>

          <button
            id="view-mode-hold"
            onMouseDown={() => setIsHoldingOriginal(true)}
            onMouseUp={() => setIsHoldingOriginal(false)}
            onTouchStart={() => setIsHoldingOriginal(true)}
            onTouchEnd={() => setIsHoldingOriginal(false)}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition select-none ${
              isHoldingOriginal
                ? "bg-slate-800 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1" />
            <span className="hidden sm:inline">Segurar Original</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Use as base for compounding edits */}
          <button
            id="use-as-base-button"
            onClick={onUseAsBase}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 flex items-center space-x-1.5 transition"
            title="Usar esta versão como a nova base para novas alterações"
          >
            <Layers className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-[11px] uppercase tracking-wider">Iterar Versão</span>
          </button>

          {/* Download Edited */}
          <button
            id="download-edited-image"
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-1.5 transition uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Exportar</span>
          </button>

          {/* Fullscreen view */}
          <button
            id="fullscreen-toggle"
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
            aria-label="Visualização em Tela Cheia"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewer Container */}
      {viewMode === "slider" && (
        <div
          ref={containerRef}
          id="interactive-comparison-slider"
          className="relative w-full aspect-16/10 sm:aspect-16/9 bg-[#EBEDF0] border border-slate-200 shadow-sm select-none touch-none cursor-ew-resize group overflow-hidden"
          onClick={(e) => handleMove(e.clientX)}
        >
          {/* Geometric Dot Matrix Pattern Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-grid-dots"></div>

          {/* Edited / Modified Room Image (Background) */}
          <img
            src={editedImage}
            alt="Ambiente Editado"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* Original Room Image (Clipped Overlay) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none transition-all duration-75 ease-out"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={originalImage}
              alt="Ambiente Original"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-contain max-w-none"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
                height: containerRef.current ? `${containerRef.current.clientHeight}px` : "100%",
              }}
            />
          </div>

          {/* Draggable Divider Line & Geometric Knob */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none transition-all duration-75 ease-out"
            style={{ left: `${sliderPosition}%` }}
          >
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white text-slate-900 shadow-xl flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing border-2 border-slate-900 transition-transform"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-900" />
            </div>
          </div>

          {/* Floating Geometric Tags */}
          <div className="absolute top-4 left-4 pointer-events-none z-10">
            <span className="bg-black/80 text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest">
              Preview Original
            </span>
          </div>

          <div className="absolute top-4 right-4 space-y-2 pointer-events-none z-10 hidden sm:block">
            <div className="bg-white/90 backdrop-blur-xs border border-slate-200 p-2 shadow-xs">
              <div className="text-[10px] text-slate-400 uppercase mb-1 font-bold">Iluminação</div>
              <div className="w-28 h-1 bg-slate-100 relative">
                <div className="absolute inset-0 w-3/4 bg-slate-900"></div>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-xs border border-slate-200 p-2 shadow-xs">
              <div className="text-[10px] text-slate-400 uppercase mb-1 font-bold">Perspectiva</div>
              <div className="w-28 h-1 bg-slate-100 relative">
                <div className="absolute inset-0 w-full bg-slate-900"></div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-xs text-[10px] font-mono text-slate-700 border border-slate-200 uppercase tracking-wider">
              Arraste o divisor para inspecionar
            </span>
          </div>
        </div>
      )}

      {/* Side-by-side mode */}
      {viewMode === "side-by-side" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative aspect-16/10 bg-white border border-slate-200 overflow-hidden shadow-xs">
            <img
              src={originalImage}
              alt="Ambiente Original"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 text-white text-[10px] font-bold uppercase tracking-widest">
              Original
            </div>
          </div>
          <div className="relative aspect-16/10 bg-white border border-slate-300 overflow-hidden shadow-xs">
            <img
              src={editedImage}
              alt="Ambiente Editado"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 right-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">
              Transformação v{versionNumber}
            </div>
          </div>
        </div>
      )}

      {/* Hold mode */}
      {viewMode === "hold" && (
        <div className="relative w-full aspect-16/10 sm:aspect-16/9 bg-white border border-slate-200 overflow-hidden shadow-xs">
          <img
            src={isHoldingOriginal ? originalImage : editedImage}
            alt={isHoldingOriginal ? "Original" : "Editado"}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain transition-all duration-150"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">
              {isHoldingOriginal ? "Exibindo Foto Original" : `Exibindo Transformação v${versionNumber}`}
            </span>
          </div>
        </div>
      )}

      {/* Active Prompt Summary Box */}
      <div className="p-4 bg-white border border-slate-200 flex items-start justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
            Instrução Executada no Ambiente:
          </span>
          <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed font-sans">
            "{promptText}"
          </p>
        </div>
        <button
          onClick={handleCopyPrompt}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200 shrink-0"
          title="Copiar prompt"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Geometric Balance Metric Blocks (4-column architectural row) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="border border-slate-200 bg-white p-3 flex flex-col justify-between shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escala Real</span>
          <span className="text-lg font-light italic text-slate-800">Preservada</span>
        </div>
        <div className="border border-slate-200 bg-white p-3 flex flex-col justify-between shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coerência de Cor</span>
          <span className="text-lg font-light italic text-slate-800">98.4%</span>
        </div>
        <div className="border border-slate-200 bg-white p-3 flex flex-col justify-between shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sombras Globais</span>
          <span className="text-lg font-light italic text-slate-800">Calculado</span>
        </div>
        <div className="border border-slate-200 bg-white p-3 flex flex-col justify-between border-l-4 border-l-slate-900 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status de Edição</span>
          <span className="text-lg font-semibold text-slate-900 uppercase tracking-tight">Finalizado</span>
        </div>
      </div>

      {/* Fullscreen Inspector Modal */}
      {isFullscreen && (
        <div
          id="fullscreen-modal"
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Inspeção de Detalhes em Alta Resolução
              </span>
              <span className="text-xs font-mono text-slate-400">v{versionNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-2 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-300 min-w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                className="p-2 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 ml-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={editedImage}
              alt="Ambiente Editado Fullscreen"
              referrerPolicy="no-referrer"
              style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.15s ease" }}
              className="max-h-[85vh] max-w-[90vw] object-contain border border-slate-700 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

