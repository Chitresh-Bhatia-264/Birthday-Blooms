const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'characters');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// 1. Unicorn on Cake
const unicornCakeSvg = `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="horn" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#facc15" />
      <stop offset="100%" stop-color="#eab308" />
    </linearGradient>
    <linearGradient id="mane" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f472b6" />
      <stop offset="50%" stop-color="#c084fc" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
  </defs>
  <ellipse cx="300" cy="540" rx="240" ry="24" fill="#cbd5e1" opacity="0.6" />
  <ellipse cx="300" cy="535" rx="230" ry="20" fill="#f8fafc" />
  <path d="M 120,410 C 120,460 480,460 480,410 L 480,510 C 480,560 120,560 120,510 Z" fill="#ec4899" />
  <ellipse cx="300" cy="410" rx="180" ry="40" fill="#f472b6" />
  <path d="M 120,410 C 140,440 160,420 180,445 C 200,420 230,450 260,425 C 290,455 330,430 360,450 C 390,420 420,445 450,425 C 470,440 480,410 480,410" fill="none" stroke="#fbcfe8" stroke-width="12" stroke-linecap="round" />
  <path d="M 170,320 C 170,360 430,360 430,320 L 430,390 C 430,430 170,430 170,390 Z" fill="#a855f7" />
  <ellipse cx="300" cy="320" rx="130" ry="32" fill="#c084fc" />
  <circle cx="180" cy="390" r="10" fill="#fbbf24" /><circle cx="230" cy="405" r="9" fill="#38bdf8" /><circle cx="280" cy="395" r="10" fill="#4ade80" /><circle cx="330" cy="405" r="10" fill="#f43f5e" /><circle cx="380" cy="395" r="9" fill="#fbbf24" /><circle cx="420" cy="385" r="8" fill="#38bdf8" />
  <g transform="translate(300, 210)">
    <ellipse cx="0" cy="45" rx="80" ry="70" fill="#ffffff" stroke="#f1f5f9" stroke-width="2" />
    <ellipse cx="0" cy="55" rx="55" ry="45" fill="#fdf4ff" />
    <ellipse cx="-48" cy="95" rx="24" ry="18" fill="#ffffff" /><path d="M -60,95 C -60,110 -36,110 -36,95 Z" fill="#facc15" />
    <ellipse cx="48" cy="95" rx="24" ry="18" fill="#ffffff" /><path d="M 36,95 C 36,110 60,110 60,95 Z" fill="#facc15" />
    <circle cx="0" cy="-35" r="70" fill="#ffffff" stroke="#f1f5f9" stroke-width="2" />
    <ellipse cx="0" cy="-10" rx="42" ry="30" fill="#fce7f3" />
    <circle cx="-12" cy="-12" r="4" fill="#f43f5e" /><circle cx="12" cy="-12" r="4" fill="#f43f5e" />
    <path d="M -15,-2 Q 0,10 15,-2" fill="none" stroke="#be185d" stroke-width="3.5" stroke-linecap="round" />
    <path d="M -38,-42 Q -24,-58 -10,-42" fill="none" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round" />
    <path d="M 10,-42 Q 24,-58 38,-42" fill="none" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round" />
    <ellipse cx="-42" cy="-24" rx="14" ry="10" fill="#fda4af" opacity="0.75" />
    <ellipse cx="42" cy="-24" rx="14" ry="10" fill="#fda4af" opacity="0.75" />
    <path d="M -50,-80 C -65,-120 -30,-120 -25,-85 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="2" /><path d="M -45,-85 C -55,-110 -35,-110 -30,-88 Z" fill="#fbcfe8" />
    <path d="M 50,-80 C 65,-120 30,-120 25,-85 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="2" /><path d="M 45,-85 C 55,-110 35,-110 30,-88 Z" fill="#fbcfe8" />
    <path d="M -15,-95 C -65,-75 -75,-25 -65,25 C -75,0 -50,-40 -20,-75 Z" fill="url(#mane)" />
    <path d="M 15,-95 C 65,-75 75,-25 65,25 C 75,0 50,-40 20,-75 Z" fill="url(#mane)" />
    <polygon points="0,-165 -16,-90 16,-90" fill="url(#horn)" />
    <g transform="translate(100, 30)">
      <rect x="-6" y="-50" width="12" height="50" rx="3" fill="#38bdf8" />
      <circle cx="0" cy="-62" r="14" fill="#fbbf24" opacity="0.4" />
      <path d="M 0,-74 C 7,-62 6,-54 0,-52 C -6,-54 -7,-62 0,-74 Z" fill="#f59e0b" />
    </g>
  </g>
</svg>`;

