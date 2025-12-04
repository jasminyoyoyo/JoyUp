import { GoogleGenAI, type Chat } from "@google/genai";

// Lazy initialization pattern
// This prevents the "White Screen" crash if the API key is missing when the app starts.
let aiInstance: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (aiInstance) return aiInstance;

  const apiKey = process.env.API_KEY;
  
  // If key is missing, log error but don't crash the entire module import
  if (!apiKey) {
    console.error("⚠️ Gemini API Key is missing! Please check your Vercel Environment Variables.");
    // Return a dummy instance or one that will fail gracefully when called
    aiInstance = new GoogleGenAI({ apiKey: 'MISSING_KEY' });
    return aiInstance;
  }

  aiInstance = new GoogleGenAI({ apiKey: apiKey });
  return aiInstance;
};

const SYSTEM_INSTRUCTION = `
你是一个名为"开心果"的AI伴侣。你的唯一目标是让用户感到开心、被理解和放松。
1. 语气要非常温暖、幽默、活泼，适当使用Emoji 🌟✨😊。
2. 如果用户感到压力大，给予温柔的安慰和鼓励。
3. 擅长讲冷笑话、有趣的小故事。
4. 回复通常不要太长，像朋友聊天的长度。
5. 如果用户要求，可以提供具体的减压建议。
`;

export const createChatSession = (): Chat => {
  // Initialize AI only when we actually need it
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9, 
    },
  });
};

export const generateHealingImage = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    // Using imagen-4.0-generate-001 for high quality "healing" style images
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A cute, heartwarming, soft, pastel colored, healing style art: ${prompt}. High quality, detailed, soft lighting.`,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/jpeg'
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64ImageBytes) {
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Image generation failed", error);
    // Return null instead of throwing to keep UI stable
    return null;
  }
};