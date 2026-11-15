'use server';

/**
 * @fileOverview Generates a timeline-based birthday card idea using open-source models with local storytelling fallback.
 *
 * - generateTimelineCard - A function that handles the timeline card generation process.
 * - GenerateTimelineCardInput - The input type for the generateTimelineCard function.
 * - GenerateTimelineCardOutput - The return type for the generateTimelineCard function.
 */

import { fetchOpenSourceText, generateLocalTimeline } from '@/ai/engine';

export interface TimelineEvent {
  year: string;
  description: string;
}

export interface GenerateTimelineCardInput {
  events: TimelineEvent[];
}

export interface GenerateTimelineCardOutput {
  theme: string;
  message: string;
}

export async function generateTimelineCard(input: GenerateTimelineCardInput): Promise<GenerateTimelineCardOutput> {
  const eventsList = input.events.map(e => `- ${e.year}: ${e.description}`).join('\n');
  const systemPrompt = `You are a creative storyteller who writes nostalgic timeline birthday cards. Weave the provided events into a warm, connected story with emojis and a celebratory wish. Output strict JSON with keys "theme" and "message".`;
  const userPrompt = `Events:\n${eventsList}\n\nOutput strict JSON: {"theme": "A nostalgic 3-7 word theme", "message": "The full birthday timeline message"}`;

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
    console.warn("Open-source timeline model timed out or failed, using local generator:", err);
  }

  // Reliable local generator fallback
  return generateLocalTimeline(input.events);
}
