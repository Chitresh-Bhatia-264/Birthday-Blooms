'use server';

/**
 * @fileOverview Translates a birthday message to a specified language using open-source models with local linguistic fallback.
 *
 * - generateTranslation - A function that handles the translation process.
 * - GenerateTranslationInput - The input type for the generateTranslation function.
 * - GenerateTranslationOutput - The return type for the generateTranslation function.
 */

import { fetchOpenSourceText, generateLocalTranslation } from '@/ai/engine';

export interface GenerateTranslationInput {
  message: string;
  language: string;
}

export interface GenerateTranslationOutput {
  translatedMessage: string;
}

const LANGUAGE_CODES: Record<string, string> = {
  english: 'en',
  spanish: 'es',
  hindi: 'hi',
  urdu: 'ur',
  french: 'fr',
  german: 'de',
};

function detectSourceLang(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0600-\u06FF]/.test(text)) return 'ur';
  const lower = text.toLowerCase();
  if (/[ñ¡¿]|\b(cumpleaños|feliz|te deseo)\b/i.test(lower)) return 'es';
  if (/\b(joyeux|anniversaire|félicitations|journée)\b/i.test(lower)) return 'fr';
  if (/[äöüß]|\b(geburtstag|alles gute|wünsche)\b/i.test(lower)) return 'de';
  return 'en';
}

async function translateWithMyMemory(text: string, targetLangName: string): Promise<string | null> {
  const targetCode = LANGUAGE_CODES[targetLangName.toLowerCase().trim()];
  if (!targetCode) return null;

  const sourceCode = detectSourceLang(text);
  if (sourceCode === targetCode) return text;

  try {
    // Preserve trailing emojis and line structure
    const lines = text.split('\n');
    const translatedLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        translatedLines.push('');
        continue;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${sourceCode}|${targetCode}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const data = (await res.json()) as {
        responseStatus?: number;
        responseData?: { translatedText?: string };
      };

      const translated = data?.responseData?.translatedText?.trim();
      if (!translated || data?.responseStatus === 429) return null;
      translatedLines.push(translated);
    }

    const joined = translatedLines.join('\n').trim();
    return joined.length > 0 ? joined : null;
  } catch {
    return null;
  }
}

export async function generateTranslation(input: GenerateTranslationInput): Promise<GenerateTranslationOutput> {
  // 1. Primary: Fast, accurate MyMemory translation (preserves exact user message & multiline format, no API key)
  const memoryTranslation = await translateWithMyMemory(input.message, input.language);
  if (memoryTranslation) {
    return { translatedMessage: memoryTranslation };
  }

  // 2. Secondary: Open-source LLM translation
  const systemPrompt = `You are a professional multilingual translator. Translate the following birthday message accurately into ${input.language}. Preserve the exact meaning, warmth, and emojis. Provide ONLY the direct translated text without quotation marks or explanations.`;
  const userPrompt = `Message: "${input.message}"\nTranslate into: ${input.language}`;

  try {
    const aiTranslation = await fetchOpenSourceText(userPrompt, systemPrompt);
    if (aiTranslation && aiTranslation.length > 5) {
      return { translatedMessage: aiTranslation };
    }
  } catch (err) {
    console.warn("Open-source translation model timed out or failed, using local translation:", err);
  }

  // 3. Reliable local fallback
  return {
    translatedMessage: generateLocalTranslation(input.message, input.language),
  };
}
