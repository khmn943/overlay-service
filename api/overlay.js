const fetch = require('node-fetch');
const sharp = require('sharp');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  try {
    const { background_url, logo_url, title, subtitle } = req.body;
    const bgBuf   = await (await fetch(background_url)).buffer();
    const logoBuf = await (await fetch(logo_url)).buffer();

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350">
        <rect x="0" y="820" width="1080" height="200" fill="rgba(0,0,0,0.5)" />
        <style>
          .title    { fill:#FFF; font-size:64px; font-family:sans-serif; text-anchor:middle }
          .subtitle { fill:#FFF; font-size:48px; font-family:sans-serif; text-anchor:middle }
        </style>
        <text x="540" y="900" class="title">${title}</text>
        <text x="540" y="970" class="subtitle">${subtitle}</text>
      </svg>
    `;

    const outBuffer = await sharp(bgBuf)
      .composite([
        { input: logoBuf, top: 1150, left: 880 },
        { input: Buffer.from(svg), top: 0, left: 0 }
      ])
      .png()
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    return res.send(outBuffer);
  } catch (error) {
    console.error('Overlay Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
