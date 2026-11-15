import fs from 'fs';
import { generateImage } from './src/ai/flows/generate-image';
import { generateStickerCard } from './src/ai/flows/generate-sticker-card';

async function testMickey() {
  console.log("Testing generateImage with 'Mickey Mouse'...");
  const card = await generateImage({
    theme: "Mickey Mouse",
    message: "Happy Birthday from Mickey!",
    fontStyle: "playful"
  });
  fs.writeFileSync('test-mickey.png', Buffer.from(card.imageDataUri.split(',')[1], 'base64'));
  console.log("Saved test-mickey.png");
}

testMickey();
