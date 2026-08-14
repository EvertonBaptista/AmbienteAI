import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGenAIClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Chave da API Gemini não encontrada. Configure a variável GEMINI_API_KEY ou insira sua chave no painel de configurações."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing large JSON payloads (base64 images)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API: Health & Config check
  app.get("/api/health", (req, res) => {
    const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
    res.json({
      status: "ok",
      hasEnvKey,
    });
  });

  // API: Validate custom or environment API key
  app.post("/api/check-api-key", async (req, res) => {
    try {
      const customKey = req.headers["x-gemini-api-key"] as string | undefined;
      const client = getGenAIClient(customKey);

      // Lightweight test call
      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: "Responda apenas 'OK'",
      });

      res.json({
        valid: true,
        message: "Chave API validada com sucesso!",
        preview: response.text?.trim() || "OK",
      });
    } catch (error: any) {
      console.error("API Key validation error:", error);
      res.status(400).json({
        valid: false,
        error: error.message || "Falha ao validar chave da API do Gemini.",
      });
    }
  });

  // API: Analyze room structure and architectural elements
  app.post("/api/analyze-room", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg" } = req.body;
      const customKey = req.headers["x-gemini-api-key"] as string | undefined;

      if (!imageBase64) {
        return res.status(400).json({ error: "Nenhuma imagem foi fornecida." });
      }

      const client = getGenAIClient(customKey);
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const prompt = `Você é um arquiteto de interiores e especialista em renderização 3D fotorrealista.
Analise detalhadamente esta imagem do ambiente e retorne um JSON estritamente estruturado com:
1. "roomType": Tipo de ambiente (ex: Sala de Estar, Quarto de Casal, Cozinha Americana, Varanda Gourmet, Home Office).
2. "currentStyle": Estilo arquitetônico e decorativo atual identificado (ex: Contemporâneo, Minimalista, Rústico, Industrial, Clássico).
3. "structuralElements": Array com os principais elementos estruturais que DEVEM ser preservados (ex: "Janela ampla com luz natural à esquerda", "Pé-direito de 2,80m", "Viga aparente no teto", "Ponto de iluminação central").
4. "lightingCondition": Descrição da iluminação (direção da luz natural, temperatura de cor, sombras presentes).
5. "materialsIdentified": Materiais atuais (piso de madeira cumaru, paredes brancas foscas, bancada de granito, etc.).
6. "smartSuggestions": Array com 6 sugestões de edição específicas e realistas que valorizam o ambiente preservando a estrutura (cada uma com "id", "title", "prompt", "category" sendo uma de: "Piso", "Paredes", "Iluminação", "Mobiliário", "Decoração", "Estilo Completo").

Responda APENAS com JSON válido.`;

      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      let analysisData;
      try {
        analysisData = JSON.parse(responseText);
      } catch (parseError) {
        analysisData = { rawAnalysis: responseText };
      }

      res.json(analysisData);
    } catch (error: any) {
      console.error("Room analysis error:", error);
      res.status(500).json({
        error: error.message || "Erro ao analisar o ambiente com IA.",
      });
    }
  });

  // API: Edit room environment preserving structural coherence, lighting, and perspective
  app.post("/api/edit-room", async (req, res) => {
    try {
      const {
        imageBase64,
        mimeType = "image/jpeg",
        prompt: userPrompt,
        aspectRatio = "1:1",
        imageQuality = "high", // 'high' | 'fast'
        preservationRules = {
          preservePerspective: true,
          preserveLighting: true,
          preserveStructuralGeometry: true,
          preserveScale: true,
        },
      } = req.body;

      const customKey = req.headers["x-gemini-api-key"] as string | undefined;

      if (!imageBase64) {
        return res.status(400).json({ error: "Imagem original não fornecida." });
      }

      if (!userPrompt || userPrompt.trim() === "") {
        return res.status(400).json({ error: "Instrução de edição em texto não fornecida." });
      }

      const client = getGenAIClient(customKey);
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      // Architectural preservation system prompt
      const systemEditingPrompt = `You are an expert architectural visualization specialist and high-end interior CGI rendering engine.
Your mission is to perform a photorealistic, in-place scene modification of the room provided in the reference image according to the user's specific request, while strictly obeying architectural consistency.

USER'S EDITING REQUEST:
"${userPrompt}"

MANDATORY ARCHITECTURAL INTEGRITY RULES:
1. GEOMETRY & PERSPECTIVE: Maintain the exact camera viewpoint, angle of view, vanishing points, eye-level horizon line, and room dimensions. Do NOT tilt, rotate, stretch, or warp the room geometry.
2. LIGHTING & SHADOWS: Preserve the original natural and artificial lighting setup. Light coming from windows must cast shadows in the exact same direction and angle. Specular reflections on floors, glass, metals, and polished surfaces must physically correspond to the existing light sources and new materials.
3. SCALE & PROPORTIONS: All newly added or replaced furniture, textures, and decorative items must be scaled with exact realism according to human ergonomics and the room's proportions (e.g., standard chair seat height 45cm, table height 75cm, ceiling height reference).
4. PRESERVATION OF NON-MODIFIED ELEMENTS: Any wall, ceiling, doorway, window, piece of furniture, or fixture not requested to be changed must remain identical to the original reference photo.
5. MATERIAL REALISM: Render ultra-realistic physical textures (e.g., authentic wood grain, porcelain grout lines, woven linen fabrics, micro-reflections, subtle surface roughness) with no AI artifacts, no cartoonish rendering, and zero geometric distortions.

Produce the resulting modified room photograph in the highest architectural photorealism quality.`;

      // Select model based on quality option
      const modelName = imageQuality === "high" ? "gemini-3.1-flash-image" : "gemini-3.1-flash-lite-image";

      let generatedImageUrl: string | null = null;
      let modelExplanation: string = "";

      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: systemEditingPrompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: (aspectRatio as any) || "1:1",
              ...(modelName === "gemini-3.1-flash-image" ? { imageSize: "1K" } : {}),
            },
          },
        });

        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || "image/png";
              generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
            } else if (part.text) {
              modelExplanation += part.text + " ";
            }
          }
        }
      } catch (primaryError: any) {
        console.warn(`Primary model ${modelName} failed or threw:`, primaryError?.message);
        
        // If high quality failed (e.g. tier constraint), attempt fallback with flash-lite-image
        if (modelName === "gemini-3.1-flash-image") {
          console.log("Retrying with fallback gemini-3.1-flash-lite-image...");
          const fallbackResponse = await client.models.generateContent({
            model: "gemini-3.1-flash-lite-image",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: cleanBase64,
                  },
                },
                {
                  text: systemEditingPrompt,
                },
              ],
            },
          });

          const fbCandidate = fallbackResponse.candidates?.[0];
          if (fbCandidate?.content?.parts) {
            for (const part of fbCandidate.content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const mime = part.inlineData.mimeType || "image/png";
                generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
              } else if (part.text) {
                modelExplanation += part.text + " ";
              }
            }
          }
        } else {
          throw primaryError;
        }
      }

      if (!generatedImageUrl) {
        throw new Error(
          modelExplanation || "O modelo processou o pedido mas não retornou uma imagem válida. Verifique as instruções ou tente reformular o prompt."
        );
      }

      res.json({
        success: true,
        imageUrl: generatedImageUrl,
        notes: modelExplanation.trim(),
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Room editing error:", error);
      res.status(500).json({
        error: error.message || "Erro ao processar a edição do ambiente.",
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudiAI Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
