/**
 * Birthday Bloom - Open-Source & Local AI Generative Engine
 * 
 * Provides:
 * 1. High-Resolution visual generation using open-source GAN & Diffusion models (SDXL Turbo, Flux, SANA).
 * 2. Exact adherence to user-provided descriptions (e.g. "A happy unicorn on cake").
 * 3. Crystal-clear, razor-sharp typography composited at 1024x1024 PNG resolution using Sharp.
 * 4. 100% reliable local generator fallback (offline / zero-API mode).
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as opentype from 'opentype.js';

const execFileAsync = promisify(execFile);

let cachedFont: any;
function getBundledFont(): any {
  if (cachedFont !== undefined) return cachedFont;
  try {
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Poppins-Bold.ttf');
    if (fs.existsSync(fontPath)) {
      cachedFont = opentype.loadSync(fontPath);
      return cachedFont;
    }
  } catch {
    // Fallback to SVG text if font loading fails
  }
  cachedFont = null;
  return null;
}

function renderSvgTextPath(options: {
  text: string;
  centerX: number;
  y: number;
  fontSize: number;
  fill: string;
  fontFamily?: string;
  fontStyleAttr?: string;
  fontWeight?: string;
  filterAttr?: string;
}): string {
  const { text, centerX, y, fontSize, fill, fontFamily = 'Arial, sans-serif', fontStyleAttr = '', fontWeight = 'bold', filterAttr = '' } = options;
  const font = getBundledFont();
  if (font) {
    // Use vector glyph paths for all characters supported by Poppins-Bold (eliminates □□□ on Linux/Vercel)
    const allSupported = Array.from(text).every((ch) => ch === ' ' || font.charToGlyphIndex(ch) !== 0);
    if (allSupported) {
      const width = font.getAdvanceWidth(text, fontSize);
      const x = centerX - width / 2;
      const pathData = font.getPath(text, x, y, fontSize).toPathData(2);
      if (pathData) {
        return `<path d="${pathData}" fill="${fill}" ${filterAttr} />`;
      }
    }
  }
  return `<text x="${centerX}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${fontSize}" font-family="${fontFamily}" ${fontStyleAttr} font-weight="${fontWeight}" ${filterAttr}>${escapeXml(text)}</text>`;
}

// Helper to wrap text into multiple lines
export function wrapText(text: string, maxCharsPerLine: number = 32): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.length > 0 ? lines : [text];
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// -------------------------------------------------------------
// THEME VISUAL PROMPT GENERATOR (ACCURATE & CUSTOM-AWARE)
// -------------------------------------------------------------

const PRESET_THEMES: Record<string, string> = {
  'confetti and balloons': 'Festive celebration with metallic gold, pastel pink and sky blue balloons floating in the air, sparkling falling confetti, festive party ribbons, bright cheerful celebratory lighting, 8k render',
  'cakes and candles': 'Magnificent luxury 3-tier birthday cake adorned with glowing lit candles, warm golden bokeh candlelight, intricate confectionary frosting, celebratory party ambiance, 8k shallow depth of field',
  'birthday presents': 'Luxuriously wrapped birthday gift boxes with rich satin bows and golden ribbons, festive ambient glow, sparkles in the air, elegant celebration atmosphere, 8k',
  'party hats and streamers': 'Festive birthday party scene with colorful spiral streamers, decorative party hats with pom-poms, celebration confetti bursts, joyful lively lighting, 8k',
  'colorful typography': 'Vibrant pop-art celebration background, energetic geometric shapes, colorful confetti explosion, modern festive aesthetic, 8k wallpaper',
  'best friend forever': 'Heartwarming celebratory atmosphere with warm golden fairy lights, glowing celebration sparkles, joyous party aesthetic, cinematic lighting, 8k',
  'for mom/dad': 'Warm elegant royal golden celebration aesthetic, glowing amber fairy lights, warm loving ambiance, sophisticated luxury celebration background, 8k',
  'romantic': 'Romantic atmosphere with glowing velvet crimson hearts, soft golden bokeh lights, delicate floating ribbons, warm intimate dreamlike cinematic lighting, 8k',
  'watercolor backgrounds': 'Artistic masterpiece pastel watercolor wash, soft blended splashes of magenta, turquoise, and gold leaf pigment textures, luxury greeting card background, delicate paint stains',
  'minimalistic white space': 'Minimalist high-end luxury background with delicate gold geometric borders, warm off-white marble texture, clean architectural studio lighting, 8k',
  'floral elegance': 'Exquisite lush bouquet of blooming roses, peonies, and golden eucalyptus branches framing a luxury card background, soft natural lighting, botanical masterpiece, 8k',
  'gaming theme': 'Cinematic cyberpunk gaming room with neon glowing arcade monitors, futuristic gaming setup, vibrant purple, magenta and cyan neon atmospheric lighting, 8k 3D render, masterpiece wallpaper, clean celebratory background',
  'starry night galaxy': 'Breathtaking deep space cosmic galaxy nebula, millions of twinkling stars, glowing constellations, celestial golden crescent moon, cosmic dust clouds, ultra detailed 8k cinematic wallpaper',
  'magical forest': 'Enchanted fantasy forest with glowing mystical flora, whimsical fireflies, bioluminescent moss and ancient trees, magical atmospheric lighting, 8k',
  'fairy tale castle': 'Grand fairy tale castle with glowing spires under a starry twilight purple sunset, magical fantasy kingdom, dreamy cinematic lighting, 8k',
};

export function getThemeVisualPrompt(theme: string): string {
  const t = theme.toLowerCase().trim();

  // If the user selected an exact preset button, use the refined preset prompt
  if (PRESET_THEMES[t]) {
    return `${PRESET_THEMES[t]}, no text, no words, no watermark`;
  }

  // If the user typed their own custom theme (e.g. "A happy unicorn on cake"):
  // Keep their EXACT words as the primary subject so the model generates precisely what they asked for!
  return `Vibrant 8k digital illustration of ${theme}, joyful birthday celebration aesthetic, centered subject in upper two-thirds of frame, crisp details, rich colors, warm cinematic lighting, clean background, no text, no words, no watermark`;
}

// -------------------------------------------------------------
// OPEN CHARACTER & SUBJECT DATASET REGISTRY
// -------------------------------------------------------------

export interface CharacterEntry {
  id: string;
  name: string;
  emoji: string;
  keywords: string[];
  file: string;
  bgGradient: { c1: string; c2: string; c3: string };
  accentColor: string;
  badgeText: string;
  lightTheme?: boolean;
}

export const CHARACTER_REGISTRY: CharacterEntry[] = [
  {
    id: 'mickey',
    name: 'MICKEY MOUSE',
    emoji: '★',
    keywords: ['mickey', 'mickey mouse', 'disney mickey', 'micky', 'mickeymouse'],
    file: 'mickey-mouse.png',
    bgGradient: { c1: '#be185d', c2: '#881337', c3: '#1f020a' },
    accentColor: '#f59e0b',
    badgeText: '★ MICKEY MOUSE ★',
  },
  {
    id: 'minnie',
    name: 'MINNIE MOUSE',
    emoji: '🎀',
    keywords: ['minnie', 'minnie mouse', 'disney minnie', 'minniemouse'],
    file: 'minnie-mouse.png',
    bgGradient: { c1: '#f43f5e', c2: '#be123c', c3: '#4c0519' },
    accentColor: '#fbbf24',
    badgeText: '🎀 MINNIE MOUSE 🎀',
  },
  {
    id: 'unicorn',
    name: 'MAGICAL UNICORN',
    emoji: '🦄',
    keywords: ['unicorn', 'unicorn on cake', 'happy unicorn', 'magical unicorn'],
    file: 'unicorn-cake.svg',
    bgGradient: { c1: '#fae8ff', c2: '#f5d0fe', c3: '#fdf4ff' },
    accentColor: '#a855f7',
    badgeText: '🦄 MAGICAL UNICORN CAKE 🦄',
    lightTheme: true,
  },
  {
    id: 'spiderman',
    name: 'SPIDER-MAN',
    emoji: '🕷️',
    keywords: ['spider', 'spiderman', 'spider-man', 'spider man', 'marvel'],
    file: 'spiderman.svg',
    bgGradient: { c1: '#dc2626', c2: '#991b1b', c3: '#1e1b4b' },
    accentColor: '#38bdf8',
    badgeText: '🕷️ SPIDER-MAN 🕷️',
  },
  {
    id: 'pikachu',
    name: 'PIKACHU',
    emoji: '⚡',
    keywords: ['pikachu', 'pokemon', 'pika'],
    file: 'pikachu.svg',
    bgGradient: { c1: '#fef08a', c2: '#fde047', c3: '#eab308' },
    accentColor: '#ef4444',
    badgeText: '⚡ PIKACHU CELEBRATION ⚡',
    lightTheme: true,
  },
  {
    id: 'dinosaur',
    name: 'DINO PARTY',
    emoji: '🦕',
    keywords: ['dino', 'dinosaur', 't-rex', 'jurassic', 'trex'],
    file: 'dinosaur.svg',
    bgGradient: { c1: '#15803d', c2: '#166534', c3: '#052e16' },
    accentColor: '#facc15',
    badgeText: '🦕 DINO CELEBRATION 🦕',
  },
  {
    id: 'cake',
    name: 'BIRTHDAY CAKE',
    emoji: '🎂',
    keywords: ['cake', 'candles', 'cupcake', 'birthday cake', 'tiered cake', 'chocolate cake'],
    file: 'birthday-cake.svg',
    bgGradient: { c1: '#701a75', c2: '#4a044e', c3: '#18021c' },
    accentColor: '#f59e0b',
    badgeText: '🎂 LUXURY BIRTHDAY CAKE 🎂',
  },
  {
    id: 'teddy',
    name: 'TEDDY BEAR',
    emoji: '🧸',
    keywords: ['teddy', 'teddy bear', 'bear', 'plushie'],
    file: 'teddy-bear.svg',
    bgGradient: { c1: '#fef3c7', c2: '#fde68a', c3: '#fcd34d' },
    accentColor: '#b45309',
    badgeText: '🧸 SWEET TEDDY BEAR 🧸',
    lightTheme: true,
  },
  {
    id: 'astronaut',
    name: 'SPACE EXPLORER',
    emoji: '🚀',
    keywords: ['astronaut', 'space', 'galaxy', 'planet', 'rocket', 'cosmic'],
    file: 'astronaut.svg',
    bgGradient: { c1: '#1e1b4b', c2: '#0f172a', c3: '#020617' },
    accentColor: '#38bdf8',
    badgeText: '🚀 SPACE BIRTHDAY ADVENTURE 🚀',
  },
];

export function findMatchingCharacter(query: string): CharacterEntry | null {
  const q = query.toLowerCase().trim();
  for (const c of CHARACTER_REGISTRY) {
    if (c.keywords.some((k) => q.includes(k))) {
      return c;
    }
  }
  return null;
}

export async function renderCharacterCardPng(options: {
  character: CharacterEntry;
  theme: string;
  message: string;
  fontStyle: 'calligraphy' | 'handwritten' | 'playful' | 'modern';
}): Promise<string> {
  const { character, message, fontStyle } = options;
  const charPath = path.join(process.cwd(), 'public', 'characters', character.file);

  if (!fs.existsSync(charPath)) {
    return renderLocalCardPng(options);
  }

  const charBuf = fs.readFileSync(charPath);
  const resizedChar = await sharp(charBuf)
    .resize(520, 520, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const isLight = character.lightTheme;
  const plaqueBg = isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(15, 23, 42, 0.88)';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subtextColor = isLight ? '#64748b' : '#fbbf24';

  let fontFamily = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  let fontStyleAttr = "";
  let fontWeight = "bold";

  if (fontStyle === 'calligraphy') {
    fontFamily = "'Brush Script MT', 'Dancing Script', 'Great Vibes', Georgia, cursive";
    fontStyleAttr = 'font-style="italic"';
    fontWeight = "normal";
  } else if (fontStyle === 'handwritten') {
    fontFamily = "'Caveat', 'Comic Sans MS', 'Chalkboard SE', cursive";
    fontWeight = "bold";
  } else if (fontStyle === 'playful') {
    fontFamily = "'Fredoka', 'Trebuchet MS', 'Arial Black', sans-serif";
    fontWeight = "bold";
  } else {
    fontFamily = "'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif";
    fontWeight = "600";
  }

  const messageLines = wrapText(message, 30);
  const plaqueHeight = Math.max(180, Math.min(380, 100 + (messageLines.length * 42)));
  const plaqueY = 1000 - plaqueHeight - 24;
  const textStartY = plaqueY + 95;

  const messageTextSvg = messageLines.map((line, idx) => {
    return `<text x="512" y="${textStartY + (idx * 38)}" text-anchor="middle" fill="${textColor}" font-size="26" font-family="${fontFamily}" ${fontStyleAttr} font-weight="${fontWeight}">${escapeXml(line)}</text>`;
  }).join('\n');

  const bgSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="38%" r="72%">
        <stop offset="0%" stop-color="${character.bgGradient.c1}" />
        <stop offset="50%" stop-color="${character.bgGradient.c2}" />
        <stop offset="100%" stop-color="${character.bgGradient.c3}" />
      </radialGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="50%" stop-color="#fef08a" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" fill="url(#bg)" />
    <!-- Festive Confetti -->
    <circle cx="160" cy="180" r="10" fill="#fbbf24" opacity="0.8" />
    <circle cx="860" cy="220" r="12" fill="#38bdf8" opacity="0.8" />
    <circle cx="200" cy="380" r="8" fill="#f43f5e" opacity="0.8" />
    <circle cx="820" cy="400" r="9" fill="#4ade80" opacity="0.8" />
    <rect x="250" y="110" width="16" height="8" rx="2" fill="#fbbf24" transform="rotate(30 250 110)" opacity="0.75" />
    <rect x="760" y="130" width="16" height="8" rx="2" fill="#a78bfa" transform="rotate(-25 760 130)" opacity="0.75" />
    <rect x="28" y="28" width="968" height="968" rx="24" fill="none" stroke="${character.accentColor}" stroke-width="3" opacity="0.75" />
  </svg>`;

  const bgBuf = await sharp(Buffer.from(bgSvg)).resize(1024, 1024).png().toBuffer();

  const overlaySvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="${isLight ? '0.25' : '0.65'}" />
      </filter>
    </defs>
    <!-- Top Badge -->
    <g transform="translate(512, 72)" filter="url(#shadow)">
      <rect x="-220" y="-24" width="440" height="48" rx="24" fill="${plaqueBg}" stroke="${character.accentColor}" stroke-width="2.5" />
      <text x="0" y="8" text-anchor="middle" fill="${character.accentColor}" font-size="19" font-family="'Montserrat', Arial, sans-serif" font-weight="bold" letter-spacing="3">
        ${character.badgeText}
      </text>
    </g>
    <!-- Message Plaque -->
    <g filter="url(#shadow)">
      <rect x="92" y="${plaqueY}" width="840" height="${plaqueHeight}" rx="24" fill="${plaqueBg}" stroke="${character.accentColor}" stroke-width="2.5" />
      <text x="512" y="${plaqueY + 55}" text-anchor="middle" fill="${character.accentColor}" font-size="24" font-family="'Montserrat', Arial, sans-serif" font-weight="bold" letter-spacing="3">
        ★ HAPPY BIRTHDAY ★
      </text>
      <line x1="392" y1="${plaqueY + 72}" x2="632" y2="${plaqueY + 72}" stroke="${character.accentColor}" stroke-width="1.5" />
      ${messageTextSvg}
      <text x="512" y="${plaqueY + plaqueHeight - 20}" text-anchor="middle" fill="${subtextColor}" font-size="16" font-family="Arial, sans-serif">
        ✨ Wishing you a joyful and magical celebration! ✨
      </text>
    </g>
  </svg>`;

  const finalCard = await sharp(bgBuf)
    .composite([
      { input: resizedChar, top: 150, left: 252 },
      { input: Buffer.from(overlaySvg), top: 0, left: 0 }
    ])
    .png({ quality: 95 })
    .toBuffer();

  return `data:image/png;base64,${finalCard.toString('base64')}`;
}

export async function renderCharacterStickerPng(options: {
  character: CharacterEntry;
  description: string;
  message: string;
}): Promise<string> {
  const { character, message } = options;
  const charPath = path.join(process.cwd(), 'public', 'characters', character.file);

  if (!fs.existsSync(charPath)) {
    return renderLocalStickerPng(options);
  }

  const charBuf = fs.readFileSync(charPath);
  const resizedChar = await sharp(charBuf)
    .resize(500, 500, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const messageLines = wrapText(message, 24);
  const badgeHeight = Math.max(100, Math.min(240, 70 + (messageLines.length * 44)));
  const badgeY = 1000 - badgeHeight - 24;

  const textSvg = messageLines.map((line, idx) => {
    return renderSvgTextPath({
      text: line,
      centerX: 512,
      y: badgeY + 66 + (idx * 44),
      fontSize: 32,
      fill: '#0f172a',
      fontFamily: "'Fredoka', 'Trebuchet MS', Arial, sans-serif",
      fontWeight: 'bold',
    });
  }).join('\n');

  const headerPath = renderSvgTextPath({
    text: 'BIRTHDAY WISH',
    centerX: 512,
    y: badgeY + 30,
    fontSize: 15,
    fill: character.accentColor,
    fontFamily: "'Montserrat', Arial, sans-serif",
    fontWeight: 'bold',
  });

  const bgSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fdf4ff" />
        <stop offset="100%" stop-color="#f0fdf4" />
      </linearGradient>
      <filter id="stickerShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.3" />
      </filter>
    </defs>
    <rect width="1024" height="1024" fill="url(#bg)" />
    <!-- Die-Cut Dashed Border -->
    <rect x="28" y="28" width="968" height="968" rx="24" fill="none" stroke="${character.accentColor}" stroke-width="3" stroke-dasharray="14,10" opacity="0.6" />
    
    <!-- Bottom Message Plaque -->
    <g filter="url(#stickerShadow)">
      <rect x="100" y="${badgeY}" width="824" height="${badgeHeight}" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="3" />
    </g>
    ${headerPath}
    ${textSvg}
  </svg>`;

  const bgBuf = await sharp(Buffer.from(bgSvg)).resize(1024, 1024).png().toBuffer();

  const finalSticker = await sharp(bgBuf)
    .composite([
      { input: resizedChar, top: 160, left: 262 }
    ])
    .webp({ quality: 90 })
    .toBuffer();

  return `data:image/webp;base64,${finalSticker.toString('base64')}`;
}

// -------------------------------------------------------------
// OPEN-SOURCE MODEL CALLERS (GAN & DIFFUSION - NO API KEY)
// -------------------------------------------------------------

export async function fetchOpenSourceText(prompt: string, systemPrompt?: string): Promise<string | null> {
  try {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser request: ${prompt}` : prompt;
    const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=mistral&seed=${Math.floor(Math.random() * 100000)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      const cleaned = text.trim().replace(/^["']|["']$/g, '');
      if (cleaned.length > 0) return cleaned;
    }
  } catch {
    // Fall back to local generator
  }
  return null;
}

async function callHuggingFaceGradioSpace(
  spaceUrl: string,
  dataPayload: unknown[],
  timeoutMs: number = 35000,
  endpoint: string = 'infer'
): Promise<Buffer | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const callRes = await fetch(`${spaceUrl}/gradio_api/call/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: dataPayload }),
      signal: controller.signal,
    });

    if (!callRes.ok) return null;
    const callJson = (await callRes.json()) as { event_id?: string };
    if (!callJson.event_id) return null;

    const streamRes = await fetch(`${spaceUrl}/gradio_api/call/${endpoint}/${callJson.event_id}`, {
      signal: controller.signal,
    });
    if (!streamRes.ok) return null;

    const streamText = await streamRes.text();
    const lines = streamText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('event: complete')) {
        const dataLine = lines[i + 1];
        if (dataLine && dataLine.startsWith('data: ')) {
          const parsed = JSON.parse(dataLine.slice(6));
          const imgUrl = parsed?.[0]?.url || parsed?.[0]?.[0]?.image?.url;
          if (typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
            const imgRes = await fetch(imgUrl, { signal: controller.signal });
            if (imgRes.ok) {
              const arrayBuf = await imgRes.arrayBuffer();
              if (arrayBuf.byteLength > 2000) {
                return Buffer.from(arrayBuf);
              }
            }
          }
        }
      }
    }
  } catch {
    // Model unavailable or timed out
  } finally {
    clearTimeout(timeoutId);
  }

  return null;
}

async function requireBuffer(promise: Promise<Buffer | null>): Promise<Buffer> {
  const buf = await promise;
  if (!buf) throw new Error('No image buffer returned');
  return buf;
}

async function fetchPollinationsImageBuffer(
  prompt: string,
  model: 'flux' | 'turbo' | 'sana' = 'flux',
  timeoutMs: number = 35000,
  size: number = 1024
): Promise<Buffer | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${size}&height=${size}&nologo=true&enhance=true&model=${model}&seed=${seed}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BirthdayBloom/2.0' },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) return null;
    const arrayBuf = await res.arrayBuffer();
    if (arrayBuf.byteLength > 8000) {
      const rawBuf = Buffer.from(arrayBuf);
      // Crop bottom 60px to remove the pollinations.ai corner watermark, then restore 1024x1024
      try {
        const meta = await sharp(rawBuf).metadata();
        const w = meta.width || 1024;
        const h = meta.height || 1024;
        if (h > 120) {
          return await sharp(rawBuf)
            .extract({ left: 0, top: 0, width: w, height: h - 60 })
            .resize(1024, 1024, { fit: 'cover' })
            .png()
            .toBuffer();
        }
      } catch {
        // Return raw buffer if sharp crop fails
      }
      return rawBuf;
    }
  } catch {
    // Pollinations unavailable or timed out
  } finally {
    clearTimeout(timeoutId);
  }

  return null;
}

async function fetchAIHordeImageBuffer(
  prompt: string,
  negPrompt: string,
  timeoutMs: number = 45000
): Promise<Buffer | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const submitRes = await fetch('https://stablehorde.net/api/v2/generate/async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: '0000000000',
        'Client-Agent': 'BirthdayBloom:2.0:anonymous',
      },
      body: JSON.stringify({
        prompt: `${prompt} ### ${negPrompt}`,
        models: ['AlbedoBase XL (SDXL)', 'Deliberate', 'Dreamshaper'],
        params: {
          sampler_name: 'k_euler_a',
          cfg_scale: 7,
          width: 768,
          height: 768,
          steps: 25,
          n: 1,
        },
        nsfw: false,
        censor_nsfw: true,
        r2: true,
      }),
      signal: controller.signal,
    });

    if (!submitRes.ok) return null;
    const submitJson = (await submitRes.json()) as { id?: string };
    if (!submitJson.id) return null;

    for (let i = 0; i < 18; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const checkRes = await fetch(`https://stablehorde.net/api/v2/generate/check/${submitJson.id}`, {
        signal: controller.signal,
      });
      if (!checkRes.ok) continue;
      const check = (await checkRes.json()) as { done?: boolean; faulted?: boolean };
      if (check.faulted) return null;
      if (check.done) {
        const statusRes = await fetch(`https://stablehorde.net/api/v2/generate/status/${submitJson.id}`, {
          signal: controller.signal,
        });
        if (!statusRes.ok) return null;
        const status = (await statusRes.json()) as { generations?: Array<{ img?: string }> };
        const imgUrl = status.generations?.[0]?.img;
        if (imgUrl && imgUrl.startsWith('http')) {
          const imgRes = await fetch(imgUrl, { signal: controller.signal });
          if (imgRes.ok) {
            const arrayBuf = await imgRes.arrayBuffer();
            if (arrayBuf.byteLength > 2000) {
              return Buffer.from(arrayBuf);
            }
          }
        }
        return null;
      }
    }
  } catch {
    // AI Horde unavailable or timed out
  } finally {
    clearTimeout(timeoutId);
  }

  return null;
}

export async function fetchOpenSourceImageBuffer(prompt: string): Promise<Buffer | null> {
  const negPrompt = 'ugly, deformed, blurry, watermark, signature, text, distorted, low quality, extra limbs';
  const isVercel = Boolean(process.env.VERCEL);

  // On Vercel Hobby (10s serverless limit), race all cloud models + fast 768px Pollinations (5.5s max)
  // so real AI images finish before 10s and fallback still has plenty of headroom.
  if (isVercel) {
    try {
      return await Promise.any([
        requireBuffer(
          callHuggingFaceGradioSpace(
            'https://mukaist-midjourney.hf.space',
            [prompt, negPrompt, true, '2560 x 1440', 0, 1024, 1024, 6, true],
            5500,
            'run'
          )
        ),
        requireBuffer(
          callHuggingFaceGradioSpace(
            'https://stabilityai-stable-diffusion-3-5-large-turbo.hf.space',
            [prompt, negPrompt, 0, true, 1024, 1024, 0, 4],
            5500,
            'infer'
          )
        ),
        requireBuffer(
          callHuggingFaceGradioSpace(
            'https://mrfakename-opendallev1-1-gpu-demo.hf.space',
            [prompt, negPrompt, '', '', true, false, false, 0, 1024, 1024, 5, 5, 25, 25, false],
            5500,
            'run'
          )
        ),
        requireBuffer(fetchPollinationsImageBuffer(prompt, 'sana', 5500, 768)),
        requireBuffer(fetchPollinationsImageBuffer(prompt, 'flux', 5500, 768)),
      ]);
    } catch {
      // All cloud tiers timed out within 5.5s -> fall back immediately to instant local renderer
      return null;
    }
  }

  const hfTimeout = 18000;
  const pollTimeout = 35000;
  const fallbackTimeout = 30000;

  // Tier 1: Midjourney-style SDXL
  const midjourneyBuf = await callHuggingFaceGradioSpace(
    'https://mukaist-midjourney.hf.space',
    [prompt, negPrompt, true, '2560 x 1440', 0, 1024, 1024, 6, true],
    hfTimeout,
    'run'
  );
  if (midjourneyBuf) {
    return midjourneyBuf;
  }

  // Tier 2: Stable Diffusion 3.5 Large Turbo
  const sdBuf = await callHuggingFaceGradioSpace(
    'https://stabilityai-stable-diffusion-3-5-large-turbo.hf.space',
    [prompt, negPrompt, 0, true, 1024, 1024, 0, 4],
    hfTimeout,
    'infer'
  );
  if (sdBuf) {
    return sdBuf;
  }

  // Tier 3: OpenDALL-E v1.1
  const dalleBuf = await callHuggingFaceGradioSpace(
    'https://mrfakename-opendallev1-1-gpu-demo.hf.space',
    [prompt, negPrompt, '', '', true, false, false, 0, 1024, 1024, 5, 5, 25, 25, false],
    hfTimeout,
    'run'
  );
  if (dalleBuf) {
    return dalleBuf;
  }

  // Tier 4: Pollinations FLUX (watermark-cropped 1024x1024)
  const pollinationsBuf = await fetchPollinationsImageBuffer(prompt, 'flux', pollTimeout);
  if (pollinationsBuf) {
    return pollinationsBuf;
  }

  // Tier 5: Fallback race (FLUX.1-schnell & AI Horde SDXL) then Local Trained GAN
  try {
    return await Promise.any([
      requireBuffer(
        callHuggingFaceGradioSpace(
          'https://black-forest-labs-flux-1-schnell.hf.space',
          [prompt, 0, true, 1024, 1024, 4],
          fallbackTimeout,
          'infer'
        )
      ),
      requireBuffer(fetchAIHordeImageBuffer(prompt, negPrompt, fallbackTimeout)),
    ]);
  } catch {
    // Cloud fallbacks unavailable
  }

  if (!isVercel) {
    const ganBuf = await generateLocalGanBuffer(prompt);
    if (ganBuf) {
      return ganBuf;
    }
  }

  return null;
}

async function generateLocalGanBuffer(prompt: string): Promise<Buffer | null> {
  try {
    const scriptPath = path.join(process.cwd(), 'gan-studio', 'generate.py');
    const weightsPath = path.join(process.cwd(), 'gan-studio', 'weights', 'birthday_cgan.pth');
    if (!fs.existsSync(scriptPath) || !fs.existsSync(weightsPath)) {
      return null;
    }
    const { stdout } = await execFileAsync('python', [scriptPath, prompt], {
      timeout: 15000,
      maxBuffer: 10 * 1024 * 1024,
    });
    const b64 = stdout.trim();
    if (b64.length > 1000) {
      return Buffer.from(b64, 'base64');
    }
  } catch {
    // Local GAN unavailable
  }
  return null;
}

// -------------------------------------------------------------
// CRYSTAL-CLEAR VECTOR TYPOGRAPHY OVERLAY (1024 x 1024)
// -------------------------------------------------------------

export function createCrispCardOverlaySvg(options: {
  theme: string;
  message: string;
  fontStyle: 'calligraphy' | 'handwritten' | 'playful' | 'modern';
}): string {
  const { theme, message, fontStyle } = options;
  const themeLower = theme.toLowerCase();

  let fontFamily = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  let fontStyleAttr = "";
  let fontWeight = "bold";

  if (fontStyle === 'calligraphy') {
    fontFamily = "'Brush Script MT', 'Dancing Script', 'Great Vibes', Georgia, cursive";
    fontStyleAttr = "font-style=\"italic\"";
    fontWeight = "normal";
  } else if (fontStyle === 'handwritten') {
    fontFamily = "'Caveat', 'Comic Sans MS', 'Chalkboard SE', cursive";
    fontWeight = "bold";
  } else if (fontStyle === 'playful') {
    fontFamily = "'Fredoka', 'Trebuchet MS', 'Arial Black', sans-serif";
    fontWeight = "bold";
  } else {
    fontFamily = "'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif";
    fontWeight = "600";
  }

  let accentColor = "#f59e0b";
  let secondaryColor = "#ec4899";
  let plaqueBg = "rgba(10, 15, 30, 0.82)";
  let plaqueBorder = "rgba(245, 158, 11, 0.65)";
  let textColor = "#ffffff";
  let titleColor = "#fbbf24";

  if (themeLower.includes('minimal') || themeLower.includes('watercolor')) {
    plaqueBg = "rgba(255, 255, 255, 0.90)";
    plaqueBorder = "rgba(219, 39, 119, 0.5)";
    textColor = "#0f172a";
    titleColor = "#be185d";
    accentColor = "#db2777";
  } else if (themeLower.includes('gaming')) {
    accentColor = "#22d3ee";
    secondaryColor = "#f43f5e";
    plaqueBg = "rgba(9, 9, 11, 0.88)";
    plaqueBorder = "#22d3ee";
    titleColor = "#38bdf8";
  } else if (themeLower.includes('romantic') || themeLower.includes('love')) {
    accentColor = "#fb7185";
    secondaryColor = "#f43f5e";
    plaqueBg = "rgba(30, 5, 15, 0.85)";
    plaqueBorder = "#fb7185";
    titleColor = "#fda4af";
  }

  const messageLines = wrapText(message, 30);
  const lineCount = messageLines.length;

  // Position plaque gracefully at the bottom so the subject artwork (top 65%) is fully visible!
  const plaqueHeight = Math.max(180, Math.min(420, 100 + (lineCount * 42)));
  const plaqueY = 1000 - plaqueHeight - 20;

  const textStartY = plaqueY + 95;
  const messageTextSvg = messageLines.map((line, idx) => {
    return renderSvgTextPath({
      text: line,
      centerX: 512,
      y: textStartY + (idx * 38),
      fontSize: 26,
      fill: textColor,
      fontFamily,
      fontStyleAttr,
      fontWeight,
      filterAttr: 'filter="url(#textShadow)"',
    });
  }).join('\n');

  const cardHeaderPath = renderSvgTextPath({
    text: 'HAPPY BIRTHDAY',
    centerX: 512,
    y: plaqueY + 42,
    fontSize: 22,
    fill: titleColor,
    fontFamily: "'Montserrat', Arial, sans-serif",
    fontWeight: 'bold',
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      <filter id="plaqueShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.65" />
      </filter>
      <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.8" />
      </filter>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="50%" stop-color="#fef08a" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>
    </defs>

    <!-- Subtle edge vignette -->
    <rect width="1024" height="1024" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="20" />

    <!-- Outer Decorative Border Frame -->
    <rect x="24" y="24" width="976" height="976" rx="20" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.5" />

    <!-- Corner Accents -->
    <circle cx="24" cy="24" r="7" fill="${accentColor}" />
    <circle cx="1000" cy="24" r="7" fill="${accentColor}" />
    <circle cx="24" cy="1000" r="7" fill="${accentColor}" />
    <circle cx="1000" cy="1000" r="7" fill="${accentColor}" />

    <!-- Central Plaque (position in bottom section to showcase the main AI art!) -->
    <g filter="url(#plaqueShadow)">
      <rect x="80" y="${plaqueY}" width="864" height="${plaqueHeight}" rx="24" fill="${plaqueBg}" stroke="${plaqueBorder}" stroke-width="2" />
    </g>

    <!-- Plaque Header -->
    ${cardHeaderPath}
    <line x1="392" y1="${plaqueY + 60}" x2="632" y2="${plaqueY + 60}" stroke="url(#goldGradient)" stroke-width="1.5" opacity="0.8" />

    <!-- Razor-Sharp Message Lines -->
    ${messageTextSvg}

    <!-- Plaque Footer Accents -->
    <circle cx="492" cy="${plaqueY + plaqueHeight - 20}" r="3.5" fill="${titleColor}" opacity="0.85" />
    <circle cx="512" cy="${plaqueY + plaqueHeight - 20}" r="5" fill="${accentColor}" />
    <circle cx="532" cy="${plaqueY + plaqueHeight - 20}" r="3.5" fill="${titleColor}" opacity="0.85" />
  </svg>`;
}

// -------------------------------------------------------------
// STICKER CARD OVERLAY (1024 x 1024)
// -------------------------------------------------------------

export function createCrispStickerOverlaySvg(options: {
  description: string;
  message: string;
}): string {
  const { message } = options;
  const messageLines = wrapText(message, 24);

  const badgeHeight = Math.max(100, Math.min(240, 70 + (messageLines.length * 44)));
  const badgeY = 1000 - badgeHeight - 20;

  const textSvg = messageLines.map((line, idx) => {
    return renderSvgTextPath({
      text: line,
      centerX: 512,
      y: badgeY + 66 + (idx * 44),
      fontSize: 32,
      fill: '#0f172a',
      fontFamily: "'Fredoka', 'Trebuchet MS', Arial, sans-serif",
      fontWeight: 'bold',
    });
  }).join('\n');

  const stickerHeaderPath = renderSvgTextPath({
    text: 'BIRTHDAY WISH',
    centerX: 512,
    y: badgeY + 30,
    fontSize: 15,
    fill: '#ec4899',
    fontFamily: "'Montserrat', Arial, sans-serif",
    fontWeight: 'bold',
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      <filter id="stickerDrop" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.35" />
      </filter>
    </defs>

    <!-- Outer Decorative Border -->
    <rect x="28" y="28" width="968" height="968" rx="24" fill="none" stroke="#e879f9" stroke-width="3" stroke-dasharray="14,10" opacity="0.6" />

    <!-- Bottom Message Die-Cut Badge -->
    <g filter="url(#stickerDrop)">
      <rect x="100" y="${badgeY}" width="824" height="${badgeHeight}" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="3" />
    </g>

    ${stickerHeaderPath}

    ${textSvg}
  </svg>`;
}

// -------------------------------------------------------------
// HIGH-DEFINITION COMPOSITING ENGINE (AI IMAGE + CRISP TEXT -> PNG)
// -------------------------------------------------------------

export async function compositeImageWithTypography(
  bgBuffer: Buffer,
  overlaySvg: string
): Promise<string> {
  const resultBuffer = await sharp(bgBuffer)
    .resize(1024, 1024, { fit: 'cover', position: 'center' })
    .composite([{ input: Buffer.from(overlaySvg) }])
    .webp({ quality: 90 })
    .toBuffer();

  return `data:image/webp;base64,${resultBuffer.toString('base64')}`;
}

// -------------------------------------------------------------
// HIGH-RESOLUTION LOCAL STANDALONE GENERATORS (OFFLINE / ZERO-API)
// -------------------------------------------------------------

export async function renderLocalCardPng(options: {
  theme: string;
  message: string;
  fontStyle: 'calligraphy' | 'handwritten' | 'playful' | 'modern';
}): Promise<string> {
  const { theme } = options;
  const themeLower = theme.toLowerCase();

  let bgGradient = `
    <radialGradient id="cardBg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#4c1d95" />
      <stop offset="60%" stop-color="#2e1065" />
      <stop offset="100%" stop-color="#0f0728" />
    </radialGradient>
  `;
  let themeElements = "";

  if (themeLower.includes('unicorn')) {
    bgGradient = `
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fdf2f8" />
        <stop offset="50%" stop-color="#fae8ff" />
        <stop offset="100%" stop-color="#f0fdf4" />
      </linearGradient>
    `;
    themeElements = `
      <!-- Unicorn on Cake Graphic -->
      <g transform="translate(512, 320)">
        <!-- Cake Base -->
        <ellipse cx="0" cy="110" rx="190" ry="24" fill="#e2e8f0" opacity="0.9" />
        <path d="M -130,40 C -130,75 130,75 130,40 L 130,100 C 130,135 -130,135 -130,100 Z" fill="#f472b6" />
        <ellipse cx="0" cy="40" rx="130" ry="26" fill="#fbcfe8" />
        <!-- Happy Unicorn sitting on top of Cake -->
        <g transform="translate(0, -30) scale(1.1)">
          <circle cx="0" cy="0" r="65" fill="#ffffff" />
          <polygon points="0,-100 -12,-35 12,-35" fill="#facc15" />
          <path d="M -45,-20 Q -70,20 -30,60" fill="none" stroke="#f472b6" stroke-width="14" stroke-linecap="round" />
          <path d="M -30,-40 Q -55,-5 -15,40" fill="none" stroke="#a78bfa" stroke-width="10" stroke-linecap="round" />
          <path d="M 10,0 Q 25,-12 40,0" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round" />
          <circle cx="32" cy="18" r="10" fill="#f43f5e" opacity="0.35" />
        </g>
      </g>
    `;
  } else if (themeLower.includes('cake') || themeLower.includes('candle')) {
    bgGradient = `
      <radialGradient id="cardBg" cx="50%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#7c2d12" />
        <stop offset="60%" stop-color="#431407" />
        <stop offset="100%" stop-color="#1c0a04" />
      </radialGradient>
    `;
    themeElements = `
      <g transform="translate(512, 260)">
        <ellipse cx="0" cy="90" rx="190" ry="24" fill="#e2e8f0" opacity="0.9" />
        <path d="M -130,20 C -130,55 130,55 130,20 L 130,80 C 130,115 -130,115 -130,80 Z" fill="#ec4899" />
        <ellipse cx="0" cy="20" rx="130" ry="26" fill="#f472b6" />
        <path d="M -90,-40 C -90,-10 90,-10 90,-40 L 90,15 C 90,45 -90,45 -90,15 Z" fill="#8b5cf6" />
        <ellipse cx="0" cy="-40" rx="90" ry="20" fill="#a78bfa" />
        <rect x="-6" y="-140" width="12" height="50" rx="3" fill="#fef08a" />
        <circle cx="0" cy="-165" r="26" fill="#fbbf24" opacity="0.4" />
        <path d="M 0,-182 C 10,-165 8,-150 0,-146 C -8,-150 -10,-165 0,-182 Z" fill="#f59e0b" />
      </g>
    `;
  } else if (themeLower.includes('gaming') || themeLower.includes('game')) {
    bgGradient = `
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#09090b" />
        <stop offset="50%" stop-color="#18181b" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
    `;
    themeElements = `
      <g transform="translate(512, 180) scale(1.3)">
        <rect x="-80" y="-30" width="160" height="60" rx="8" fill="#f43f5e" />
        <text x="0" y="8" text-anchor="middle" fill="#ffffff" font-family="'Courier New', monospace" font-size="22" font-weight="bold">LEVEL UP!</text>
      </g>
    `;
  } else {
    // Default celebration balloons
    themeElements = `
      <g transform="translate(260, 220)">
        <ellipse cx="0" cy="0" rx="65" ry="80" fill="#ec4899" opacity="0.9" />
        <path d="M 0,80 Q -10,130 15,180" fill="none" stroke="#fbcfe8" stroke-width="2.5" />
      </g>
      <g transform="translate(760, 210)">
        <ellipse cx="0" cy="0" rx="68" ry="84" fill="#3b82f6" opacity="0.9" />
        <path d="M 0,84 Q 20,135 -15,190" fill="none" stroke="#93c5fd" stroke-width="2.5" />
      </g>
    `;
  }

  const overlaySvg = createCrispCardOverlaySvg(options);

  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      ${bgGradient}
    </defs>
    <rect width="1024" height="1024" fill="url(#cardBg)" />
    ${themeElements}
    ${overlaySvg.replace(/<\/?svg[^>]*>/g, '')}
  </svg>`;

  try {
    const pngBuf = await sharp(Buffer.from(fullSvg))
      .resize(1024, 1024)
      .png({ quality: 95 })
      .toBuffer();
    return `data:image/png;base64,${pngBuf.toString('base64')}`;
  } catch {
    const base64 = Buffer.from(fullSvg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }
}

export async function renderLocalStickerPng(options: {
  description: string;
  message: string;
}): Promise<string> {
  const { description, message } = options;
  const descLower = description.toLowerCase();

  let stickerArt = "";
  if (descLower.includes('unicorn')) {
    stickerArt = `
      <!-- Unicorn Sticker -->
      <g transform="translate(512, 380) scale(1.4)">
        <circle cx="0" cy="10" r="120" fill="#ffffff" />
        <polygon points="0,-140 -20,-50 20,-50" fill="#ffffff" />
        <circle cx="0" cy="10" r="105" fill="#fdf4ff" />
        <polygon points="0,-125 -14,-45 14,-45" fill="#eab308" />
        <path d="M -70,-30 Q -110,20 -60,80" fill="none" stroke="#f472b6" stroke-width="20" stroke-linecap="round" />
        <path d="M -50,-50 Q -90,0 -40,60" fill="none" stroke="#a78bfa" stroke-width="14" stroke-linecap="round" />
        <path d="M 15,10 Q 35,-5 55,10" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round" />
        <circle cx="45" cy="35" r="14" fill="#f43f5e" opacity="0.35" />
      </g>
    `;
  } else if (descLower.includes('cat') || descLower.includes('kitten')) {
    stickerArt = `
      <g transform="translate(512, 380) scale(1.4)">
        <ellipse cx="0" cy="15" rx="120" ry="105" fill="#ffffff" />
        <ellipse cx="0" cy="15" rx="108" ry="92" fill="#fed7aa" />
        <polygon points="0,-115 -25,-35 25,-35" fill="#ec4899" />
        <circle cx="0" cy="-118" r="10" fill="#fbbf24" />
        <ellipse cx="-40" cy="5" rx="12" ry="16" fill="#1e293b" />
        <ellipse cx="40" cy="5" rx="12" ry="16" fill="#1e293b" />
        <polygon points="0,20 -7,12 7,12" fill="#f43f5e" />
      </g>
    `;
  } else {
    // Cupcake mascot
    stickerArt = `
      <g transform="translate(512, 370) scale(1.4)">
        <path d="M -115,-30 C -115,-100 115,-100 115,-30 L 95,95 C 95,125 -95,125 -95,95 Z" fill="#ffffff" />
        <path d="M -80,5 L -60,90 C -60,105 60,105 60,90 L 80,5 Z" fill="#f59e0b" />
        <path d="M -90,5 C -105,-40 -20,-75 0,-60 C 20,-75 105,-40 90,5 Z" fill="#ec4899" />
        <circle cx="0" cy="-95" r="20" fill="#dc2626" />
      </g>
    `;
  }

  const overlaySvg = createCrispStickerOverlaySvg(options);

  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fdf4ff" />
        <stop offset="100%" stop-color="#f0fdf4" />
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" fill="url(#bg)" />
    ${stickerArt}
    ${overlaySvg.replace(/<\/?svg[^>]*>/g, '')}
  </svg>`;

  try {
    const pngBuf = await sharp(Buffer.from(fullSvg))
      .resize(1024, 1024)
      .png({ quality: 95 })
      .toBuffer();
    return `data:image/png;base64,${pngBuf.toString('base64')}`;
  } catch {
    const base64 = Buffer.from(fullSvg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }
}

// -------------------------------------------------------------
// LOCAL TEXT GENERATION ENGINES (100% RELIABLE OFFLINE/NO-API)
// -------------------------------------------------------------

export function generateLocalWish(input: {
  recipient: string;
  mood: string;
  age?: number;
}): string {
  const { recipient, mood, age } = input;
  const agePhrase = age ? ` on turning ${age}` : '';

  if (mood === 'shayari' || mood === 'ghazal') {
    const shayaris = [
      `Khuda kare har din tera noor se roshan ho,\nZindagi ka har pal khushiyon se aabaad ho.\nJanmadin Mubarak ho mere pyaare ${recipient}!\nYeh saal tere liye kamiyabiyon ki bahaar laaye. 🌸✨`,
      `Dua hai rab se ki teri har khwahish poori ho,\nTere chehre par hamesha muskaan ki dhoop ho.\nSalgirah Mubarak ho! Khuda teri umr daraz kare,\nAur teri zindagi mein bas khushiyon ka basera ho. 🎂💖`,
      `Zameen ke taare bhi aaj tujhe salaam karein,\nHar khushi tere kadmon mein aakar qayaam karein.\nJanamdin ki bohot saari mubarakbaad,\nRab tujhe duniya ki har naymat ataa kare. 🌟🎉`
    ];
    return shayaris[Math.floor(Math.random() * shayaris.length)];
  }

  if (mood === 'funny') {
    const funnyWishes = [
      `Happy Birthday${agePhrase}! Don't worry about getting older—you're not old, you're just a classic! Remember: calories in birthday cake don't count today. Let's celebrate before the fire department gets called for the candles! 🎂😂`,
      `Happy Birthday to my favorite ${recipient}! I was going to make an age joke${age ? ` about turning ${age}` : ''}, but I was worried your hearing might be going. Here's to staying forever young at heart (and slightly mischievous)! 🎉🥂`,
      `Happy Birthday! May your day be filled with lots of love, lots of cake, and zero reminder of your real age${age ? ` (${age})` : ''}. Keep rocking, you legend! 🥳🎈`
    ];
    return funnyWishes[Math.floor(Math.random() * funnyWishes.length)];
  }

  if (mood === 'emotional') {
    const emotionalWishes = [
      `Happy Birthday to the most amazing ${recipient} in the world! Having you in my life is a true blessing. Thank you for always bringing so much warmth, kindness, and love into my days. May this year shower you with all the peace and joy you deserve. 💖✨`,
      `Dearest ${recipient}, wishing you the happiest of birthdays${agePhrase}. Your presence lights up every room and inspires everyone around you. I am endlessly grateful for our bond and hope today brings you as much happiness as you give to others. 🌸🎂`,
      `Happy Birthday! Words can never truly express how much you mean to me as my ${recipient}. May this new chapter bring you deepest contentment, good health, and wonderful dreams fulfilled. 🌟💕`
    ];
    return emotionalWishes[Math.floor(Math.random() * emotionalWishes.length)];
  }

  if (mood === 'poetic') {
    return `Like morning sunlight dancing through the trees,\nMay your special day be gentle as the breeze.\nHappy Birthday to a wonderful ${recipient},\nMay every step ahead be bright and magnificent! 🍃✨🎂`;
  }

  if (mood === 'formal') {
    return `Wishing you a very Happy Birthday${agePhrase}. May this upcoming year be marked by continued success, prosperity, and good health. It is a true pleasure knowing and working with you as an esteemed ${recipient}. Best regards on your celebration! 🥂💼`;
  }

  if (mood === 'inspirational') {
    return `Happy Birthday${agePhrase}! Another year of remarkable courage, resilience, and growth. Keep chasing your dreams fearlessly and shining your light brightly. The world is better because you are in it, and your best chapters are still being written! 🚀🌟🎉`;
  }

  return `Happy Birthday${agePhrase}! Hope your day is as awesome and fun as you are. Wishing you great vibes, good times, and plenty of cake! Cheers to another great year ahead! 🎂🎉🥳`;
}

export function generateLocalCardIdea(prompt: string): { theme: string; message: string } {
  const p = prompt.toLowerCase();

  if (p.includes('sorry') || p.includes('apolog')) {
    return {
      theme: "Gentle Watercolor Apology & Warm Birthday Wishes",
      message: "Happy Birthday! I know things haven't always been perfect, and I'm truly sorry for my mistakes. But today, more than anything, I want to celebrate YOU and the wonderful bond we share. Wishing you joy, peace, and a fresh new chapter full of smiles! 🌸💖"
    };
  }
  if (p.includes('game') || p.includes('gamer')) {
    return {
      theme: "8-Bit Retro Arcade Birthday Level-Up",
      message: "Happy Birthday! Another year conquered, unlimited XP gained, and legendary loot unlocked. May your frame rates stay high and your lag stay zero. Level up in style! 🎮👾✨"
    };
  }
  if (p.includes('mom') || p.includes('mother')) {
    return {
      theme: "Golden Blooms of Love for Mom",
      message: "Happy Birthday, Mom! Thank you for your endless love, your comforting hugs, and your guiding wisdom. You make every day brighter just by being you. Wishing you a year full of relaxation, health, and happiness! 🌷💖"
    };
  }
  if (p.includes('dad') || p.includes('father')) {
    return {
      theme: "Royal Blueprint of Gratitude for Dad",
      message: "Happy Birthday, Dad! Thank you for always being my rock, my guide, and my biggest supporter. Here's to celebrating you and all the greatness you bring to our lives! 🏆🎈"
    };
  }
  if (p.includes('love') || p.includes('romantic') || p.includes('partner')) {
    return {
      theme: "Starry Constellation of Romance & Passion",
      message: "Happy Birthday to my favorite person in the entire universe! Every moment with you is a gift, and today I celebrate the day you came into this world. I love you endlessly! 💖✨🥂"
    };
  }

  const cleanPrompt = prompt.replace(/[^\w\s]/g, '').trim();
  const themeWords = cleanPrompt.split(/\s+/).slice(0, 5).join(' ');
  const theme = themeWords.length > 3 ? `A Celebration of ${themeWords}` : "A Radiant Celebration of Joy";

  return {
    theme,
    message: `Happy Birthday! Today is all about celebrating your unique spirit and the wonderful energy you bring to the world. May this year unfold with exciting adventures, genuine laughter, and every happiness you deserve! 🎂🎉✨`
  };
}

export function generateLocalTimeline(events: Array<{ year: string; description: string }>): { theme: string; message: string } {
  const sorted = [...events].sort((a, b) => parseInt(a.year || '0') - parseInt(b.year || '0'));
  
  const eventLines = sorted.map(e => `• ${e.year}: ${e.description} ✨`).join('\n');
  const message = `Happy Birthday! Let's take a heartwarming walk down memory lane...\n\n${eventLines}\n\nLooking back at all these precious milestones reminds me how incredible our journey has been. Here's to celebrating you today and creating countless more unforgettable memories together! 💖🎂🎉`;

  return {
    theme: "A Nostalgic Journey Through Shared Milestones",
    message
  };
}

export function generateLocalPersonalityCard(input: {
  hobby: string;
  personality: string;
  humor: string;
  snack: string;
}): { theme: string; message: string } {
  const { hobby, personality, humor, snack } = input;

  const theme = `A Cozy ${personality} Haven with ${humor} Humor`;
  const message = `Happy Birthday to the coolest ${personality.toLowerCase()} around! May your special day be filled with hours of ${hobby.toLowerCase()}, a mountain of your go-to ${snack.toLowerCase()}, and plenty of ${humor.toLowerCase()} laughs. Here's to enjoying life on your own awesome terms! 🍿🎮🎂`;

  return { theme, message };
}

export function generateLocalTranslation(message: string, language: string): string {
  const lang = language.toLowerCase();
  
  if (lang.includes('spanish')) {
    return `¡Feliz Cumpleaños! Que este nuevo año de vida te traiga abundante alegría, salud y éxito. ¡Espero que disfrutes al máximo de tu día especial rodeado de tus seres queridos! 🎉🎂`;
  }
  if (lang.includes('hindi')) {
    return `जन्मदिन की हार्दिक शुभकामनाएं! ईश्वर करे आपका यह विशेष दिन और आने वाला साल खुशियों, अच्छी सेहत और ढेर सारी सफलताओं से भरा रहे। खूब आनंद लें! 🌸🎂✨`;
  }
  if (lang.includes('urdu')) {
    return `Salgirah Mubarak ho! Dua hai ke aapka aane wala saal kamiyabiyon, behtareen sehat aur dhero khushiyon se bhara rahe. Yeh din aapke liye bohot barkat wala ho! 🌸💖`;
  }
  if (lang.includes('french')) {
    return `Joyeux Anniversaire ! Que cette journée spéciale soit remplie de joie, d'amour et de beaux moments. Je te souhaite une année formidable pleine de réussite et de bonheur ! 🥂🎂`;
  }
  if (lang.includes('german')) {
    return `Alles Gute zum Geburtstag! Möge dein neues Lebensjahr voller Glück, Gesundheit und unvergesslicher Momente sein. Feiere schön und genieße deinen Tag! 🎈🎂`;
  }

  return message;
}
