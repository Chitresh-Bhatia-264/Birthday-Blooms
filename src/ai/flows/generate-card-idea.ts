'use server';

/**
 * @fileOverview Generates a card idea (theme and message) from a user prompt using open-source models with local fallback.
 *
 * - generateCardIdea - A function that handles the card idea generation process.
 * - GenerateCardIdeaInput - The input type for the generateCardIdea function.
 * - GenerateCardIdeaOutput - The return type for the generateCardIdea function.
 */

import { fetchOpenSourceText, generateLocalCardIdea } from '@/ai/engine';

export interface GenerateCardIdeaInput {
  prompt: string;
}

export interface GenerateCardIdeaOutput {
  theme: string;
  message: string;
}

export async function generateCardIdea(input: GenerateCardIdeaInput): Promise<GenerateCardIdeaOutput> {
  const systemPrompt = `You are a creative assistant that designs personalized birthday cards. Given a user idea, suggest a short descriptive theme (3-7 words) and a personalized message. Output strictly JSON with keys "theme" and "message".`;
  const userPrompt = `User request: "${input.prompt}". Output strict JSON: {"theme": "...", "message": "..."}`;

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
    console.warn("Open-source idea model timed out or failed, using local generator:", err);
  }

  // Reliable local generator fallback
  return generateLocalCardIdea(input.prompt);
}