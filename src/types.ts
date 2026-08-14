export interface RoomPreset {
  id: string;
  title: string;
  roomType: string;
  style: string;
  imageUrl: string;
  aspectRatio: "1:1" | "4:3" | "16:9" | "3:4";
  lightingDescription: string;
  samplePrompts: string[];
}

export interface SmartSuggestion {
  id: string;
  title: string;
  prompt: string;
  category: "Piso" | "Paredes" | "Iluminação" | "Mobiliário" | "Decoração" | "Estilo Completo";
}

export interface RoomAnalysis {
  roomType?: string;
  currentStyle?: string;
  structuralElements?: string[];
  lightingCondition?: string;
  materialsIdentified?: string[];
  smartSuggestions?: SmartSuggestion[];
  rawAnalysis?: string;
}

export interface EditVersion {
  id: string;
  versionNumber: number;
  prompt: string;
  originalImageUrl: string;
  editedImageUrl: string;
  timestamp: string;
  aspectRatio: "1:1" | "4:3" | "16:9" | "3:4" | "9:16";
  imageQuality: "high" | "fast";
  notes?: string;
}

export interface PreservationSettings {
  preservePerspective: boolean;
  preserveLighting: boolean;
  preserveStructuralGeometry: boolean;
  preserveScale: boolean;
}

export interface ApiKeyStatus {
  hasEnvKey: boolean;
  customKey: string | null;
  isValidated: boolean;
  isTesting: boolean;
  error?: string;
}