// 2. Spider-Man Vector Graphic
const spidermanSvg = `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="spideyRed" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="70%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#991b1b" />
    </radialGradient>
    <filter id="heroGlow">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>
  <g transform="translate(300, 300)" filter="url(#heroGlow)">
    <!-- Spidey Mask Shape -->
    <path d="M 0,-190 C 130,-190 155,-50 150,50 C 145,150 70,220 0,225 C -70,220 -145,150 -150,50 C -155,-50 -130,-190 0,-190 Z" fill="url(#spideyRed)" stroke="#7f1d1d" stroke-width="4" />
    <!-- Web Pattern Webbing Lines -->
    <!-- Vertical Web lines -->
    <line x1="0" y1="-190" x2="0" y2="225" stroke="#1e293b" stroke-width="3" opacity="0.85" />
    <path d="M 0,-30 Q 80,-100 135,-80" fill="none" stroke="#1e293b" stroke-width="2.5" opacity="0.8" />
    <path d="M 0,-30 Q -80,-100 -135,-80" fill="none" stroke="#1e293b" stroke-width="2.5" opacity="0.8" />
    <path d="M 0,-30 Q 110,-30 148,0" fill="none" stroke="#1e293b" stroke-width="2.5" opacity="0.8" />
    <path d="M 0,-30 Q -110,-30 -148,0" fill="none" stroke="#1e293b" stroke-width="2.5" opacity="0.8" />
    <path d="M 0,-30 Q 110,60 140,90" fill="none" stroke="#1e293b" stroke-width="2.5" opacity="0.8" />
    <path d="M 0,-30 Q -110,60 -140,90" fill="none" stroke="#1e293b" stroke-width="2.5" opacity="0.8" />
    <path d="M 0,-30 Q 80,140 70,200" fill="none" stroke="#1e293b" stroke-width="2.5" opacity="0.8" />
    <path d="M 0,-30 Q -80,140 -70,200" fill="none" stroke="#1e293b" stroke-width="2.5" opacity="0.8" />
    <!-- Web Rings -->
    <circle cx="0" cy="-30" r="45" fill="none" stroke="#1e293b" stroke-width="2.5" opacity="0.8" />
    <circle cx="0" cy="-30" r="95" fill="none" stroke="#1e293b" stroke-width="2.5" opacity="0.8" />
    <circle cx="0" cy="-30" r="150" fill="none" stroke="#1e293b" stroke-width="2.5" opacity="0.8" />
    <!-- Left Eye Outer Black Border -->
    <path d="M -18,-20 C -45,-75 -115,-70 -125,-15 C -130,25 -70,60 -18,15 Z" fill="#0f172a" />
    <!-- Left Eye White Lens -->
    <path d="M -26,-15 C -48,-60 -105,-55 -112,-12 C -116,20 -68,48 -26,10 Z" fill="#ffffff" />
    <!-- Right Eye Outer Black Border -->
    <path d="M 18,-20 C 45,-75 115,-70 125,-15 C 130,25 70,60 18,15 Z" fill="#0f172a" />
    <!-- Right Eye White Lens -->
    <path d="M 26,-15 C 48,-60 105,-55 112,-12 C 116,20 68,48 26,10 Z" fill="#ffffff" />
  </g>
</svg>`;

