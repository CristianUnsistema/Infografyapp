import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

const app = express();
const upload = multer({ dest: 'uploads/' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirPng = path.join(__dirname, 'public', 'infografias', 'formato_png');
const dirPdf = path.join(__dirname, 'public', 'infografias', 'formato_pdf');

if (!fs.existsSync(dirPng)) {
  fs.mkdirSync(dirPng, { recursive: true });
}
if (!fs.existsSync(dirPdf)) {
  fs.mkdirSync(dirPdf, { recursive: true });
}

app.use(express.static('public'));

function getBase64Image(filePath, originalName = '') {
  const imgData = fs.readFileSync(filePath);
  const ext = originalName ? path.extname(originalName).substring(1) : (path.extname(filePath).substring(1) || 'png');
  return `data:image/${ext};base64,${imgData.toString('base64')}`;
}

function resolveImage(imgPath, dir, uploadedImages = []) {
  if (!imgPath) return '';
  if (imgPath.startsWith('http')) {
    return imgPath;
  }
  
  if (uploadedImages.length > 0) {
    const foundImage = uploadedImages.find(img => img.originalname === imgPath);
    if (foundImage) {
      return getBase64Image(foundImage.path, foundImage.originalname);
    }
  }

  if (imgPath.startsWith('.')) {
    return getBase64Image(path.resolve(dir, imgPath));
  }
  return imgPath;
}

const logoBase64 = getBase64Image(path.resolve(__dirname, 'logo.png'));
const logoFooterBase64 = getBase64Image(path.resolve(__dirname, 'logo_footer.png'));

const svgExperiencia = `<svg class="w-8 h-8 text-[#005a8c] mb-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"></path></svg>`;
const svgEspecialistas = `<svg class="w-8 h-8 text-[#005a8c] mb-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"></path></svg>`;
const svgRespuesta = `<svg class="w-8 h-8 text-[#005a8c] mb-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
const svgTecnologia = `<svg class="w-8 h-8 text-[#005a8c] mb-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"></path></svg>`;
const svgConfianza = `<svg class="w-8 h-8 text-[#005a8c] mb-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"></path></svg>`;
const svgCercania = `<svg class="w-8 h-8 text-[#005a8c] mb-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"></path></svg>`;

app.post('/upload', upload.fields([{ name: 'csvFile', maxCount: 1 }, { name: 'images' }]), async (req, res) => {
  if (!req.files || !req.files.csvFile) {
    return res.status(400).json({ success: false, error: 'No CSV file uploaded.' });
  }

  const csvFile = req.files.csvFile[0];
  const uploadedImages = req.files.images || [];

  const resultados = [];
  const generatedFiles = [];

  fs.createReadStream(csvFile.path)
    .pipe(csv())
    .on('data', (data) => resultados.push(data))
    .on('end', async () => {
      let browser;
      try {
        browser = await puppeteer.launch({ 
          headless: "new",
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ]
        });
        const page = await browser.newPage();
        
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

        for (let i = 0; i < resultados.length; i++) {
          const { 
            tipo = 'servicio',
            titulo1 = '', titulo2 = '', titulo3 = '', imagen = '',
            hero_subtitle = '', hero_desc = '', hero_highlight = '',
            hero_pill_t1 = '', hero_pill_t2 = '', hero_pill_t3 = '', hero_badge = '',
            sec1_titulo = '', sec2_titulo = '', sec3_titulo = '', sec4_titulo = '',
            img_caja1 = '', img_caja2 = '',
            caja1_t1 = '', caja1_d1 = '', caja1_t2 = '', caja1_d2 = '',
            caja1_t3 = '', caja1_d3 = '', caja1_t4 = '', caja1_d4 = '',
            caja1_t5 = '', caja1_d5 = '', caja1_t6 = '', caja1_d6 = '',
            caja1_t7 = '', caja1_d7 = '',
            c2_t1 = '', c2_t2 = '', c2_t3 = '', c2_t4 = '', c2_t5 = '', c2_t6 = '', c2_t7 = '',
            c3_t1 = '', c3_t2 = '', c3_t3 = '', c3_t4 = '', c3_t5 = '', c3_t6 = '',
            bot_t1 = '', bot_d1 = '', bot_t2 = '', bot_d2 = '',
            bot_t3 = '', bot_d3 = '', bot_t4 = '', bot_d4 = '',
            bot_t5 = '', bot_d5 = '', bot_t6 = '', bot_d6 = ''
          } = resultados[i];
          
          const srcImagen = resolveImage(imagen, __dirname, uploadedImages);
          const srcImgCaja1 = resolveImage(img_caja1, __dirname, uploadedImages);
          const srcImgCaja2 = resolveImage(img_caja2, __dirname, uploadedImages);

          let templateHTML = '';
          const tipoLower = tipo.toLowerCase();

          if (tipoLower === 'producto') {
            templateHTML = `
              <!DOCTYPE html>
              <html lang="es">
              <head>
                  <meta charset="UTF-8">
                  <script src="https://cdn.tailwindcss.com"></script>
                  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700;800&display=swap" rel="stylesheet">
                  <style>
                      @page { margin: 0; size: 794px 1123px; }
                      html, body { 
                          margin: 0 !important; padding: 0 !important; width: 794px; height: 1123px; overflow: hidden; background-color: white; 
                          -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
                      }
                      .a4-canvas { width: 100%; height: 100%; position: relative; }
                      @media print { html, body, .a4-canvas { width: 794px !important; height: 1123px !important; page-break-inside: avoid; } }
                  </style>
              </head>
              <body class="font-['Montserrat',sans-serif]">
                  <svg class="absolute w-0 h-0" aria-hidden="true">
                      <defs>
                          <clipPath id="product-clip" clipPathUnits="objectBoundingBox">
                              <path d="M 0,0 L 1,0 L 1,1 L 0.15,1 L 0,0.3 Z"></path>
                          </clipPath>
                      </defs>
                  </svg>
                  <div class="a4-canvas flex flex-col box-border overflow-hidden relative">
                      <header class="flex justify-between items-center px-12 py-6 shrink-0 z-30 bg-white relative">
                          <img src="${logoBase64}" alt="Logo" class="w-[240px] h-auto">
                          <div class="text-right border-r-2 border-[#019cde] pr-4">
                              <span class="block text-[#019cde] font-extrabold text-[12px] tracking-widest">PRODUCT SHOWCASE</span>
                              <span class="block text-gray-400 text-[8px] font-bold tracking-wider uppercase">${titulo2} ${titulo3}</span>
                          </div>
                      </header>
                      <main class="flex-1 w-full flex flex-col relative z-10">
                          <div class="relative w-full h-[40%] flex shrink-0 bg-gray-50 border-b border-gray-100">
                              <div class="w-[55%] pl-12 pr-4 pt-6 flex flex-col justify-start z-20 relative">
                                  <div class="bg-[#41aef2] text-white text-[8px] font-bold px-2.5 py-0.5 rounded-full w-max mb-3 tracking-wider uppercase">${hero_badge}</div>
                                  <h1 class="font-black leading-[1] m-0 text-[#111827]">
                                      <span class="block text-[24px] font-light text-gray-500 uppercase tracking-wide">${titulo1}</span>
                                      <span class="block text-[52px] text-[#019cde] tracking-tight uppercase">${titulo2}</span>
                                      <span class="block text-[38px] tracking-tight uppercase">${titulo3}</span>
                                  </h1>
                                  <div class="w-12 h-[2px] bg-[#019cde] my-3"></div>
                                  <p class="text-gray-400 font-bold text-[9px] tracking-widest uppercase mb-2">${hero_subtitle}</p>
                                  <p class="text-gray-600 text-[11.5px] leading-relaxed mb-4 max-w-[95%]">${hero_desc}</p>
                                  <p class="text-[#019cde] font-bold text-[12px] italic">${hero_highlight}</p>
                              </div>
                              <div class="absolute top-0 right-0 w-[48%] h-full z-0">
                                  <div class="absolute inset-0 bg-[#111827]" style="clip-path: url(#product-clip);"></div>
                                  <div class="absolute top-0 bottom-0 left-[2px] right-0 overflow-hidden" style="clip-path: url(#product-clip);">
                                      <div class="absolute inset-0 bg-gradient-to-br from-[#019cde]/10 to-[#111827]/30 z-10"></div>
                                      <img src="${srcImagen}" alt="Product" class="w-full h-full object-cover">
                                  </div>
                                  <div class="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-white/20 shadow-md">
                                      <span class="text-gray-500 text-[7px] block font-bold uppercase tracking-wider">${hero_pill_t1}</span>
                                      <span class="text-[#019cde] text-[10px] block font-black tracking-tight">${hero_pill_t2} <span class="text-gray-800 font-medium">${hero_pill_t3}</span></span>
                                  </div>
                              </div>
                          </div>
                          <div class="flex-1 w-full bg-white relative z-20 flex flex-col justify-between py-4">
                              <div class="px-8">
                                  <h2 class="text-left text-[#005a8c] font-black text-[13px] mb-3 tracking-tight uppercase border-b-2 border-gray-100 pb-1.5">${sec1_titulo}</h2>
                                  <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                                      <div class="flex items-start gap-2.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                          <div class="p-1 bg-[#019cde]/10 rounded text-[#019cde] shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div>
                                          <div><h3 class="text-[#005a8c] font-bold text-[8.5px] uppercase tracking-wide leading-tight">${caja1_t1}</h3><p class="text-gray-500 text-[7.5px] leading-tight font-medium mt-0.5">${caja1_d1}</p></div>
                                      </div>
                                      <div class="flex items-start gap-2.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                          <div class="p-1 bg-[#019cde]/10 rounded text-[#019cde] shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg></div>
                                          <div><h3 class="text-[#005a8c] font-bold text-[8.5px] uppercase tracking-wide leading-tight">${caja1_t2}</h3><p class="text-gray-500 text-[7.5px] leading-tight font-medium mt-0.5">${caja1_d2}</p></div>
                                      </div>
                                      <div class="flex items-start gap-2.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                          <div class="p-1 bg-[#019cde]/10 rounded text-[#019cde] shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg></div>
                                          <div><h3 class="text-[#005a8c] font-bold text-[8.5px] uppercase tracking-wide leading-tight">${caja1_t3}</h3><p class="text-gray-500 text-[7.5px] leading-tight font-medium mt-0.5">${caja1_d3}</p></div>
                                      </div>
                                      <div class="flex items-start gap-2.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                          <div class="p-1 bg-[#019cde]/10 rounded text-[#019cde] shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
                                          <div><h3 class="text-[#005a8c] font-bold text-[8.5px] uppercase tracking-wide leading-tight">${caja1_t4}</h3><p class="text-gray-500 text-[7.5px] leading-tight font-medium mt-0.5">${caja1_d4}</p></div>
                                      </div>
                                      <div class="flex items-start gap-2.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                          <div class="p-1 bg-[#019cde]/10 rounded text-[#019cde] shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"></path></svg></div>
                                          <div><h3 class="text-[#005a8c] font-bold text-[8.5px] uppercase tracking-wide leading-tight">${caja1_t5}</h3><p class="text-gray-500 text-[7.5px] leading-tight font-medium mt-0.5">${caja1_d5}</p></div>
                                      </div>
                                      <div class="flex items-start gap-2.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                          <div class="p-1 bg-[#019cde]/10 rounded text-[#019cde] shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div>
                                          <div><h3 class="text-[#005a8c] font-bold text-[8.5px] uppercase tracking-wide leading-tight">${caja1_t6}</h3><p class="text-gray-500 text-[7.5px] leading-tight font-medium mt-0.5">${caja1_d6}</p></div>
                                      </div>
                                  </div>
                              </div>
                              <div class="px-6 flex items-stretch justify-between gap-3 min-h-[145px]">
                                  <div class="flex-1 rounded-xl bg-gray-900 flex relative overflow-hidden shadow-sm border border-gray-800">
                                      <div class="w-[60%] p-4 z-20 flex flex-col justify-center">
                                          <h3 class="text-[#019cde] font-extrabold text-[10px] mb-2 uppercase tracking-wider">${sec2_titulo}</h3>
                                          <ul class="flex flex-col gap-1">
                                              <li class="flex items-center gap-1.5"><div class="w-1 h-1 bg-[#019cde] rounded-full shrink-0"></div><span class="text-gray-300 text-[7.5px] font-medium leading-tight">${c2_t1}</span></li>
                                              <li class="flex items-center gap-1.5"><div class="w-1 h-1 bg-[#019cde] rounded-full shrink-0"></div><span class="text-gray-300 text-[7.5px] font-medium leading-tight">${c2_t2}</span></li>
                                              <li class="flex items-center gap-1.5"><div class="w-1 h-1 bg-[#019cde] rounded-full shrink-0"></div><span class="text-gray-300 text-[7.5px] font-medium leading-tight">${c2_t3}</span></li>
                                              <li class="flex items-center gap-1.5"><div class="w-1 h-1 bg-[#019cde] rounded-full shrink-0"></div><span class="text-gray-300 text-[7.5px] font-medium leading-tight">${c2_t4}</span></li>
                                              <li class="flex items-center gap-1.5"><div class="w-1 h-1 bg-[#019cde] rounded-full shrink-0"></div><span class="text-gray-300 text-[7.5px] font-medium leading-tight">${c2_t5}</span></li>
                                          </ul>
                                      </div>
                                      <div class="absolute right-0 top-0 w-[65%] h-full z-10">
                                          <div class="absolute inset-0 bg-gradient-to-r from-gray-900 from-10% via-gray-900/40 via-30% to-transparent to-80% z-10"></div>
                                          <img src="${srcImgCaja1}" class="w-full h-full object-cover">
                                      </div>
                                  </div>
                                  <div class="flex-1 rounded-xl bg-gray-50 flex relative overflow-hidden shadow-sm border border-gray-100">
                                      <div class="w-[60%] p-4 z-20 flex flex-col justify-center">
                                          <h3 class="text-[#005f8a] font-extrabold text-[10px] mb-2 uppercase tracking-wider">${sec3_titulo}</h3>
                                          <ul class="flex flex-col gap-1">
                                              <li class="flex items-center gap-1.5"><svg class="w-2.5 h-2.5 text-[#019cde] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg><span class="text-gray-600 text-[7.5px] font-medium leading-tight">${c3_t1}</span></li>
                                              <li class="flex items-center gap-1.5"><svg class="w-2.5 h-2.5 text-[#019cde] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg><span class="text-gray-600 text-[7.5px] font-medium leading-tight">${c3_t2}</span></li>
                                              <li class="flex items-center gap-1.5"><svg class="w-2.5 h-2.5 text-[#019cde] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg><span class="text-gray-600 text-[7.5px] font-medium leading-tight">${c3_t3}</span></li>
                                              <li class="flex items-center gap-1.5"><svg class="w-2.5 h-2.5 text-[#019cde] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg><span class="text-gray-600 text-[7.5px] font-medium leading-tight">${c3_t4}</span></li>
                                              <li class="flex items-center gap-1.5"><svg class="w-2.5 h-2.5 text-[#019cde] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg><span class="text-gray-600 text-[7.5px] font-medium leading-tight">${c3_t5}</span></li>
                                          </ul>
                                      </div>
                                      <div class="absolute right-0 top-0 w-[65%] h-full z-10">
                                          <div class="absolute inset-0 bg-gradient-to-r from-gray-50 from-10% via-gray-50/40 via-30% to-transparent to-80% z-10"></div>
                                          <img src="${srcImgCaja2}" class="w-full h-full object-cover">
                                      </div>
                                  </div>
                              </div>
                              <div class="px-8">
                                  <h2 class="text-center text-gray-700 font-bold text-[11px] mb-3 tracking-wider uppercase">${sec4_titulo}</h2>
                                  <div class="grid grid-cols-3 gap-3">
                                      <div class="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                                          <h4 class="text-[#019cde] font-bold text-[8px] uppercase tracking-wide">${bot_t1}</h4>
                                          <p class="text-gray-500 text-[7px] leading-tight font-medium mt-1">${bot_d1}</p>
                                      </div>
                                      <div class="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                                          <h4 class="text-[#019cde] font-bold text-[8px] uppercase tracking-wide">${bot_t2}</h4>
                                          <p class="text-gray-500 text-[7px] leading-tight font-medium mt-1">${bot_d2}</p>
                                      </div>
                                      <div class="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                                          <h4 class="text-[#019cde] font-bold text-[8px] uppercase tracking-wide">${bot_t3}</h4>
                                          <p class="text-gray-500 text-[7px] leading-tight font-medium mt-1">${bot_d3}</p>
                                      </div>
                                      <div class="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                                          <h4 class="text-[#019cde] font-bold text-[8px] uppercase tracking-wide">${bot_t4}</h4>
                                          <p class="text-gray-500 text-[7px] leading-tight font-medium mt-1">${bot_d4}</p>
                                      </div>
                                      <div class="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                                          <h4 class="text-[#019cde] font-bold text-[8px] uppercase tracking-wide">${bot_t5}</h4>
                                          <p class="text-gray-500 text-[7px] leading-tight font-medium mt-1">${bot_d5}</p>
                                      </div>
                                      <div class="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                                          <h4 class="text-[#019cde] font-bold text-[8px] uppercase tracking-wide">${bot_t6}</h4>
                                          <p class="text-gray-500 text-[7px] leading-tight font-medium mt-1">${bot_d6}</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </main>
                      <footer class="bg-[#111827] text-white flex justify-between items-center px-10 h-[85px] w-full box-border shrink-0 break-inside-avoid relative z-30 border-t-2 border-[#019cde]">
                          <div class="flex items-center gap-3 flex-1">
                              <div class="flex flex-col justify-center">
                                  <span class="font-bold text-[9px] tracking-[0.5px] leading-tight text-[#019cde]">UNSISTEMA.</span>
                                  <span class="font-bold text-[9px] tracking-[0.5px] leading-tight text-white">SOPORTE E INFRAESTRUCTURA</span>
                                  <p class="m-0 text-[8px] leading-[1.2] font-light text-gray-400 mt-0.5">Soluciones robustas y eficientes</p>
                              </div>
                          </div>
                          <div class="h-9 w-[1px] bg-gray-800 mx-3 flex-shrink-0"></div>
                          <div class="flex flex-col items-center justify-center flex-1 pl-1 gap-1.5">
                              <img src="${logoFooterBase64}" alt="Logo Footer" class="w-[145px] h-auto brightness-0 invert">
                          </div>
                      </footer>
                  </div>
              </body>
              </html>
            `;
          } else if (tipoLower === 'instalacion' || tipoLower === 'instalación') {
            templateHTML = `
              <!DOCTYPE html>
              <html lang="es">
              <head>
                  <meta charset="UTF-8">
                  <script src="https://cdn.tailwindcss.com"></script>
                  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700;800&display=swap" rel="stylesheet">
                  <style>
                      @page { margin: 0; size: 794px 1123px; }
                      html, body { 
                          margin: 0 !important; padding: 0 !important; width: 794px; height: 1123px; overflow: hidden; background-color: white; 
                          -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
                      }
                      .a4-canvas { width: 100%; height: 100%; position: relative; }
                      @media print { html, body, .a4-canvas { width: 794px !important; height: 1123px !important; page-break-inside: avoid; } }
                  </style>
              </head>
              <body class="font-['Montserrat',sans-serif]">
                  <div class="a4-canvas flex flex-col box-border overflow-hidden relative">
                      <header class="flex justify-between items-center px-12 py-6 shrink-0 z-30 bg-white relative border-b-4 border-[#019cde]">
                          <img src="${logoBase64}" alt="Logo" class="w-[240px] h-auto">
                          <nav class="border-l-2 border-[#019cde] pl-4 flex items-center">
                              <ul class="list-none p-0 m-0 flex flex-col gap-1">
                                  <li class="text-[#555] font-bold text-[10px] tracking-[1.5px] leading-tight">TECNOLOGÍA</li>
                                  <li class="text-[#555] font-bold text-[10px] tracking-[1.5px] leading-tight">SEGURIDAD</li>
                                  <li class="text-[#555] font-bold text-[10px] tracking-[1.5px] leading-tight">CONFIANZA</li>
                                  <li class="text-[#555] font-bold text-[10px] tracking-[1.5px] leading-tight">RESULTADOS</li>
                              </ul>
                          </nav>
                      </header>
                      <main class="flex-1 w-full flex flex-col relative z-10 bg-gray-100">
                          <div class="relative w-full h-[47%] flex shrink-0 bg-[#0f172a]">
                              <div class="w-[50%] pl-12 pr-4 pt-6 flex flex-col justify-start z-20 relative">
                                  <h1 class="font-bold leading-[1.05] m-0">
                                      <span class="block text-gray-400 text-[26px] tracking-widest uppercase">${titulo1}</span>
                                      <span class="block text-[#019cde] text-[65px] tracking-tight uppercase">${titulo2}</span>
                                      <span class="block text-white text-[36px] tracking-tight uppercase">${titulo3}</span>
                                  </h1>
                                  <div class="w-12 h-[2px] bg-[#019cde] my-4"></div>
                                  <p class="text-gray-300 font-bold tracking-widest text-[9px] mb-3 uppercase">${hero_subtitle}</p>
                                  <p class="text-gray-400 text-[13px] leading-relaxed mb-4 max-w-[95%]">${hero_desc}</p>
                                  <p class="text-[#019cde] font-bold text-[13px] mb-5">${hero_highlight}</p>
                                  <div class="flex flex-col items-start gap-2">
                                      <div class="flex items-center gap-2 border border-gray-600 bg-gray-800/50 rounded-sm px-4 py-1.5">
                                          <span class="text-white font-bold text-xl leading-none tracking-tight">${hero_pill_t1}</span>
                                          <div class="w-[1px] h-6 bg-gray-600"></div>
                                          <div class="flex flex-col justify-center">
                                              <span class="text-gray-300 text-[8px] font-bold leading-tight uppercase">${hero_pill_t2}</span>
                                              <span class="text-[#019cde] text-[8px] font-bold leading-tight uppercase">${hero_pill_t3}</span>
                                          </div>
                                      </div>
                                      <div class="bg-[#019cde] text-white text-[9px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider">${hero_badge}</div>
                                  </div>
                              </div>
                              <div class="absolute top-0 right-0 w-[60%] h-full z-0">
                                  <div class="absolute inset-0 bg-gradient-to-r from-[#0f172a] from-5% via-[#0f172a]/70 via-30% to-transparent to-70% z-10"></div>
                                  <div class="absolute inset-0 bg-[#019cde]/10 z-10 mix-blend-color"></div>
                                  <img src="${srcImagen}" alt="Background" class="w-full h-full object-cover grayscale-[30%]">
                              </div>
                          </div>
                          <div class="flex-1 w-full relative z-20 flex flex-col justify-between py-4 border-t border-gray-300">
                              <div class="px-8">
                                  <h2 class="text-center text-[#005a8c] font-black text-[12px] mb-4 tracking-wider uppercase">${sec1_titulo}</h2>
                                  <div class="grid grid-cols-7 gap-3 text-center">
                                      <div class="flex flex-col items-center bg-white p-2 border border-gray-200 shadow-sm">
                                          <svg class="w-6 h-6 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t1}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d1}</p>
                                      </div>
                                      <div class="flex flex-col items-center bg-white p-2 border border-gray-200 shadow-sm">
                                          <svg class="w-6 h-6 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t2}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d2}</p>
                                      </div>
                                      <div class="flex flex-col items-center bg-white p-2 border border-gray-200 shadow-sm">
                                          <svg class="w-6 h-6 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t3}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d3}</p>
                                      </div>
                                      <div class="flex flex-col items-center bg-white p-2 border border-gray-200 shadow-sm">
                                          <svg class="w-6 h-6 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t4}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d4}</p>
                                      </div>
                                      <div class="flex flex-col items-center bg-white p-2 border border-gray-200 shadow-sm">
                                          <svg class="w-6 h-6 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t5}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d5}</p>
                                      </div>
                                      <div class="flex flex-col items-center bg-white p-2 border border-gray-200 shadow-sm">
                                          <svg class="w-6 h-6 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t6}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d6}</p>
                                      </div>
                                      <div class="flex flex-col items-center bg-white p-2 border border-gray-200 shadow-sm">
                                          <svg class="w-6 h-6 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t7}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d7}</p>
                                      </div>
                                  </div>
                              </div>
                              <div class="px-8 flex items-stretch justify-between gap-4 min-h-[145px]">
                                  <div class="flex-1 bg-white shadow-sm border border-gray-200 flex relative overflow-hidden group">
                                      <div class="w-[35%] relative z-0">
                                          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-white z-10"></div>
                                          <img src="${srcImgCaja1}" class="w-full h-full object-cover grayscale-[50%]">
                                      </div>
                                      <div class="w-[65%] p-3 pl-2 z-20 flex flex-col justify-center bg-white relative">
                                          <div class="absolute top-3 bottom-3 left-0 w-1 bg-[#ff3b3b] rounded-full"></div>
                                          <h3 class="text-[#ff3b3b] font-black text-[9px] mb-2 uppercase tracking-widest ml-2">${sec2_titulo}</h3>
                                          <ul class="flex flex-col gap-1.5 ml-2">
                                              <li class="flex items-start gap-1.5"><svg class="w-2.5 h-2.5 text-[#ff3b3b] shrink-0 mt-[1px]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-gray-600 text-[6.5px] font-medium leading-tight">${c2_t1}</span></li>
                                              <li class="flex items-start gap-1.5"><svg class="w-2.5 h-2.5 text-[#ff3b3b] shrink-0 mt-[1px]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-gray-600 text-[6.5px] font-medium leading-tight">${c2_t2}</span></li>
                                              <li class="flex items-start gap-1.5"><svg class="w-2.5 h-2.5 text-[#ff3b3b] shrink-0 mt-[1px]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-gray-600 text-[6.5px] font-medium leading-tight">${c2_t3}</span></li>
                                              <li class="flex items-start gap-1.5"><svg class="w-2.5 h-2.5 text-[#ff3b3b] shrink-0 mt-[1px]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-gray-600 text-[6.5px] font-medium leading-tight">${c2_t4}</span></li>
                                              <li class="flex items-start gap-1.5"><svg class="w-2.5 h-2.5 text-[#ff3b3b] shrink-0 mt-[1px]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-gray-600 text-[6.5px] font-medium leading-tight">${c2_t5}</span></li>
                                              <li class="flex items-start gap-1.5"><svg class="w-2.5 h-2.5 text-[#ff3b3b] shrink-0 mt-[1px]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-gray-600 text-[6.5px] font-medium leading-tight">${c2_t6}</span></li>
                                              <li class="flex items-start gap-1.5"><svg class="w-2.5 h-2.5 text-[#ff3b3b] shrink-0 mt-[1px]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-gray-600 text-[6.5px] font-medium leading-tight">${c2_t7}</span></li>
                                          </ul>
                                      </div>
                                  </div>
                                  <div class="flex-1 bg-[#0f172a] shadow-sm border border-gray-800 flex relative overflow-hidden group">
                                      <div class="w-[35%] relative z-0">
                                          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[#0f172a]/70 to-[#0f172a] z-10"></div>
                                          <img src="${srcImgCaja2}" class="w-full h-full object-cover opacity-60 mix-blend-luminosity">
                                      </div>
                                      <div class="w-[65%] p-3 pl-2 z-20 flex flex-col justify-center bg-[#0f172a] relative">
                                          <div class="absolute top-3 bottom-3 left-0 w-1 bg-[#019cde] rounded-full"></div>
                                          <h3 class="text-white font-black text-[9px] mb-2 uppercase tracking-widest ml-2">${sec3_titulo}</h3>
                                          <ul class="flex flex-col gap-1.5 ml-2">
                                              <li class="flex items-start gap-1.5"><svg class="w-2.5 h-2.5 text-[#41aef2] shrink-0 mt-[1px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg><span class="text-gray-300 text-[6.5px] font-medium leading-tight">${c3_t1}</span></li>
                                              <li class="flex items-start gap-1.5"><svg class="w-2.5 h-2.5 text-[#41aef2] shrink-0 mt-[1px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg><span class="text-gray-300 text-[6.5px] font-medium leading-tight">${c3_t2}</span></li>
                                              <li class="flex items-start gap-1.5"><svg class="w-2.5 h-2.5 text-[#41aef2] shrink-0 mt-[1px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg><span class="text-gray-300 text-[6.5px] font-medium leading-tight">${c3_t3}</span></li>
                                              <li class="flex items-start gap-1.5"><svg class="w-2.5 h-2.5 text-[#41aef2] shrink-0 mt-[1px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg><span class="text-gray-300 text-[6.5px] font-medium leading-tight">${c3_t4}</span></li>
                                              <li class="flex items-start gap-1.5"><svg class="w-2.5 h-2.5 text-[#41aef2] shrink-0 mt-[1px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg><span class="text-gray-300 text-[6.5px] font-medium leading-tight">${c3_t5}</span></li>
                                              <li class="flex items-start gap-1.5"><svg class="w-2.5 h-2.5 text-[#41aef2] shrink-0 mt-[1px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg><span class="text-gray-300 text-[6.5px] font-medium leading-tight">${c3_t6}</span></li>
                                          </ul>
                                      </div>
                                  </div>
                              </div>
                              <div class="px-8 mt-2">
                                  <h2 class="text-center text-gray-800 font-extrabold text-[12px] mb-3 tracking-wider uppercase">${sec4_titulo}</h2>
                                  <div class="grid grid-cols-6 gap-2">
                                      <div class="p-2 bg-white border-t-2 border-[#019cde] shadow-sm text-center flex flex-col justify-start h-full">
                                          <h4 class="text-[#005a8c] font-black text-[7px] uppercase tracking-wide mb-1">${bot_t1}</h4>
                                          <p class="text-gray-500 text-[6px] leading-tight font-medium">${bot_d1}</p>
                                      </div>
                                      <div class="p-2 bg-white border-t-2 border-[#019cde] shadow-sm text-center flex flex-col justify-start h-full">
                                          <h4 class="text-[#005a8c] font-black text-[7px] uppercase tracking-wide mb-1">${bot_t2}</h4>
                                          <p class="text-gray-500 text-[6px] leading-tight font-medium">${bot_d2}</p>
                                      </div>
                                      <div class="p-2 bg-white border-t-2 border-[#019cde] shadow-sm text-center flex flex-col justify-start h-full">
                                          <h4 class="text-[#005a8c] font-black text-[7px] uppercase tracking-wide mb-1">${bot_t3}</h4>
                                          <p class="text-gray-500 text-[6px] leading-tight font-medium">${bot_d3}</p>
                                      </div>
                                      <div class="p-2 bg-white border-t-2 border-[#019cde] shadow-sm text-center flex flex-col justify-start h-full">
                                          <h4 class="text-[#005a8c] font-black text-[7px] uppercase tracking-wide mb-1">${bot_t4}</h4>
                                          <p class="text-gray-500 text-[6px] leading-tight font-medium">${bot_d4}</p>
                                      </div>
                                      <div class="p-2 bg-white border-t-2 border-[#019cde] shadow-sm text-center flex flex-col justify-start h-full">
                                          <h4 class="text-[#005a8c] font-black text-[7px] uppercase tracking-wide mb-1">${bot_t5}</h4>
                                          <p class="text-gray-500 text-[6px] leading-tight font-medium">${bot_d5}</p>
                                      </div>
                                      <div class="p-2 bg-white border-t-2 border-[#019cde] shadow-sm text-center flex flex-col justify-start h-full">
                                          <h4 class="text-[#005a8c] font-black text-[7px] uppercase tracking-wide mb-1">${bot_t6}</h4>
                                          <p class="text-gray-500 text-[6px] leading-tight font-medium">${bot_d6}</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </main>
                      <footer class="bg-[#019cde] text-white flex justify-between items-center px-10 h-[85px] w-full box-border shrink-0 break-inside-avoid relative z-30">
                          <div class="flex items-center gap-3 flex-1">
                              <svg class="w-9 h-9 text-white flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                              <div class="flex flex-col justify-center">
                                  <span class="font-bold text-[9px] tracking-[0.5px] leading-tight">UNSISTEMA.</span>
                                  <span class="font-bold text-[9px] tracking-[0.5px] leading-tight">TU ALIADO TECNOLÓGICO.</span>
                                  <p class="m-0 text-[8px] leading-[1.2] font-light text-white mt-0.5">Soluciones confiables para personas<br>y empresas que buscan más</p>
                              </div>
                          </div>
                          <div class="h-9 w-[1px] bg-white/40 mx-3 flex-shrink-0"></div>
                          <div class="flex items-center gap-3 flex-1 pl-1">
                              <svg class="w-8 h-8 text-white flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M9 11l2 2 4-4"></path></svg>
                              <div class="flex flex-col justify-center">
                                  <span class="font-bold text-[9px] tracking-[0.5px] leading-tight">TECNOLOGÍA QUE IMPULSA.</span>
                                  <span class="font-bold text-[9px] tracking-[0.5px] leading-tight">SOLUCIONES QUE RESPALDAN.</span>
                                  <p class="m-0 text-[8px] leading-[1.2] font-light text-white mt-0.5">Herramientas potentes y sencillas<br>para retos complejos</p>
                              </div>
                          </div>
                          <div class="h-9 w-[1px] bg-white/40 mx-3 flex-shrink-0"></div>
                          <div class="flex flex-col items-center justify-center flex-1 pl-1 gap-1.5">
                              <img src="${logoFooterBase64}" alt="Logo Footer" class="w-[145px] h-auto">
                              <div class="flex items-center gap-1 text-[7.5px] font-medium tracking-[0.3px] text-white">
                                  <span>TECNOLOGÍA</span>
                                  <span class="text-white/40 font-light text-[6px]">|</span>
                                  <span>SEGURIDAD</span>
                                  <span class="text-white/40 font-light text-[6px]">|</span>
                                  <span>CONFIANZA</span>
                                  <span class="text-white/40 font-light text-[6px]">|</span>
                                  <span>RESULTADOS</span>
                              </div>
                          </div>
                      </footer>
                  </div>
              </body>
              </html>
            `;
          } else {
            templateHTML = `
              <!DOCTYPE html>
              <html lang="es">
              <head>
                  <meta charset="UTF-8">
                  <script src="https://cdn.tailwindcss.com"></script>
                  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700;800&display=swap" rel="stylesheet">
                  <style>
                      @page { margin: 0; size: 794px 1123px; }
                      html, body { 
                          margin: 0 !important; padding: 0 !important; width: 794px; height: 1123px; overflow: hidden; background-color: white; 
                          -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
                      }
                      .a4-canvas { width: 100%; height: 100%; position: relative; }
                      @media print { html, body, .a4-canvas { width: 794px !important; height: 1123px !important; page-break-inside: avoid; } }
                  </style>
              </head>
              <body class="font-['Montserrat',sans-serif]">
                  <svg class="absolute w-0 h-0" aria-hidden="true">
                      <defs>
                          <clipPath id="eset-curve" clipPathUnits="objectBoundingBox">
                              <path d="M 0.28,0 L 1,0 L 1,1 L 0,1 L 0,0.9 Q 0,0.78 0.1,0.5 Z"></path>
                          </clipPath>
                      </defs>
                  </svg>
                  <div class="a4-canvas flex flex-col box-border overflow-hidden relative">
                      <header class="flex justify-between items-center px-12 py-6 shrink-0 z-30 bg-white relative">
                          <img src="${logoBase64}" alt="Logo" class="w-[240px] h-auto">
                          <nav class="border-l-2 border-[#019cde] pl-4 flex items-center">
                              <ul class="list-none p-0 m-0 flex flex-col gap-1">
                                  <li class="text-[#555] font-bold text-[10px] tracking-[1.5px] leading-tight">TECNOLOGÍA</li>
                                  <li class="text-[#555] font-bold text-[10px] tracking-[1.5px] leading-tight">SEGURIDAD</li>
                                  <li class="text-[#555] font-bold text-[10px] tracking-[1.5px] leading-tight">CONFIANZA</li>
                                  <li class="text-[#555] font-bold text-[10px] tracking-[1.5px] leading-tight">RESULTADOS</li>
                              </ul>
                          </nav>
                      </header>
                      <main class="flex-1 w-full flex flex-col relative z-10">
                          <div class="relative w-full h-[47%] flex shrink-0">
                              <div class="w-[50%] pl-12 pr-4 pt-4 flex flex-col justify-start z-20 relative">
                                  <h1 class="font-bold leading-[1.05] m-0">
                                      <span class="block text-[#444] text-[34px] tracking-tight">${titulo1}</span>
                                      <span class="block text-[#019cde] text-[65px] tracking-tight">${titulo2}</span>
                                      <span class="block text-[#019cde] text-[36px] tracking-tight">${titulo3}</span>
                                  </h1>
                                  <div class="w-8 h-[1px] bg-[#019cde] my-4"></div>
                                  <p class="text-[#666] font-medium tracking-wide text-[11px] mb-3">${hero_subtitle}</p>
                                  <p class="text-[#555] text-[13px] leading-relaxed mb-4 max-w-[90%]">${hero_desc}</p>
                                  <p class="text-[#019cde] font-bold text-[13px] mb-5">${hero_highlight}</p>
                                  <div class="flex flex-col items-start gap-2">
                                      <div class="flex items-center gap-2 border-[1.5px] border-[#019cde] rounded-[20px] px-4 py-1.5">
                                          <span class="text-[#019cde] font-bold text-xl leading-none tracking-tight">${hero_pill_t1}</span>
                                          <div class="w-[1px] h-6 bg-[#019cde]"></div>
                                          <div class="flex flex-col justify-center">
                                              <span class="text-[#019cde] text-[8px] font-bold leading-tight">${hero_pill_t2}</span>
                                              <span class="text-[#019cde] text-[8px] font-bold leading-tight">${hero_pill_t3}</span>
                                          </div>
                                      </div>
                                      <div class="bg-[#41aef2] text-white text-[9px] font-bold px-3 py-1 rounded">${hero_badge}</div>
                                  </div>
                              </div>
                              <div class="absolute top-0 right-0 w-[56%] h-full z-0">
                                  <div class="absolute inset-0 bg-[#38b6ff]" style="clip-path: url(#eset-curve);"></div>
                                  <div class="absolute top-0 bottom-0 left-[4px] right-[-4px] overflow-hidden" style="clip-path: url(#eset-curve);">
                                      <div class="absolute inset-0 bg-[#019cde]/15 z-10 mix-blend-multiply"></div>
                                      <div class="absolute inset-0 bg-gradient-to-t from-[#005f8a] to-transparent z-10 opacity-20"></div>
                                      <img src="${srcImagen}" alt="Background" class="w-full h-full object-cover">
                                  </div>
                              </div>
                          </div>
                          <div class="flex-1 w-full bg-white relative z-20 flex flex-col justify-between py-4">
                              <div class="px-8">
                                  <h2 class="text-center text-[#005a8c] font-extrabold text-[12px] mb-4 tracking-wide">${sec1_titulo}</h2>
                                  <div class="grid grid-cols-7 gap-3 text-center">
                                      <div class="flex flex-col items-center">
                                          <svg class="w-7 h-7 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t1}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d1}</p>
                                      </div>
                                      <div class="flex flex-col items-center">
                                          <svg class="w-7 h-7 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t2}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d2}</p>
                                      </div>
                                      <div class="flex flex-col items-center">
                                          <svg class="w-7 h-7 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t3}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d3}</p>
                                      </div>
                                      <div class="flex flex-col items-center">
                                          <svg class="w-7 h-7 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t4}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d4}</p>
                                      </div>
                                      <div class="flex flex-col items-center">
                                          <svg class="w-7 h-7 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t5}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d5}</p>
                                      </div>
                                      <div class="flex flex-col items-center">
                                          <svg class="w-7 h-7 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t6}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d6}</p>
                                      </div>
                                      <div class="flex flex-col items-center">
                                          <svg class="w-7 h-7 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"></path></svg>
                                          <h3 class="text-[#005a8c] font-bold text-[7px] uppercase tracking-wide leading-tight mb-1">${caja1_t7}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d7}</p>
                                      </div>
                                  </div>
                              </div>
                              <div class="px-6 flex items-stretch justify-between gap-3 min-h-[145px]">
                                  <div class="flex-1 rounded-xl bg-[#111827] flex relative overflow-hidden shadow-lg h-auto">
                                      <div class="w-[58%] p-4 z-20 flex flex-col justify-center">
                                          <h3 class="text-[#ff3b3b] font-bold text-[10px] mb-3 uppercase tracking-wide break-words">${sec2_titulo}</h3>
                                          <ul class="flex flex-col gap-1.5">
                                              <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#ff3b3b] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-[#e2e8f0] text-[7px] font-bold">${c2_t1}</span></li>
                                              <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#ff3b3b] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-[#e2e8f0] text-[7px] font-bold">${c2_t2}</span></li>
                                              <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#ff3b3b] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-[#e2e8f0] text-[7px] font-bold">${c2_t3}</span></li>
                                              <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#ff3b3b] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-[#e2e8f0] text-[7px] font-bold">${c2_t4}</span></li>
                                              <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#ff3b3b] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-[#e2e8f0] text-[7px] font-bold">${c2_t5}</span></li>
                                          </ul>
                                      </div>
                                      <div class="absolute right-0 top-0 w-[65%] h-full z-10">
                                          <div class="absolute inset-0 bg-gradient-to-r from-[#111827] from-10% via-[#111827]/40 via-30% to-transparent to-80% z-10"></div>
                                          <img src="${srcImgCaja1}" class="w-full h-full object-cover">
                                      </div>
                                  </div>
                                  <div class="flex-1 rounded-xl bg-white border-[1px] border-gray-200 shadow-lg flex relative overflow-hidden h-auto">
                                      <div class="w-[58%] p-4 z-20 flex flex-col justify-center">
                                          <h3 class="text-[#005f8a] font-bold text-[10px] mb-3 uppercase tracking-wide break-words">${sec3_titulo}</h3>
                                          <ul class="flex flex-col gap-2">
                                              <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#005f8a] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg><span class="text-[#333] text-[7.5px] font-bold">${c3_t1}</span></li>
                                              <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#005f8a] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg><span class="text-[#333] text-[7.5px] font-bold">${c3_t2}</span></li>
                                              <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#005f8a] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg><span class="text-[#333] text-[7.5px] font-bold">${c3_t3}</span></li>
                                              <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#005f8a] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg><span class="text-[#333] text-[7.5px] font-bold">${c3_t4}</span></li>
                                              <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#005f8a] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg><span class="text-[#333] text-[7.5px] font-bold">${c3_t5}</span></li>
                                              <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#005f8a] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg><span class="text-[#333] text-[7.5px] font-bold">${c3_t6}</span></li>
                                          </ul>
                                      </div>
                                      <div class="absolute right-0 top-0 w-[65%] h-full z-10">
                                          <div class="absolute inset-0 bg-gradient-to-r from-white from-10% via-white/40 via-30% to-transparent to-80% z-10"></div>
                                          <img src="${srcImgCaja2}" class="w-full h-full object-cover">
                                      </div>
                                  </div>
                              </div>
                              <div class="px-10 pb-2">
                                  <h2 class="text-center text-[#005a8c] font-extrabold text-[12px] mb-3 tracking-wide">${sec4_titulo}</h2>
                                  <div class="grid grid-cols-6 gap-4 text-center">
                                      <div class="flex flex-col items-center">
                                          ${svgExperiencia}
                                          <h3 class="text-[#005a8c] font-bold text-[7.5px] uppercase leading-tight mb-1">${bot_t1}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${bot_d1}</p>
                                      </div>
                                      <div class="flex flex-col items-center">
                                          ${svgEspecialistas}
                                          <h3 class="text-[#005a8c] font-bold text-[7.5px] uppercase leading-tight mb-1">${bot_t2}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${bot_d2}</p>
                                      </div>
                                      <div class="flex flex-col items-center">
                                          ${svgRespuesta}
                                          <h3 class="text-[#005a8c] font-bold text-[7.5px] uppercase leading-tight mb-1">${bot_t3}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${bot_d3}</p>
                                      </div>
                                      <div class="flex flex-col items-center">
                                          ${svgTecnologia}
                                          <h3 class="text-[#005a8c] font-bold text-[7.5px] uppercase leading-tight mb-1">${bot_t4}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${bot_d4}</p>
                                      </div>
                                      <div class="flex flex-col items-center">
                                          ${svgConfianza}
                                          <h3 class="text-[#005a8c] font-bold text-[7.5px] uppercase leading-tight mb-1">${bot_t5}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${bot_d5}</p>
                                      </div>
                                      <div class="flex flex-col items-center">
                                          ${svgCercania}
                                          <h3 class="text-[#005a8c] font-bold text-[7.5px] uppercase leading-tight mb-1">${bot_t6}</h3>
                                          <p class="text-[#444] text-[6px] leading-tight font-medium">${bot_d6}</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </main>
                      <footer class="bg-[#019cde] text-white flex justify-between items-center px-10 h-[85px] w-full box-border shrink-0 break-inside-avoid relative z-30">
                          <div class="flex items-center gap-3 flex-1">
                              <svg class="w-9 h-9 text-white flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                              <div class="flex flex-col justify-center">
                                  <span class="font-bold text-[9px] tracking-[0.5px] leading-tight">UNSISTEMA.</span>
                                  <span class="font-bold text-[9px] tracking-[0.5px] leading-tight">TU ALIADO TECNOLÓGICO.</span>
                                  <p class="m-0 text-[8px] leading-[1.2] font-light text-white mt-0.5">Soluciones confiables para personas<br>y empresas que buscan más</p>
                              </div>
                          </div>
                          <div class="h-9 w-[1px] bg-white/40 mx-3 flex-shrink-0"></div>
                          <div class="flex items-center gap-3 flex-1 pl-1">
                              <svg class="w-8 h-8 text-white flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M9 11l2 2 4-4"></path></svg>
                              <div class="flex flex-col justify-center">
                                  <span class="font-bold text-[9px] tracking-[0.5px] leading-tight">TECNOLOGÍA QUE IMPULSA.</span>
                                  <span class="font-bold text-[9px] tracking-[0.5px] leading-tight">SOLUCIONES QUE RESPALDAN.</span>
                                  <p class="m-0 text-[8px] leading-[1.2] font-light text-white mt-0.5">Herramientas potentes y sencillas<br>para retos complejos</p>
                              </div>
                          </div>
                          <div class="h-9 w-[1px] bg-white/40 mx-3 flex-shrink-0"></div>
                          <div class="flex flex-col items-center justify-center flex-1 pl-1 gap-1.5">
                              <img src="${logoFooterBase64}" alt="Logo Footer" class="w-[145px] h-auto">
                              <div class="flex items-center gap-1 text-[7.5px] font-medium tracking-[0.3px] text-white">
                                  <span>TECNOLOGÍA</span>
                                  <span class="text-white/40 font-light text-[6px]">|</span>
                                  <span>SEGURIDAD</span>
                                  <span class="text-white/40 font-light text-[6px]">|</span>
                                  <span>CONFIANZA</span>
                                  <span class="text-white/40 font-light text-[6px]">|</span>
                                  <span>RESULTADOS</span>
                              </div>
                          </div>
                      </footer>
                  </div>
              </body>
              </html>
            `;
          }

          await page.setContent(templateHTML, { waitUntil: 'load', timeout: 60000 });
          await new Promise(resolve => setTimeout(resolve, 4000));
          
          const nombreArchivo = `${titulo2.replace(/\s+/g, '_')}_${Date.now()}`;

          await page.screenshot({ 
            path: path.join(dirPng, `${nombreArchivo}.png`), 
            fullPage: true 
          });

          await page.pdf({
            path: path.join(dirPdf, `${nombreArchivo}.pdf`),
            width: '794px',
            height: '1123px',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            pageRanges: '1'
          });

          generatedFiles.push({
            servicio: titulo2,
            png: `/infografias/formato_png/${nombreArchivo}.png`,
            pdf: `/infografias/formato_pdf/${nombreArchivo}.pdf`
          });
        }

        await browser.close();
        if (fs.existsSync(csvFile.path)) fs.unlinkSync(csvFile.path);
        uploadedImages.forEach(img => {
          if (fs.existsSync(img.path)) fs.unlinkSync(img.path);
        });

        res.json({ success: true, files: generatedFiles });

      } catch (error) {
        if (fs.existsSync(csvFile.path)) fs.unlinkSync(csvFile.path);
        uploadedImages.forEach(img => {
          if (fs.existsSync(img.path)) fs.unlinkSync(img.path);
        });
        res.status(500).json({ success: false, error: error.message });
      }
    });
});

app.listen(36000, () => {});