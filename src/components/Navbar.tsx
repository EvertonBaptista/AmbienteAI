import React from "react";
import { Key, RotateCcw, History, ShieldCheck, Sparkles } from "lucide-react";
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
  const isKeyActive = Boolean(apiKeyStatus.customKey || apiKeyStatus.hasEnvKey);

  return (
    <header
      id="main-navbar"
      className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 shrink-0 z-30 sticky top-0"
    >
      {/* Brand Identity with Sleek Minimalist Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-slate-900 flex items-center justify-center rounded-xl shrink-0 shadow-xs text-white">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 font-sans">
              AMBIENTE
            </span>
            <span className="text-xs font-bold text-white bg-slate-900 px-1.5 py-0.5 rounded-md tracking-wider">
              AI
            </span>
          </div>
          <span className="text-[10px] tracking-wide text-slate-500 font-medium hidden sm:block">
            Design & Edição Espacial Fotorrealista
          </span>
        </div>
      </div>

      {/* Status Badges & Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Gemini Vision Indicator */}
        <div
          className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
            isKeyActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
              : "bg-amber-50 text-amber-800 border-amber-200/80 animate-pulse"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isKeyActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span className="text-[11px] font-medium hidden sm:inline">
            {isKeyActive ? "Gemini 3.7 Flash Ativo" : "API Pendente"}
          </span>
        </div>

        {/* Perspective Lock Guard Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-slate-700 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-800" />
          <span className="text-[11px] font-medium">Perspectiva Travada 1:1</span>
        </div>

        <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          {historyCount > 0 && (
            <button
              id="toggle-history-button"
              onClick={onToggleHistory}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                showHistory
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Histórico</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
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
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline text-[11px]">Novo Espaço</span>
            </button>
          )}

          {/* API Key Modal Button */}
          <button
            id="open-api-key-modal-button"
            onClick={onOpenKeyModal}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all shadow-xs ${
              apiKeyStatus.customKey
                ? "bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200"
                : apiKeyStatus.hasEnvKey
                ? "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                : "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            <Key className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="hidden lg:inline font-mono text-[11px]">
              {apiKeyStatus.customKey
                ? `Key: ...${apiKeyStatus.customKey.slice(-4)}`
                : apiKeyStatus.hasEnvKey
                ? "API Conectada"
                : "Conectar Chave API"}
            </span>
            <span className="lg:hidden text-[11px]">API</span>
          </button>
        </div>
      </div>
    </header>
  );
};

