'use server';

/**
 * @fileOverview Generates a sticker-style birthday card with theme-matched art and razor-sharp message typography.
 *
 * - generateStickerCard - A function that handles the sticker card generation process.
 * - GenerateStickerCardInput - The input type for the generateStickerCard function.
 * - GenerateStickerCardOutput - The return type for the generateStickerCard function.
 */

import {
  fetchOpenSourceImageBuffer,
  createCrispStickerOverlaySvg,
  compositeImageWithTypography,
  renderLocalStickerPng,
  findMatchingCharacter,
  renderCharacterStickerPng,
} from '@/ai/engine';

export interface GenerateStickerCardInput {
  description: string;
  message: string;
}

export interface GenerateStickerCardOutput {
  imageDataUri: string;
}

export async function generateStickerCard(input: GenerateStickerCardInput): Promise<GenerateStickerCardOutput> {
  // 1. Primary: Generate with Free Open-Source Models on Hugging Face (FLUX.1-schnell / SD 3.5 Large Turbo)
  const stickerVisualPrompt = `Cute die-cut sticker illustration of ${input.description}, thick white sticker border outline, vibrant clean vector art style, centered on a soft pastel background, no text, no watermark, high quality, masterpiece`;

  try {
    const bgBuffer = await fetchOpenSourceImageBuffer(stickerVisualPrompt);
    if (bgBuffer && bgBuffer.length > 2000) {
      const overlaySvg = createCrispStickerOverlaySvg({
        description: input.description,
        message: input.message,
      });

      const finalImageUri = await compositeImageWithTypography(bgBuffer, overlaySvg);
      return { imageDataUri: finalImageUri };
    }
  } catch (err) {
    console.warn("Open-source Hugging Face sticker model failed or timed out, switching to local fallback:", err);
  }

  // 2. Offline / Fallback: Check if description matches a character in our local dataset
  const character = findMatchingCharacter(input.description);
  if (character) {
    try {
      const stickerUri = await renderCharacterStickerPng({
        character,
        description: input.description,
        message: input.message,
      });
      return { imageDataUri: stickerUri };
    } catch (err) {
      console.warn("Character sticker fallback rendering error:", err);
    }
  }

  // 3. Guaranteed high-res local sticker generator fallback
  const localImageUri = await renderLocalStickerPng({
    description: input.description,
    message: input.message,
  });

  return { imageDataUri: localImageUri };
}