// 3. Pikachu Vector Graphic
const pikachuSvg = `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="pikaYellow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="60%" stop-color="#facc15" />
      <stop offset="100%" stop-color="#eab308" />
    </radialGradient>
  </defs>
  <g transform="translate(300, 310)">
    <!-- Ears -->
    <!-- Left Ear -->
    <path d="M -70,-110 C -120,-170 -160,-220 -180,-240 C -190,-250 -160,-220 -120,-160 C -90,-120 -60,-80 -40,-60 Z" fill="url(#pikaYellow)" stroke="#ca8a04" stroke-width="3" />
    <path d="M -180,-240 C -170,-225 -155,-215 -140,-200 L -165,-180 Z" fill="#1e293b" />
    <!-- Right Ear -->
    <path d="M 70,-110 C 120,-170 160,-220 180,-240 C 190,-250 160,-220 120,-160 C 90,-120 60,-80 40,-60 Z" fill="url(#pikaYellow)" stroke="#ca8a04" stroke-width="3" />
    <path d="M 180,-240 C 170,-225 155,-215 140,-200 L 165,-180 Z" fill="#1e293b" />
    <!-- Lightning Tail in background -->
    <path d="M 110,80 L 160,30 L 140,10 L 220,-60 L 200,-90 L 260,-140" fill="none" stroke="#eab308" stroke-width="26" stroke-linecap="square" />
    <path d="M 110,80 L 135,55" stroke="#92400e" stroke-width="26" />
    <!-- Body -->
    <ellipse cx="0" cy="80" rx="140" ry="130" fill="url(#pikaYellow)" stroke="#ca8a04" stroke-width="3" />
    <!-- Head -->
    <ellipse cx="0" cy="-40" rx="145" ry="125" fill="url(#pikaYellow)" stroke="#ca8a04" stroke-width="3" />
    <!-- Cheeks (Red Rosy) -->
    <circle cx="-100" cy="0" r="32" fill="#ef4444" />
    <circle cx="100" cy="0" r="32" fill="#ef4444" />
    <!-- Eyes -->
    <circle cx="-55" cy="-55" r="22" fill="#1e293b" />
    <circle cx="-62" cy="-62" r="9" fill="#ffffff" />
    <circle cx="55" cy="-55" r="22" fill="#1e293b" />
    <circle cx="48" cy="-62" r="9" fill="#ffffff" />
    <!-- Tiny Nose -->
    <polygon points="0,-32 -5,-37 5,-37" fill="#1e293b" />
    <!-- Cute Smile -->
    <path d="M -30,-15 Q -15,-5 0,-15 Q 15,-5 30,-15" fill="none" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round" />
    <path d="M -15,-10 Q 0,25 15,-10" fill="#f43f5e" />
    <!-- Little Paws / Hands -->
    <ellipse cx="-45" cy="50" rx="22" ry="16" fill="url(#pikaYellow)" />
    <ellipse cx="45" cy="50" rx="22" ry="16" fill="url(#pikaYellow)" />
    <!-- Feet -->
    <ellipse cx="-70" cy="190" rx="36" ry="18" fill="url(#pikaYellow)" />
    <ellipse cx="70" cy="190" rx="36" ry="18" fill="url(#pikaYellow)" />
  </g>
</svg>`;

// 4. Cute Dinosaur with Party Hat
const dinosaurSvg = `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="dinoGreen" cx="45%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#86efac" />
      <stop offset="60%" stop-color="#22c55e" />
      <stop offset="100%" stop-color="#15803d" />
    </radialGradient>
  </defs>
  <g transform="translate(290, 310)">
    <!-- Tail -->
    <path d="M -60,110 C -160,110 -220,40 -230,-10 C -220,10 -150,150 -40,140 Z" fill="url(#dinoGreen)" />
    <!-- Spikes along back -->
    <polygon points="-120,60 -150,30 -110,35" fill="#facc15" />
    <polygon points="-80,80 -105,45 -65,55" fill="#facc15" />
    <polygon points="-40,95 -60,55 -25,70" fill="#facc15" />
    <!-- Chubby Body -->
    <ellipse cx="0" cy="80" rx="120" ry="110" fill="url(#dinoGreen)" />
    <ellipse cx="25" cy="95" rx="75" ry="75" fill="#dcfce7" />
    <!-- Head -->
    <ellipse cx="30" cy="-60" rx="110" ry="90" fill="url(#dinoGreen)" />
    <!-- Party Hat -->
    <polygon points="30,-190 -10,-120 70,-120" fill="#f43f5e" />
    <circle cx="30" cy="-195" r="14" fill="#fbbf24" />
    <circle cx="15" cy="-150" r="6" fill="#fbbf24" />
    <circle cx="45" cy="-140" r="5" fill="#38bdf8" />
    <!-- Cute Big Eye -->
    <circle cx="70" cy="-75" r="24" fill="#ffffff" />
    <circle cx="76" cy="-75" r="15" fill="#1e293b" />
    <circle cx="72" cy="-79" r="6" fill="#ffffff" />
    <!-- Smiling Mouth with Cute Tooth -->
    <path d="M 40,-25 Q 90,-10 115,-35" fill="none" stroke="#166534" stroke-width="4.5" stroke-linecap="round" />
    <polygon points="85,-22 93,-12 101,-22" fill="#ffffff" />
    <!-- Rosy Cheek -->
    <circle cx="40" cy="-40" r="14" fill="#f87171" opacity="0.6" />
    <!-- Tiny Cute Arms -->
    <path d="M 50,45 Q 85,55 95,45" fill="none" stroke="url(#dinoGreen)" stroke-width="22" stroke-linecap="round" />
    <!-- Feet -->
    <ellipse cx="-40" cy="180" rx="35" ry="24" fill="url(#dinoGreen)" />
    <ellipse cx="40" cy="180" rx="35" ry="24" fill="url(#dinoGreen)" />
  </g>
</svg>`;

