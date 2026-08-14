import React from "react";
import { Compass, Lightbulb, CheckCircle2, ArrowUpRight, Sparkles } from "lucide-react";
import { RoomAnalysis } from "../types";

interface RoomAnalysisCardProps {
  analysis: RoomAnalysis;
  onApplySuggestion: (suggestionPrompt: string) => void;
  isLoading?: boolean;
}

export const RoomAnalysisCard: React.FC<RoomAnalysisCardProps> = ({
  analysis,
  onApplySuggestion,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl animate-pulse space-y-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-100 rounded-lg" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-16 bg-slate-50 rounded-xl border border-slate-100" />
          <div className="h-16 bg-slate-50 rounded-xl border border-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs text-slate-900">
      {/* Card Header */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
            <Compass className="w-4 h-4 text-slate-800" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide flex items-center space-x-2">
              <span>Diagnóstico do Espaço</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                Gemini 3.7
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              {analysis.roomType || "Ambiente Identificado"} • {analysis.currentStyle || "Estilo Detectado"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Structural elements and lighting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.structuralElements && analysis.structuralElements.length > 0 && (
            <div className="p-3 bg-slate-50/60 border border-slate-200/70 rounded-xl space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Âncoras & Estruturas Preservadas</span>
              </div>
              <ul className="space-y-1 text-slate-600">
                {analysis.structuralElements.map((el, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-slate-400 font-medium">•</span>
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.lightingCondition && (
            <div className="p-3 bg-slate-50/60 border border-slate-200/70 rounded-xl space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5 text-[11px]">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Iluminação & Sombras Mapeadas</span>
              </div>
              <p className="text-slate-600 leading-relaxed">{analysis.lightingCondition}</p>
            </div>
          )}
        </div>

        {/* Smart Suggestions */}
        {analysis.smartSuggestions && analysis.smartSuggestions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sugestões de Design Recomendadas:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.smartSuggestions.map((sug) => (
                <button
                  key={sug.id}
                  id={`sug-btn-${sug.id}`}
                  onClick={() => onApplySuggestion(sug.prompt)}
                  className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-400 rounded-xl text-left transition group flex flex-col justify-between space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider font-mono">
                      {sug.category}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition" />
                  </div>
                  <span className="font-bold text-slate-900 group-hover:text-black line-clamp-1 text-xs">
                    {sug.title}
                  </span>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                    {sug.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

