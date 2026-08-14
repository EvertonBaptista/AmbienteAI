import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { ImageUploader } from "./components/ImageUploader";
import { SceneEditor } from "./components/SceneEditor";
import { ComparisonSlider } from "./components/ComparisonSlider";
import { RoomAnalysisCard } from "./components/RoomAnalysisCard";
import { VersionHistory } from "./components/VersionHistory";
import {
  ApiKeyStatus,
  RoomPreset,
  RoomAnalysis,
  EditVersion,
  PreservationSettings,
} from "./types";
import {
  AlertCircle,
  CheckCircle2,
  Wand2,
  Loader2,
} from "lucide-react";

export default function App() {
  // API Key State
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>({
    hasEnvKey: false,
    customKey: null,
    isValidated: false,
    isTesting: false,
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Active Image and Preset State
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>("image/jpeg");
  const [activePreset, setActivePreset] = useState<RoomPreset | null>(null);

  // Room Analysis State
  const [roomAnalysis, setRoomAnalysis] = useState<RoomAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Edit Generation State
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:3" | "16:9" | "3:4" | "9:16">("16:9");
  const [imageQuality, setImageQuality] = useState<"high" | "fast">("high");
  const [preservationSettings, setPreservationSettings] = useState<PreservationSettings>({
    preservePerspective: true,
    preserveLighting: true,
    preserveStructuralGeometry: true,
    preserveScale: true,
  });

  // History of Edits
  const [editHistory, setEditHistory] = useState<EditVersion[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(-1);
  const [showHistory, setShowHistory] = useState(false);

  // Notifications / Errors
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Initialize: Check server health and localStorage for custom key
  useEffect(() => {
    const initApp = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        const storedKey = localStorage.getItem("studiai_gemini_key");

        setApiKeyStatus((prev) => ({
          ...prev,
          hasEnvKey: Boolean(data.hasEnvKey),
          customKey: storedKey || null,
          isValidated: Boolean(data.hasEnvKey || storedKey),
        }));
      } catch (err) {
        console.error("Health check failed:", err);
      }
    };
    initApp();
  }, []);

  // Save custom API key
  const handleSaveApiKey = async (key: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/check-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": key,
        },
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        localStorage.setItem("studiai_gemini_key", key);
        setApiKeyStatus((prev) => ({
          ...prev,
          customKey: key,
          isValidated: true,
          error: undefined,
        }));
        setSuccessToast("Chave Gemini API conectada com sucesso!");
        setTimeout(() => setSuccessToast(null), 4000);
        return true;
      } else {
        throw new Error(data.error || "Chave inválida");
      }
    } catch (err: any) {
      console.error("Key verification error:", err);
      return false;
    }
  };

  // Remove custom API key
  const handleRemoveApiKey = () => {
    localStorage.removeItem("studiai_gemini_key");
    setApiKeyStatus((prev) => ({
      ...prev,
      customKey: null,
      isValidated: prev.hasEnvKey,
    }));
  };

  // Handle image selection (Uploaded or Preset)
  const handleSelectImage = (
    base64Data: string,
    mimeType: string,
    presetInfo?: RoomPreset
  ) => {
    setOriginalImage(base64Data);
    setOriginalMimeType(mimeType);
    setActivePreset(presetInfo || null);
    setEditHistory([]);
    setCurrentVersionIndex(-1);
    setRoomAnalysis(null);
    setErrorMessage(null);

    if (presetInfo) {
      setAspectRatio(presetInfo.aspectRatio as any);
      if (presetInfo.samplePrompts && presetInfo.samplePrompts.length > 0) {
        setCurrentPrompt(presetInfo.samplePrompts[0]);
      }
    } else {
      setCurrentPrompt("");
    }
  };

  // Run Room Diagnostic / Analysis with Gemini 3.7 Flash
  const handleAnalyzeRoom = async () => {
    if (!originalImage) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKeyStatus.customKey) {
        headers["x-gemini-api-key"] = apiKeyStatus.customKey;
      }

      const res = await fetch("/api/analyze-room", {
        method: "POST",
        headers,
        body: JSON.stringify({
          imageBase64: originalImage,
          mimeType: originalMimeType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao analisar o ambiente.");
      }

      setRoomAnalysis(data);
      setSuccessToast("Diagnóstico arquitetônico gerado com sucesso!");
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setErrorMessage(err.message || "Não foi possível analisar o ambiente com IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit Room Scene Modification
  const handleSubmitEdit = async () => {
    if (!originalImage) {
      setErrorMessage("Por favor, selecione ou envie uma foto do ambiente primeiro.");
      return;
    }
    if (!currentPrompt.trim()) {
      setErrorMessage("Por favor, descreva as alterações desejadas para o cenário.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationStep("Calculando geometria e vetor de iluminação natural...");

    const stepTimer1 = setTimeout(() => {
      setGenerationStep("Preservando escala dos objetos e perspectiva do ambiente...");
    }, 2500);

    const stepTimer2 = setTimeout(() => {
      setGenerationStep("Renderizando novos materiais e texturas fotorrealistas...");
    }, 5500);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKeyStatus.customKey) {
        headers["x-gemini-api-key"] = apiKeyStatus.customKey;
      }

      const sourceImage =
        currentVersionIndex >= 0 && editHistory[currentVersionIndex]
          ? editHistory[currentVersionIndex].editedImageUrl
          : originalImage;

      const res = await fetch("/api/edit-room", {
        method: "POST",
        headers,
        body: JSON.stringify({
          imageBase64: sourceImage,
          mimeType: originalMimeType,
          prompt: currentPrompt.trim(),
          aspectRatio,
          imageQuality,
          preservationRules: preservationSettings,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.imageUrl) {
        throw new Error(data.error || "Erro ao gerar a edição do ambiente.");
      }

      const newVersion: EditVersion = {
        id: `version-${Date.now()}`,
        versionNumber: editHistory.length + 1,
        prompt: currentPrompt.trim(),
        originalImageUrl: originalImage,
        editedImageUrl: data.imageUrl,
        timestamp: data.timestamp || new Date().toISOString(),
        aspectRatio,
        imageQuality,
        notes: data.notes,
      };

      const updatedHistory = [...editHistory, newVersion];
      setEditHistory(updatedHistory);
      setCurrentVersionIndex(updatedHistory.length - 1);
      setSuccessToast(`Edição v${newVersion.versionNumber} gerada com sucesso!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      console.error("Scene edit error:", err);
      setErrorMessage(
        err.message ||
          "Não foi possível processar a edição. Verifique sua chave da API Gemini nas configurações."
      );
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Use the current result as base for future compounding edits
  const handleUseAsBase = () => {
    if (currentVersionIndex >= 0 && editHistory[currentVersionIndex]) {
      const currentEdit = editHistory[currentVersionIndex];
      setOriginalImage(currentEdit.editedImageUrl);
      setSuccessToast(
        "A versão editada agora é a foto base para novas modificações!"
      );
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  // Reset Canvas
  const handleReset = () => {
    setOriginalImage(null);
    setActivePreset(null);
    setEditHistory([]);
    setCurrentVersionIndex(-1);
    setRoomAnalysis(null);
    setCurrentPrompt("");
    setErrorMessage(null);
  };

  const activeVersion =
    currentVersionIndex >= 0 && editHistory[currentVersionIndex]
      ? editHistory[currentVersionIndex]
      : null;

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-slate-900 flex flex-col antialiased selection:bg-slate-900 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        apiKeyStatus={apiKeyStatus}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onReset={handleReset}
        hasActiveImage={Boolean(originalImage)}
        historyCount={editHistory.length}
        onToggleHistory={() => setShowHistory(!showHistory)}
        showHistory={showHistory}
      />

      {/* Global Toast Notifications */}
      {successToast && (
        <div className="fixed top-18 right-4 z-50 p-3.5 bg-white text-slate-900 border border-slate-900 shadow-xl flex items-center space-x-2.5 text-xs font-mono uppercase tracking-wider animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorMessage && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-white border-l-4 border-l-rose-600 border border-slate-200 text-slate-900 text-xs flex items-start justify-between space-x-3 shadow-xs">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block uppercase text-[10px] tracking-wider text-rose-800">
                  Atenção no Processamento
                </strong>
                <span className="text-slate-700">{errorMessage}</span>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-slate-500 hover:text-slate-900 text-xs font-mono uppercase tracking-wider px-2 py-0.5 border border-slate-200"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!originalImage ? (
          /* Step 1: Upload or Choose Preset */
          <ImageUploader onSelectImage={handleSelectImage} />
        ) : (
          /* Step 2: Active Workspace with Editor & Comparisons */
          <div className="space-y-6">
            {/* Version History Drawer */}
            {showHistory && editHistory.length > 0 && (
              <VersionHistory
                versions={editHistory}
                currentVersionIndex={currentVersionIndex}
                onSelectVersion={(idx) => setCurrentVersionIndex(idx)}
                onClearHistory={() => {
                  setEditHistory([]);
                  setCurrentVersionIndex(-1);
                }}
              />
            )}

            {/* Split Grid: Left (Editor & Diagnostics) | Right (Viewer & Comparisons) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Scene Prompt & Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <SceneEditor
                  currentPrompt={currentPrompt}
                  onChangePrompt={setCurrentPrompt}
                  onSubmitEdit={handleSubmitEdit}
                  isGenerating={isGenerating}
                  onAnalyzeRoom={handleAnalyzeRoom}
                  isAnalyzing={isAnalyzing}
                  aspectRatio={aspectRatio}
                  onChangeAspectRatio={setAspectRatio}
                  imageQuality={imageQuality}
                  onChangeQuality={setImageQuality}
                  preservationSettings={preservationSettings}
                  onChangePreservationSettings={setPreservationSettings}
                  hasAnalysis={Boolean(roomAnalysis)}
                />

                {/* Architectural Analysis Card */}
                {roomAnalysis && (
                  <RoomAnalysisCard
                    analysis={roomAnalysis}
                    onApplySuggestion={(sugPrompt) => {
                      setCurrentPrompt(sugPrompt);
                    }}
                    isLoading={isAnalyzing}
                  />
                )}
              </div>

              {/* Right Column: Visual Comparison & Output (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {isGenerating ? (
                  /* Loading State in Geometric Balance Style */
                  <div className="relative w-full aspect-16/10 bg-[#EBEDF0] border border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-xs">
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-grid-dots"></div>
                    <div className="relative w-16 h-16 flex items-center justify-center bg-white border border-slate-300 shadow-xs">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
                    </div>
                    <div className="space-y-2 max-w-md z-10">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                        Processando Geometria do Ambiente
                      </h3>
                      <p className="text-xs text-slate-600 font-mono">
                        {generationStep || "Calculando perspectiva e iluminação com Gemini..."}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                        Preservação estrutural • Ângulo focal travado
                      </p>
                    </div>
                  </div>
                ) : activeVersion ? (
                  /* Interactive Comparison Slider */
                  <ComparisonSlider
                    originalImage={activeVersion.originalImageUrl}
                    editedImage={activeVersion.editedImageUrl}
                    promptText={activeVersion.prompt}
                    onUseAsBase={handleUseAsBase}
                    versionNumber={activeVersion.versionNumber}
                  />
                ) : (
                  /* Initial Room Preview with Guide Overlay */
                  <div className="relative w-full aspect-16/10 sm:aspect-16/9 bg-[#EBEDF0] border border-slate-200 overflow-hidden shadow-xs group">
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-grid-dots"></div>
                    <img
                      src={originalImage}
                      alt="Ambiente Selecionado"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Top Tag */}
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <span className="bg-black/80 text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest">
                        {activePreset ? activePreset.title : "Foto Original do Ambiente"}
                      </span>
                    </div>

                    {/* Bottom Guide Prompt */}
                    <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/95 backdrop-blur-xs border border-slate-200 text-xs text-slate-700 space-y-1 shadow-xs">
                      <div className="font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 text-[11px]">
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Pronto para Edição Fotorrealista</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                        Descreva as alterações desejadas no painel ao lado (ex: troca de piso, novas cores, móveis ou luminárias) e clique em "Processar Imagem".
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500 font-mono">
        <p>
          ESTRUTURA • Plataforma de Edição Arquitetônica & Preservação Fotorrealista com Google Gemini
        </p>
      </footer>

      {/* API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKeyStatus={apiKeyStatus}
        onSaveKey={handleSaveApiKey}
        onRemoveKey={handleRemoveApiKey}
      />
    </div>
  );
}

