import React from "react";
import { Compass, Lightbulb, CheckCircle2, ArrowUpRight } from "lucide-react";
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
      <div className="p-6 bg-white border border-slate-200 animate-pulse space-y-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-100" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-100 w-1/3" />
            <div className="h-3 bg-slate-100 w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-16 bg-slate-50 border border-slate-100" />
          <div className="h-16 bg-slate-50 border border-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 overflow-hidden shadow-xs text-slate-900">
      {/* Card Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Compass className="w-4 h-4 text-slate-700" />
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <span>Diagnóstico Geométrico & Arquitetônico</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-800 font-mono">
                Gemini 3.7 Flash
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {analysis.roomType || "Ambiente Identificado"} • {analysis.currentStyle || "Estilo Detectado"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Structural elements and lighting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.structuralElements && analysis.structuralElements.length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5 text-[10px] uppercase tracking-widest">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
                <span>Âncoras & Estruturas Preservadas</span>
              </div>
              <ul className="space-y-1 text-slate-600">
                {analysis.structuralElements.map((el, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-slate-400 font-mono">•</span>
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.lightingCondition && (
            <div className="p-3 bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5 text-[10px] uppercase tracking-widest">
                <Lightbulb className="w-3.5 h-3.5 text-slate-900" />
                <span>Iluminação & Sombras Mapeadas</span>
              </div>
              <p className="text-slate-600 leading-relaxed">{analysis.lightingCondition}</p>
            </div>
          )}
        </div>

        {/* Smart Suggestions */}
        {analysis.smartSuggestions && analysis.smartSuggestions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Sugestões Coerentes para este Espaço:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.smartSuggestions.map((sug) => (
                <button
                  key={sug.id}
                  id={`sug-btn-${sug.id}`}
                  onClick={() => onApplySuggestion(sug.prompt)}
                  className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 text-left transition group flex flex-col justify-between space-y-1.5"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] uppercase font-bold text-slate-900 tracking-wider font-mono">
                      {sug.category}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition" />
                  </div>
                  <span className="font-bold text-slate-900 group-hover:text-black line-clamp-1 text-xs">
                    {sug.title}
                  </span>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
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