// 5. Luxury 3-Tier Birthday Cake with Lit Candles
const birthdayCakeSvg = `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cakeGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <radialGradient id="frostingChoc" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#9d174d" />
      <stop offset="60%" stop-color="#831843" />
      <stop offset="100%" stop-color="#500724" />
    </radialGradient>
  </defs>
  <g transform="translate(300, 310)">
    <!-- Cake Stand -->
    <ellipse cx="0" cy="230" rx="240" ry="25" fill="#e2e8f0" opacity="0.8" />
    <ellipse cx="0" cy="225" rx="230" ry="20" fill="#f8fafc" />
    <!-- Tier 1 Base -->
    <path d="M -180,100 C -180,145 180,145 180,100 L 180,200 C 180,245 -180,245 -180,200 Z" fill="url(#frostingChoc)" />
    <ellipse cx="0" cy="100" rx="180" ry="40" fill="#be185d" />
    <!-- Golden beaded border -->
    <ellipse cx="0" cy="200" rx="180" ry="40" fill="none" stroke="url(#cakeGold)" stroke-width="8" stroke-dasharray="14,14" />
    <!-- Tier 2 Middle -->
    <path d="M -130,0 C -130,40 130,40 130,0 L 130,90 C 130,130 -130,130 -130,90 Z" fill="url(#frostingChoc)" />
    <ellipse cx="0" cy="0" rx="130" ry="32" fill="#be185d" />
    <!-- Tier 3 Top -->
    <path d="M -85,-85 C -85,-50 85,-50 85,-85 L 85,-5 C 85,30 -85,30 -85,-5 Z" fill="url(#frostingChoc)" />
    <ellipse cx="0" cy="-85" rx="85" ry="24" fill="#be185d" />
    <!-- Strawberries on top -->
    <circle cx="-40" cy="-90" r="12" fill="#ef4444" /><circle cx="0" cy="-94" r="14" fill="#ef4444" /><circle cx="40" cy="-90" r="12" fill="#ef4444" />
    <!-- Lit Candles -->
    <!-- Candle 1 -->
    <rect x="-35" y="-150" width="8" height="55" rx="2" fill="url(#cakeGold)" />
    <circle cx="-31" cy="-165" r="12" fill="#fbbf24" opacity="0.4" />
    <path d="M -31,-175 C -25,-165 -27,-158 -31,-155 C -35,-158 -37,-165 -31,-175 Z" fill="#f59e0b" />
    <!-- Candle 2 (Center) -->
    <rect x="-4" y="-165" width="8" height="65" rx="2" fill="url(#cakeGold)" />
    <circle cx="0" cy="-180" r="14" fill="#fbbf24" opacity="0.4" />
    <path d="M 0,-192 C 7,-180 5,-172 0,-169 C -5,-172 -7,-180 0,-192 Z" fill="#f59e0b" />
    <!-- Candle 3 -->
    <rect x="27" y="-150" width="8" height="55" rx="2" fill="url(#cakeGold)" />
    <circle cx="31" cy="-165" r="12" fill="#fbbf24" opacity="0.4" />
    <path d="M 31,-175 C 37,-165 35,-158 31,-155 C 27,-158 25,-165 31,-175 Z" fill="#f59e0b" />
  </g>
</svg>`;

