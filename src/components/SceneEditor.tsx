import React, { useState } from "react";
import {
  Wand2,
  Sliders,
  Send,
  Loader2,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { QUICK_CATEGORIES } from "../data/presets";
import { PreservationSettings } from "../types";

interface SceneEditorProps {
  currentPrompt: string;
  onChangePrompt: (prompt: string) => void;
  onSubmitEdit: () => void;
  isGenerating: boolean;
  onAnalyzeRoom: () => void;
  isAnalyzing: boolean;
  aspectRatio: "1:1" | "4:3" | "16:9" | "3:4" | "9:16";
  onChangeAspectRatio: (ratio: "1:1" | "4:3" | "16:9" | "3:4" | "9:16") => void;
  imageQuality: "high" | "fast";
  onChangeQuality: (quality: "high" | "fast") => void;
  preservationSettings: PreservationSettings;
  onChangePreservationSettings: (settings: PreservationSettings) => void;
  hasAnalysis: boolean;
}

export const SceneEditor: React.FC<SceneEditorProps> = ({
  currentPrompt,
  onChangePrompt,
  onSubmitEdit,
  isGenerating,
  onAnalyzeRoom,
  isAnalyzing,
  aspectRatio,
  onChangeAspectRatio,
  imageQuality,
  onChangeQuality,
  preservationSettings,
  onChangePreservationSettings,
  hasAnalysis,
}) => {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("pisos");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeCategory = QUICK_CATEGORIES.find((c) => c.id === selectedCategoryTab) || QUICK_CATEGORIES[0];

  const handleAppendPrompt = (addition: string) => {
    if (!currentPrompt.trim()) {
      onChangePrompt(addition);
    } else {
      onChangePrompt(`${currentPrompt}. ${addition}`);
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-6 shadow-xs text-slate-900 space-y-6">
      {/* Top Header & Analyze Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
            3. Instruções de Edição
          </label>
          <h2 className="text-sm font-bold text-slate-900">Prompt do Ambiente</h2>
        </div>

        <button
          id="analyze-room-btn"
          onClick={onAnalyzeRoom}
          disabled={isAnalyzing || isGenerating}
          className={`px-3 py-1.5 rounded-xs text-xs font-semibold border flex items-center gap-1.5 transition ${
            hasAnalysis
              ? "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
              : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900" />
              <span className="text-[11px] uppercase tracking-wider font-mono">Analisando...</span>
            </>
          ) : (
            <>
              <Compass className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-[11px] uppercase tracking-wider font-mono">
                {hasAnalysis ? "Recalcular Diagnóstico" : "Diagnosticar Espaço"}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Main Text Prompt Input Area */}
      <div className="space-y-2">
        <div className="relative">
          <textarea
            id="scene-edit-prompt-input"
            value={currentPrompt}
            onChange={(e) => onChangePrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onSubmitEdit();
              }
            }}
            placeholder="Ex: Remova o tapete antigo e substitua por um tapete de fibras naturais. Adicione uma poltrona no canto direito mantendo a iluminação e perspectiva da janela..."
            rows={3}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-slate-900 placeholder-slate-400 transition resize-none leading-relaxed"
          />
          {currentPrompt && (
            <button
              onClick={() => onChangePrompt("")}
              className="absolute top-2.5 right-2.5 text-[10px] uppercase font-bold text-slate-400 hover:text-slate-700 px-2 py-0.5 bg-white border border-slate-200"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
            <span className="text-[10px] uppercase">PERSPECTIVE & SHADOW GUARD ACTIVE</span>
          </div>
          <span className="text-[10px]">Ctrl + Enter para gerar</span>
        </div>
      </div>

      {/* Quick Category Chips */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Adições Rápidas de Materiais & Elementos:
          </label>
          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 max-w-[65%]">
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryTab(cat.id)}
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition shrink-0 ${
                  selectedCategoryTab === cat.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Category Items */}
        <div className="flex flex-wrap gap-1.5">
          {activeCategory.items.map((item, index) => (
            <button
              key={index}
              id={`quick-item-${index}`}
              onClick={() => handleAppendPrompt(item.prompt)}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 text-slate-700 text-xs transition flex items-center gap-1"
            >
              <span className="text-slate-400 font-mono">+</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings & Quality Controls */}
      <div className="pt-2 border-t border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition uppercase tracking-wider text-[11px]"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Configurações Avançadas</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qualidade:</span>
            <div className="flex items-center border border-slate-200 bg-slate-50 p-0.5 text-xs">
              <button
                onClick={() => onChangeQuality("high")}
                className={`px-2 py-0.5 text-[10px] uppercase font-bold transition ${
                  imageQuality === "high"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1K HD
              </button>
              <button
                onClick={() => onChangeQuality("fast")}
                className={`px-2 py-0.5 text-[10px] uppercase font-bold transition ${
                  imageQuality === "fast"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Fast
              </button>
            </div>
          </div>
        </div>

        {showAdvanced && (
          <div className="p-4 bg-slate-50 border border-slate-200 space-y-4 text-xs animate-in fade-in duration-200">
            {/* Aspect Ratio */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Proporção da Imagem (Aspect Ratio)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(["1:1", "4:3", "16:9", "3:4", "9:16"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => onChangeAspectRatio(ratio)}
                    className={`py-1.5 px-1 text-center font-mono text-xs font-bold transition border ${
                      aspectRatio === ratio
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Preservation Toggles */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Travamento Estrutural & Geométrico
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 p-2 bg-white border border-slate-200 text-slate-800 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={preservationSettings.preservePerspective}
                    onChange={(e) =>
                      onChangePreservationSettings({
                        ...preservationSettings,
                        preservePerspective: e.target.checked,
                      })
                    }
                    className="accent-slate-900"
                  />
                  <span>Travar perspectiva e pontos de fuga</span>
                </label>

                <label className="flex items-center space-x-2 p-2 bg-white border border-slate-200 text-slate-800 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={preservationSettings.preserveLighting}
                    onChange={(e) =>
                      onChangePreservationSettings({
                        ...preservationSettings,
                        preserveLighting: e.target.checked,
                      })
                    }
                    className="accent-slate-900"
                  />
                  <span>Preservar iluminação e direção das sombras</span>
                </label>

                <label className="flex items-center space-x-2 p-2 bg-white border border-slate-200 text-slate-800 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={preservationSettings.preserveStructuralGeometry}
                    onChange={(e) =>
                      onChangePreservationSettings({
                        ...preservationSettings,
                        preserveStructuralGeometry: e.target.checked,
                      })
                    }
                    className="accent-slate-900"
                  />
                  <span>Manter janelas, portas e paredes</span>
                </label>

                <label className="flex items-center space-x-2 p-2 bg-white border border-slate-200 text-slate-800 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={preservationSettings.preserveScale}
                    onChange={(e) =>
                      onChangePreservationSettings({
                        ...preservationSettings,
                        preserveScale: e.target.checked,
                      })
                    }
                    className="accent-slate-900"
                  />
                  <span>Garantir escala ergonômica de mobília</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Submit Button matching Geometric Balance Theme */}
      <button
        id="generate-scene-button"
        onClick={onSubmitEdit}
        disabled={isGenerating || !currentPrompt.trim()}
        className="w-full py-4 bg-slate-900 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Processando Geometria...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            <span>Processar Imagem</span>
          </>
        )}
      </button>
    </div>
  );
};

