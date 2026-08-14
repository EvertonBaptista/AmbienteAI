import React from "react";
import { History, Clock, Check, Trash2 } from "lucide-react";
import { EditVersion } from "../types";

interface VersionHistoryProps {
  versions: EditVersion[];
  currentVersionIndex: number;
  onSelectVersion: (index: number) => void;
  onClearHistory: () => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentVersionIndex,
  onSelectVersion,
  onClearHistory,
}) => {
  if (versions.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 p-4 space-y-3 shadow-xs text-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
            Histórico de Iterações ({versions.length})
          </h3>
        </div>
        <button
          onClick={onClearHistory}
          className="text-[11px] font-mono text-slate-400 hover:text-rose-600 flex items-center space-x-1 transition uppercase tracking-wider"
        >
          <Trash2 className="w-3 h-3" />
          <span>Limpar</span>
        </button>
      </div>

      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
        {versions.map((ver, idx) => {
          const isSelected = currentVersionIndex === idx;
          const time = new Date(ver.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <button
              key={ver.id}
              id={`version-card-${ver.id}`}
              onClick={() => onSelectVersion(idx)}
              className={`shrink-0 w-44 p-2 border text-left transition-all ${
                isSelected
                  ? "bg-slate-100 border-slate-900 ring-1 ring-slate-900"
                  : "bg-white border-slate-200 hover:border-slate-400"
              }`}
            >
              <div className="relative aspect-16/10 overflow-hidden mb-2 bg-slate-100 border border-slate-200">
                <img
                  src={ver.editedImageUrl}
                  alt={`Versão ${ver.versionNumber}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 bg-black/80 text-white font-mono">
                  v{ver.versionNumber}
                </span>
                {isSelected && (
                  <span className="absolute top-1 right-1 p-0.5 bg-slate-900 text-white">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>V.{ver.versionNumber}</span>
                  <span className="flex items-center space-x-0.5">
                    <Clock className="w-2.5 h-2.5" /> {time}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-800 line-clamp-1">
                  {ver.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

