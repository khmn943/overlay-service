const express = require('express');
const fetch = require('node-fetch');
const sharp = require('sharp');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/overlay', async (req, res) => {
  try {
    const { background_url, logo_url, title, subtitle } = req.body;
    const bgResp = await fetch(background_url);
    const bgBuffer = await bgResp.buffer();
    const logoResp = await fetch(logo_url);
    const logoBuffer = await logoResp.buffer();

    const svgText = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350">
    <!-- Halbtransparenter Hintergrund für bessere Lesbarkeit -->
    <rect x="0" y="820" width="1080" height="200" fill="rgba(0, 0, 0, 0.5)" />
    <style>
      .title { fill: #FFFFFF; font-size: 64px; font-family: 'Arial', sans-serif; text-anchor: middle; }
      .subtitle { fill: #FFFFFF; font-size: 48px; font-family: 'Arial', sans-serif; text-anchor: middle; }
    </style>
    <text x="540" y="900" class="title">${title}</text>
    <text x="540" y="970" class="subtitle">${subtitle}</text>
  </svg>
`;



    const composed = await sharp(bgBuffer)
      .composite([
        { input: logoBuffer, top: 1150, left: 880 },
        { input: Buffer.from(svgText), top: 0, left: 0 }
      ])
      .png()
      .toBuffer();

    res.set('Content-Type', 'image/png');
    res.send(composed);
} catch (error) {
  console.error('=== Overlay-Fehler Start ===');
  console.error(error);
  console.error('=== Overlay-Fehler Ende ===');
  res.status(500).json({ error: error.message, stack: error.stack });
}

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Overlay-Service läuft auf Port ${PORT}`));
 