import React, { useState } from "react";
import { Key, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, ShieldCheck, X } from "lucide-react";
import { ApiKeyStatus } from "../types";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyStatus: ApiKeyStatus;
  onSaveKey: (key: string) => Promise<boolean>;
  onRemoveKey: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKeyStatus,
  onSaveKey,
  onRemoveKey,
}) => {
  const [inputKey, setInputKey] = useState(apiKeyStatus.customKey || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setFeedback({ type: "error", message: "Por favor, digite uma chave de API válida." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const success = await onSaveKey(inputKey.trim());
      if (success) {
        setFeedback({
          type: "success",
          message: "Chave Gemini conectada e validada com sucesso!",
        });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({
          type: "error",
          message: "A chave informada não pôde ser autenticada com a API do Gemini.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erro de conexão ao verificar a chave.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setInputKey("");
    onRemoveKey();
    setFeedback({
      type: "success",
      message: "Chave customizada removida. O sistema usará a chave do servidor se disponível.",
    });
  };

  return (
    <div
      id="api-key-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="api-key-modal-card"
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="api-key-modal-close"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">Chave da API Gemini</h2>
            <p className="text-xs text-slate-500 font-sans">
              Credencial para geração fotorrealista com Google Gemini 3.7
            </p>
          </div>
        </div>

        {/* Current status banner */}
        <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start space-x-3">
          {apiKeyStatus.customKey ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : apiKeyStatus.hasEnvKey ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-0.5">
            <div className="font-semibold text-slate-900 text-xs">
              {apiKeyStatus.customKey
                ? "Chave personalizada ativa"
                : apiKeyStatus.hasEnvKey
                ? "Chave padrão do servidor conectada"
                : "Nenhuma chave configurada"}
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              {apiKeyStatus.customKey
                ? `Usando chave salva no seu navegador (...${apiKeyStatus.customKey.slice(-6)}).`
                : apiKeyStatus.hasEnvKey
                ? "O servidor possui uma chave de ambiente GEMINI_API_KEY ativa."
                : "Insira sua chave do Google AI Studio para ativar as transformações."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Sua Chave de API (Gemini API Key)
            </label>
            <div className="relative">
              <input
                id="gemini-api-key-input"
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-mono text-slate-900 placeholder-slate-400 transition"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center space-x-1.5">
              <span>Obtenha sua chave gratuita em</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-slate-900 font-bold hover:underline inline-flex items-center space-x-0.5"
              >
                <span>Google AI Studio</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </p>
          </div>

          {feedback && (
            <div
              className={`p-3 text-xs flex items-center space-x-2 rounded-xl border ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 space-x-3">
            {apiKeyStatus.customKey && (
              <button
                type="button"
                id="remove-api-key-button"
                onClick={handleClear}
                className="px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                Remover Chave
              </button>
            )}

            <div className="flex items-center space-x-2 ml-auto">
              <button
                type="button"
                id="cancel-api-key-modal"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
              >
                Fechar
              </button>
              <button
                type="submit"
                id="save-api-key-button"
                disabled={isSubmitting || !inputKey.trim()}
                className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition disabled:opacity-50 flex items-center space-x-2 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Validando...</span>
                  </>
                ) : (
                  <span>Salvar & Conectar</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

