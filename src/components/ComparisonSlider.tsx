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
    link.download = `ambiente-ai-v${versionNumber}-${Date.now()}.png`;
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
    <div className="w-full space-y-3 animate-in fade-in duration-300">
      {/* Sleek Modern Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white/90 backdrop-blur-md border border-slate-200/80 p-2 rounded-xl shadow-xs">
        {/* View Mode Switcher */}
        <div className="flex items-center p-0.5 bg-slate-100/90 rounded-lg">
          <button
            id="view-mode-slider"
            onClick={() => setViewMode("slider")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === "slider"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Divisor</span>
          </button>

          <button
            id="view-mode-side-by-side"
            onClick={() => setViewMode("side-by-side")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === "side-by-side"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lado a Lado</span>
          </button>

          <button
            id="view-mode-hold"
            onMouseDown={() => setIsHoldingOriginal(true)}
            onMouseUp={() => setIsHoldingOriginal(false)}
            onTouchStart={() => setIsHoldingOriginal(true)}
            onTouchEnd={() => setIsHoldingOriginal(false)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 select-none ${
              isHoldingOriginal
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Segurar Original</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5">
          {/* Copy Prompt */}
          <button
            onClick={handleCopyPrompt}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200/80 flex items-center gap-1.5 transition"
            title="Copiar prompt executado"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline text-emerald-700 font-medium">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">Prompt</span>
              </>
            )}
          </button>

          {/* Use as base for compounding edits */}
          <button
            id="use-as-base-button"
            onClick={onUseAsBase}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg flex items-center gap-1.5 transition"
            title="Usar esta versão como a nova base para novas alterações"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Iterar Versão</span>
          </button>

          {/* Download Edited */}
          <button
            id="download-edited-image"
            onClick={handleDownload}
            className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>

          {/* Fullscreen view */}
          <button
            id="fullscreen-toggle"
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition border border-slate-200/80"
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
          className="relative w-full aspect-16/10 sm:aspect-16/9 bg-slate-900 rounded-2xl border border-slate-200/80 shadow-md select-none touch-none cursor-ew-resize group overflow-hidden"
          onClick={(e) => handleMove(e.clientX)}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-grid-dots"></div>

          {/* Edited / Modified Room Image (Background) */}
          <img
            src={editedImage}
            alt="Ambiente Transformado"
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

          {/* Draggable Divider Line & Knob */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.4)] pointer-events-none transition-all duration-75 ease-out"
            style={{ left: `${sliderPosition}%` }}
          >
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white text-slate-900 rounded-full shadow-lg flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing border border-slate-300 transition-transform hover:scale-110 active:scale-95"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-800" />
            </div>
          </div>

          {/* Minimal Floating Badges */}
          <div className="absolute top-3.5 left-3.5 pointer-events-none z-10">
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs border border-white/10">
              Original
            </span>
          </div>

          <div className="absolute top-3.5 right-3.5 pointer-events-none z-10">
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs border border-white/10 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Transformação v{versionNumber}</span>
            </span>
          </div>

          {/* Hint Overlay */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="px-3 py-1 bg-slate-950/70 backdrop-blur-md text-[10px] text-white/90 rounded-full font-medium shadow-xs border border-white/10">
              Arraste para comparar
            </span>
          </div>
        </div>
      )}

      {/* Side-by-side mode */}
      {viewMode === "side-by-side" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative aspect-16/10 bg-slate-900 rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <img
              src={originalImage}
              alt="Ambiente Original"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold rounded-full uppercase tracking-wider border border-white/10">
              Original
            </div>
          </div>
          <div className="relative aspect-16/10 bg-slate-900 rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <img
              src={editedImage}
              alt="Ambiente Transformado"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold rounded-full uppercase tracking-wider border border-white/10 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Transformação v{versionNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hold mode */}
      {viewMode === "hold" && (
        <div className="relative w-full aspect-16/10 sm:aspect-16/9 bg-slate-900 rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <img
            src={isHoldingOriginal ? originalImage : editedImage}
            alt={isHoldingOriginal ? "Original" : "Transformado"}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain transition-all duration-150"
          />
          <div className="absolute top-3.5 left-3.5">
            <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold rounded-full uppercase tracking-wider border border-white/10">
              {isHoldingOriginal ? "Exibindo Original" : `Exibindo Transformação v${versionNumber}`}
            </span>
          </div>
        </div>
      )}

      {/* Fullscreen Inspector Modal */}
      {isFullscreen && (
        <div
          id="fullscreen-modal"
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-white tracking-wide">
                Inspeção em Alta Resolução
              </span>
              <span className="text-xs font-mono text-slate-400 px-2 py-0.5 bg-slate-800 rounded">
                v{versionNumber}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-2 bg-slate-800 text-white hover:bg-slate-700 rounded-lg border border-slate-700"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-300 min-w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                className="p-2 bg-slate-800 text-white hover:bg-slate-700 rounded-lg border border-slate-700"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-slate-800 text-white hover:bg-slate-700 rounded-lg border border-slate-700 ml-3"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={editedImage}
              alt="Ambiente Fullscreen"
              referrerPolicy="no-referrer"
              style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.15s ease" }}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl border border-slate-800 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