// 6. Cute Teddy Bear with Gift Box
const teddyBearSvg = `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bearBrown" cx="45%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="70%" stop-color="#b45309" />
      <stop offset="100%" stop-color="#78350f" />
    </radialGradient>
  </defs>
  <g transform="translate(300, 310)">
    <!-- Ears -->
    <circle cx="-100" cy="-120" r="42" fill="url(#bearBrown)" /><circle cx="-100" cy="-120" r="24" fill="#fef3c7" />
    <circle cx="100" cy="-120" r="42" fill="url(#bearBrown)" /><circle cx="100" cy="-120" r="24" fill="#fef3c7" />
    <!-- Body -->
    <ellipse cx="0" cy="70" rx="125" ry="115" fill="url(#bearBrown)" />
    <ellipse cx="0" cy="80" rx="80" ry="75" fill="#fef3c7" />
    <!-- Head -->
    <circle cx="0" cy="-45" r="115" fill="url(#bearBrown)" />
    <!-- Snout -->
    <ellipse cx="0" cy="-25" rx="48" ry="36" fill="#fef3c7" />
    <ellipse cx="0" cy="-40" rx="18" ry="13" fill="#451a03" />
    <path d="M 0,-27 L 0,-15 M -12,-15 Q 0,-6 12,-15" fill="none" stroke="#451a03" stroke-width="4" stroke-linecap="round" />
    <!-- Eyes -->
    <circle cx="-42" cy="-65" r="14" fill="#1e293b" /><circle cx="-46" cy="-69" r="5" fill="#ffffff" />
    <circle cx="42" cy="-65" r="14" fill="#1e293b" /><circle cx="38" cy="-69" r="5" fill="#ffffff" />
    <!-- Rosy Cheeks -->
    <circle cx="-62" cy="-35" r="14" fill="#f43f5e" opacity="0.4" />
    <circle cx="62" cy="-35" r="14" fill="#f43f5e" opacity="0.4" />
    <!-- Big Red Bowtie -->
    <polygon points="0,-5 -35,-25 -35,15" fill="#ef4444" />
    <polygon points="0,-5 35,-25 35,15" fill="#ef4444" />
    <circle cx="0" cy="-5" r="10" fill="#b91c1c" />
    <!-- Gift Box Held in Paws -->
    <rect x="-55" y="80" width="110" height="95" rx="8" fill="#3b82f6" />
    <rect x="-62" y="70" width="124" height="22" rx="4" fill="#60a5fa" />
    <!-- Ribbon -->
    <rect x="-8" y="70" width="16" height="105" fill="#facc15" />
    <rect x="-55" y="118" width="110" height="16" fill="#facc15" />
    <!-- Paws -->
    <circle cx="-65" cy="115" r="26" fill="url(#bearBrown)" />
    <circle cx="65" cy="115" r="26" fill="url(#bearBrown)" />
  </g>
</svg>`;

// 7. Cute Astronaut Floating in Space
const astronautSvg = `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="visor" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="40%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
  </defs>
  <g transform="translate(300, 310)">
    <!-- Floating stars around -->
    <text x="-160" y="-120" font-size="28" fill="#facc15">✦</text>
    <text x="140" y="-140" font-size="24" fill="#38bdf8">✦</text>
    <text x="160" y="80" font-size="28" fill="#facc15">★</text>
    <!-- Balloon attached to astronaut hand -->
    <ellipse cx="120" cy="-180" rx="45" ry="55" fill="#ec4899" />
    <polygon points="120,-125 115,-118 125,-118" fill="#ec4899" />
    <path d="M 120,-118 Q 130,-40 65,40" fill="none" stroke="#fbcfe8" stroke-width="2.5" />
    <!-- Backpack -->
    <rect x="-95" y="-50" width="190" height="180" rx="30" fill="#94a3b8" />
    <!-- Body -->
    <rect x="-70" y="-20" width="140" height="150" rx="35" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3" />
    <!-- Chest Pack with Lights -->
    <rect x="-35" y="20" width="70" height="50" rx="8" fill="#e2e8f0" />
    <circle cx="-16" cy="45" r="6" fill="#ef4444" /><circle cx="0" cy="45" r="6" fill="#22c55e" /><circle cx="16" cy="45" r="6" fill="#3b82f6" />
    <!-- Helmet -->
    <circle cx="0" cy="-75" r="90" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3" />
    <!-- Shiny Visor -->
    <ellipse cx="0" cy="-75" rx="65" ry="50" fill="url(#visor)" />
    <!-- Visor Reflection -->
    <ellipse cx="-18" cy="-88" rx="24" ry="12" fill="#ffffff" opacity="0.5" transform="rotate(-15 -18 -88)" />
    <!-- Cute Boots -->
    <ellipse cx="-40" cy="160" rx="28" ry="18" fill="#64748b" />
    <ellipse cx="40" cy="160" rx="28" ry="18" fill="#64748b" />
  </g>
</svg>`;

// Write all assets to public/characters
const assets = {
  'unicorn-cake.svg': unicornCakeSvg,
  'spiderman.svg': spidermanSvg,
  'pikachu.svg': pikachuSvg,
  'dinosaur.svg': dinosaurSvg,
  'birthday-cake.svg': birthdayCakeSvg,
  'teddy-bear.svg': teddyBearSvg,
  'astronaut.svg': astronautSvg,
};

for (const [filename, content] of Object.entries(assets)) {
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, content);
  console.log(`[GENERATED] ${filename}`);
}

console.log("ALL CHARACTER ASSETS READY!");
