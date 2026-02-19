import { GoogleGenAI } from "@google/genai";

// No Vite, usamos import.meta.env e o prefixo VITE_
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Inicializa a IA apenas se a chave existir
const ai = apiKey ? new GoogleGenAI({ apiKey: apiKey }) : null;

export async function getWorldStatus(cycle: number) {
  if (!ai) return "O mundo parece vazio (Chave de API ausente).";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Nome do modelo atualizado (o preview antigo pode falhar)
      contents: [{
        role: "user",
        parts: [{ text: `O jogador está no ciclo ${cycle} de um mundo em ruínas. 
      Descreva brevemente em uma frase curta (português) o que ele sente ou vê nos escombros. 
      Quanto maior o ciclo, mais perturbador e surreal deve ser o texto.` }]
      }],
      config: {
        maxOutputTokens: 50,
        temperature: 0.8,
      }
    });
    return response.response.text()?.trim() || "O silêncio é absoluto.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Algo observa você de longe.";
  }
}