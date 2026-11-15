'use server';

/**
 * @fileOverview Generates a personalized birthday wish using open-source models with an intelligent local generator.
 *
 * - generateWishes - A function that handles the wish generation process.
 * - GenerateWishesInput - The input type for the generateWishes function.
 * - GenerateWishesOutput - The return type for the generateWishes function.
 */

import { fetchOpenSourceText, generateLocalWish } from '@/ai/engine';

const recipientTypes = ['friend', 'mother', 'father', 'sibling', 'partner', 'crush', 'teacher', 'colleague'] as const;
const moodTypes = ['funny', 'emotional', 'poetic', 'formal', 'casual', 'inspirational', 'shayari', 'ghazal'] as const;

export type Recipient = typeof recipientTypes[number];
export type Mood = typeof moodTypes[number];

export interface GenerateWishesInput {
  recipient: Recipient;
  mood: Mood;
  age?: number;
}

export interface GenerateWishesOutput {
  wish: string;
}

export async function generateWishes(input: GenerateWishesInput): Promise<GenerateWishesOutput> {
  const isShayari = input.mood === 'shayari' || input.mood === 'ghazal';
  const ageContext = input.age ? ` The person is turning ${input.age} years old.` : '';
  
  const systemPrompt = isShayari
    ? "You are an expert Urdu and Hindi poet. Write a beautiful birthday shayari or ghazal in Hinglish (Hindi/Urdu written in the Latin/English alphabet). Provide only the wish text."
    : "You are a thoughtful and creative birthday wish writer. Write a fitting birthday wish matching the specified recipient and tone. Provide only the wish text.";

  const userPrompt = `Write a ${input.mood} birthday wish for my ${input.recipient}.${ageContext} Only output the wish, no commentary.`;

  try {
    const aiText = await fetchOpenSourceText(userPrompt, systemPrompt);
    if (aiText && aiText.length > 20) {
      return { wish: aiText };
    }
  } catch (err) {
    console.warn("Open-source text model timed out or failed, using local generator:", err);
  }

  // Reliable local generator fallback
  const localWish = generateLocalWish(input);
  return { wish: localWish };
}
