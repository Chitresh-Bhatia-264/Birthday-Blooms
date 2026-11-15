'use server';

/**
 * @fileOverview Generates a high-quality birthday card image with matched theme visuals and razor-sharp typography.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {
  getThemeVisualPrompt,
  fetchOpenSourceImageBuffer,
  createCrispCardOverlaySvg,
  compositeImageWithTypography,
  renderLocalCardPng,
  findMatchingCharacter,
  renderCharacterCardPng,
} from '@/ai/engine';

export type FontStyle = 'calligraphy' | 'handwritten' | 'playful' | 'modern';

export interface GenerateImageInput {
  theme: string;
  message: string;
  fontStyle: FontStyle;
}

export interface GenerateImageOutput {
  imageDataUri: string;
}

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  // 1. Primary: Generate with Free Open-Source Models on Hugging Face (FLUX.1-schnell / SD 3.5 Large Turbo)
  const visualPrompt = getThemeVisualPrompt(input.theme);

  try {
    const bgBuffer = await fetchOpenSourceImageBuffer(visualPrompt);
    if (bgBuffer && bgBuffer.length > 2000) {
      const overlaySvg = createCrispCardOverlaySvg({
        theme: input.theme,
        message: input.message,
        fontStyle: input.fontStyle,
      });

      const finalImageUri = await compositeImageWithTypography(bgBuffer, overlaySvg);
      return { imageDataUri: finalImageUri };
    }
  } catch (err) {
    console.warn("Open-source Hugging Face image model failed or timed out, switching to local fallback:", err);
  }

  // 2. Offline / Fallback: Check if theme matches a character in our local dataset
  const character = findMatchingCharacter(input.theme);
  if (character) {
    try {
      const characterCardUri = await renderCharacterCardPng({
        character,
        theme: input.theme,
        message: input.message,
        fontStyle: input.fontStyle,
      });
      return { imageDataUri: characterCardUri };
    } catch (err) {
      console.warn("Character fallback rendering error:", err);
    }
  }

  // 3. Guaranteed high-res local generative fallback (no API, 100% sharp)
  const localImageUri = await renderLocalCardPng({
    theme: input.theme,
    message: input.message,
    fontStyle: input.fontStyle,
  });

  return { imageDataUri: localImageUri };
}
