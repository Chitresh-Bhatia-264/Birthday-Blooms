'use server';

/**
 * @fileOverview Generates a card idea based on a personality quiz using open-source models with local fallback.
 *
 * - generatePersonalityCard - A function that handles the personality card generation process.
 * - GeneratePersonalityCardInput - The input type for the generatePersonalityCard function.
 * - GeneratePersonalityCardOutput - The return type for the generatePersonalityCard function.
 */

import { fetchOpenSourceText, generateLocalPersonalityCard } from '@/ai/engine';

export interface GeneratePersonalityCardInput {
  hobby: string;
  personality: string;
  humor: string;
  snack: string;
}

export interface GeneratePersonalityCardOutput {
  theme: string;
  message: string;
}

export async function generatePersonalityCard(input: GeneratePersonalityCardInput): Promise<GeneratePersonalityCardOutput> {
  const systemPrompt = `You are a creative assistant that designs personalized birthday cards from quiz answers (hobby, personality type, humor style, snack). Output strict JSON with keys "theme" and "message".`;
  const userPrompt = `Quiz details:\nHobby: ${input.hobby}\nPersonality: ${input.personality}\nHumor: ${input.humor}\nSnack: ${input.snack}\n\nOutput strict JSON: {"theme": "...", "message": "..."}`;

  try {
    const aiResponse = await fetchOpenSourceText(userPrompt, systemPrompt);
    if (aiResponse) {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.theme && parsed.message) {
          return {
            theme: String(parsed.theme).trim(),
            message: String(parsed.message).trim(),
          };
        }
      }
    }
  } catch (err) {
    console.warn("Open-source personality model timed out or failed, using local generator:", err);
  }

  // Reliable local generator fallback
  return generateLocalPersonalityCard(input);
}
