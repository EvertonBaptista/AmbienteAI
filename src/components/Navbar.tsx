import React from "react";
import { Key, RotateCcw, History, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ApiKeyStatus } from "../types";

interface NavbarProps {
  apiKeyStatus: ApiKeyStatus;
  onOpenKeyModal: () => void;
  onReset: () => void;
  hasActiveImage: boolean;
  historyCount: number;
  onToggleHistory: () => void;
  showHistory: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiKeyStatus,
  onOpenKeyModal,
  onReset,
  hasActiveImage,
  historyCount,
  onToggleHistory,
  showHistory,
}) => {
  return (
    <header
      id="main-navbar"
      className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-30 sticky top-0"
    >
      {/* Brand Identity with Geometric Icon */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-slate-900 flex items-center justify-center rounded-xs shrink-0 shadow-xs">
          <div className="w-3.5 h-3.5 border-2 border-white rotate-45 transition-transform hover:rotate-90 duration-300"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
            ESTRUTURA <span className="font-light text-slate-400">AI</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium hidden sm:block">
            Architectural Geometry Engine
          </span>
        </div>
      </div>

      {/* Status Badges & Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Gemini Vision Indicator */}
        <div className="flex items-center space-x-2 bg-emerald-50 px-2.5 sm:px-3 py-1.5 rounded-xs border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 tracking-wide uppercase">
            {apiKeyStatus.customKey || apiKeyStatus.hasEnvKey
              ? "Gemini Vision Active"
              : "API Key Pending"}
          </span>
        </div>

        {/* Perspective Lock Tag */}
        <div className="hidden md:flex flex-col items-end text-right border-l border-slate-200 pl-4">
          <span className="text-xs font-medium text-slate-900 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
            Perspective Lock
          </span>
          <span className="text-[10px] text-slate-400 font-mono">100% Geometry Guard</span>
        </div>

        <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {historyCount > 0 && (
            <button
              id="toggle-history-button"
              onClick={onToggleHistory}
              className={`px-3 py-1.5 rounded-xs text-xs font-semibold border flex items-center gap-1.5 transition ${
                showHistory
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Histórico</span>
              <span
                className={`px-1.5 py-0.2 rounded-xs text-[10px] font-mono ${
                  showHistory ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {historyCount}
              </span>
            </button>
          )}

          {hasActiveImage && (
            <button
              id="reset-canvas-button"
              onClick={onReset}
              title="Carregar nova imagem ou reiniciar ambiente"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xs text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Novo</span>
            </button>
          )}

          {/* API Key Modal Button */}
          <button
            id="open-api-key-modal-button"
            onClick={onOpenKeyModal}
            className={`px-3 py-1.5 rounded-xs text-xs font-semibold border flex items-center gap-2 transition ${
              apiKeyStatus.customKey
                ? "bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200"
                : apiKeyStatus.hasEnvKey
                ? "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 animate-pulse"
            }`}
          >
            <Key className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden lg:inline font-mono text-[11px]">
              {apiKeyStatus.customKey
                ? `Key: ...${apiKeyStatus.customKey.slice(-4)}`
                : apiKeyStatus.hasEnvKey
                ? "API Conectada"
                : "Configurar API"}
            </span>
            <span className="lg:hidden text-[11px] uppercase">API</span>
          </button>
        </div>
      </div>
    </header>
  );
};

