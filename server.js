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

function getBase64Image(filePath) {
  const imgData = fs.readFileSync(filePath);
  const ext = path.extname(filePath).substring(1) || 'png';
  return `data:image/${ext};base64,${imgData.toString('base64')}`;
}

function resolveImage(imgPath, dir) {
  if (!imgPath) return '';
  if (imgPath.startsWith('http')) {
    return imgPath;
  }
  if (imgPath.startsWith('.')) {
    return getBase64Image(path.resolve(dir, imgPath));
  }
  return imgPath;
}

const logoBase64 = getBase64Image(path.resolve(__dirname, 'logo.png'));
const logoFooterBase64 = getBase64Image(path.resolve(__dirname, 'logo_footer.png'));

app.post('/upload', upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded.' });
  }

  const resultados = [];
  const generatedFiles = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => resultados.push(data))
    .on('end', async () => {
      try {
        
        const browser = await puppeteer.launch({ 
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
            titulo1 = '', titulo2 = '', titulo3 = '', imagen = '',
            hero_subtitle = 'PROPUESTA TÉCNICA Y ECONÓMICA',
            hero_desc = 'Ciberseguridad avanzada para proteger tu empresa, tus datos y lo que realmente importa.',
            hero_highlight = 'Ligera. Eficaz. Confiable.',
            hero_pill_t1 = 'logo',
            hero_pill_t2 = 'BUSINESS',
            hero_pill_t3 = 'SOLUTION',
            hero_badge = 'DISTRIBUIDOR OFICIAL',
            sec1_titulo = '¿QUÉ INCLUYE NUESTRO SERVICIO ESET BUSINESS?',
            sec2_titulo = '¿TE SUENA FAMILIAR?',
            sec3_titulo = 'CON UNSISTEMA, TODO CAMBIA',
            sec4_titulo = '¿POR QUÉ ELEGIR UNSISTEMA?',
            img_caja1 = '', img_caja2 = '',
            caja1_t1 = 'PROTECCIÓN ENDPOINT', caja1_d1 = 'Antivirus, antimalware, firewall y control de dispositivos.',
            caja1_t2 = 'SEGURIDAD CLOUD', caja1_d2 = 'Protección de datos y aplicaciones en la nube. Integración total.',
            caja1_t3 = 'SEGURIDAD DEL CORREO', caja1_d3 = 'Anti spam, anti phishing y protección avanzada para email.',
            caja1_t4 = 'SEGURIDAD DE SERVIDORES', caja1_d4 = 'Protección para Windows, Linux y entornos virtualizados.',
            caja1_t5 = 'DISPOSITIVOS MÓVILES', caja1_d5 = 'Seguridad para móviles y tablets (iOS y Android) de tu empresa.',
            caja1_t6 = 'CIFRADO Y CONTROL', caja1_d6 = 'Cifrado de discos, control de dispositivos y filtrado web.',
            caja1_t7 = 'CONSOLA CENTRALIZADA', caja1_d7 = 'Gestión remota, informes, políticas y alertas en tiempo real.',
            c2_t1 = 'Ransomware que paraliza tu empresa.', c2_t2 = 'Pérdida de datos críticos.',
            c2_t3 = 'Empleados víctimas de phishing.', c2_t4 = 'Equipos lentos o inseguros.',
            c2_t5 = 'Fugas de información y sanciones.', c2_t6 = 'Costos elevados por incidentes.',
            c2_t7 = 'Falta de control y visibilidad.',
            c3_t1 = 'Protegemos tu empresa 24/7.', c3_t2 = 'Tus datos, equipos y usuarios seguros.',
            c3_t3 = 'Detectamos y bloqueamos amenazas<br>antes de que impacten.', c3_t4 = 'Máxima productividad, cero interrupciones.',
            c3_t5 = 'Ahorro real en costes y tiempo.', c3_t6 = 'Tranquilidad total, nosotros nos encargamos.',
            bot_t1 = 'EXPERIENCIA', bot_d1 = 'Más de 20 años cuidando webs y negocios online.',
            bot_t2 = 'ESPECIALISTAS', bot_d2 = 'Equipo certificado en ciberseguridad ESET.',
            bot_t3 = 'RESPUESTA RÁPIDA', bot_d3 = 'Atención ágil y eficaz cuando más lo necesitas.',
            bot_t4 = 'TECNOLOGÍA LÍDER', bot_d4 = 'Herramientas potentes y soluciones avanzadas.',
            bot_t5 = 'CONFIANZA', bot_d5 = 'Transparencia, compromiso y resultados.',
            bot_t6 = 'CERCANÍA', bot_d6 = 'Hablamos tu idioma, estamos siempre a tu lado.'
          } = resultados[i];
          
          const srcImagen = resolveImage(imagen, __dirname);
          const srcImgCaja1 = resolveImage(img_caja1, __dirname);
          const srcImgCaja2 = resolveImage(img_caja2, __dirname);

          const htmlContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700;800&display=swap" rel="stylesheet">
                <style>
                    @page { margin: 0; size: 794px 1123px; }
                    html, body { 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        width: 794px; 
                        height: 1123px; 
                        overflow: hidden; 
                        background-color: white; 
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .a4-canvas { width: 100%; height: 100%; position: relative; }
                    @media print {
                        html, body, .a4-canvas {
                            width: 794px !important;
                            height: 1123px !important;
                            page-break-inside: avoid;
                        }
                    }
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
                                    <div class="absolute inset-0 bg-[#019cde]/60 z-10 mix-blend-multiply"></div>
                                    <div class="absolute inset-0 bg-gradient-to-t from-[#005f8a] to-transparent z-10 opacity-70"></div>
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
                                        <h3 class="text-[#005a8c] font-bold text-[7px] uppercase leading-tight mb-1">${caja1_t1}</h3>
                                        <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d1}</p>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <svg class="w-7 h-7 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25(5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"></path></svg>
                                        <h3 class="text-[#005a8c] font-bold text-[7px] uppercase leading-tight mb-1">${caja1_t2}</h3>
                                        <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d2}</p>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <svg class="w-7 h-7 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"></path></svg>
                                        <h3 class="text-[#005a8c] font-bold text-[7px] uppercase leading-tight mb-1">${caja1_t3}</h3>
                                        <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d3}</p>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <svg class="w-7 h-7 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"></path></svg>
                                        <h3 class="text-[#005a8c] font-bold text-[7px] uppercase leading-tight mb-1">${caja1_t4}</h3>
                                        <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d4}</p>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <svg class="w-7 h-7 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"></path></svg>
                                        <h3 class="text-[#005a8c] font-bold text-[7px] uppercase leading-tight mb-1">${caja1_t5}</h3>
                                        <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d5}</p>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <svg class="w-7 h-7 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"></path></svg>
                                        <h3 class="text-[#005a8c] font-bold text-[7px] uppercase leading-tight mb-1">${caja1_t6}</h3>
                                        <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d6}</p>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <svg class="w-7 h-7 text-[#005a8c] mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"></path></svg>
                                        <h3 class="text-[#005a8c] font-bold text-[7px] uppercase leading-tight mb-1">${caja1_t7}</h3>
                                        <p class="text-[#444] text-[6px] leading-tight font-medium">${caja1_d7}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="px-6 grid grid-cols-2 gap-3 min-h-[155px]">
                                <div class="rounded-xl bg-[#111827] flex relative overflow-hidden shadow-lg h-auto">
                                    <div class="w-[58%] p-4 z-20 flex flex-col justify-center">
                                        <h3 class="text-[#ff3b3b] font-bold text-[10px] mb-3 uppercase tracking-wide break-words">${sec2_titulo}</h3>
                                        <ul class="flex flex-col gap-1.5">
                                            <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#ff3b3b] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-[#e2e8f0] text-[7px] font-bold">${c2_t1}</span></li>
                                            <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#ff3b3b] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-[#e2e8f0] text-[7px] font-bold">${c2_t2}</span></li>
                                            <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#ff3b3b] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-[#e2e8f0] text-[7px] font-bold">${c2_t3}</span></li>
                                            <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#ff3b3b] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-[#e2e8f0] text-[7px] font-bold">${c2_t4}</span></li>
                                            <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#ff3b3b] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-[#e2e8f0] text-[7px] font-bold">${c2_t5}</span></li>
                                            <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#ff3b3b] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-[#e2e8f0] text-[7px] font-bold">${c2_t6}</span></li>
                                            <li class="flex items-center gap-1.5"><svg class="w-3 h-3 text-[#ff3b3b] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg><span class="text-[#e2e8f0] text-[7px] font-bold">${c2_t7}</span></li>
                                        </ul>
                                    </div>
                                    <div class="absolute right-0 top-0 w-[55%] h-full z-10">
                                        <div class="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/80 to-transparent z-10"></div>
                                        <img src="${srcImgCaja1}" class="w-full h-full object-cover">
                                    </div>
                                </div>
                                <div class="rounded-xl bg-white border-[1px] border-gray-200 shadow-lg flex relative overflow-hidden h-auto">
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
                                    <div class="absolute right-0 top-0 w-[55%] h-full z-10">
                                        <div class="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10"></div>
                                        <img src="${srcImgCaja2}" class="w-full h-full object-cover">
                                    </div>
                                </div>
                            </div>
                            <div class="px-10 pb-2">
                                <h2 class="text-center text-[#005a8c] font-extrabold text-[12px] mb-3 tracking-wide">${sec4_titulo}</h2>
                                <div class="grid grid-cols-6 gap-4 text-center">
                                    <div class="flex flex-col items-center">
                                        <svg class="w-8 h-8 text-[#005a8c] mb-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"></path></svg>
                                        <h3 class="text-[#005a8c] font-bold text-[7.5px] uppercase leading-tight mb-1">${bot_t1}</h3>
                                        <p class="text-[#444] text-[6px] leading-tight font-medium">${bot_d1}</p>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <svg class="w-8 h-8 text-[#005a8c] mb-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"></path></svg>
                                        <h3 class="text-[#005a8c] font-bold text-[7.5px] uppercase leading-tight mb-1">${bot_t2}</h3>
                                        <p class="text-[#444] text-[6px] leading-tight font-medium">${bot_d2}</p>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <svg class="w-8 h-8 text-[#005a8c] mb-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"></path></svg>
                                        <h3 class="text-[#005a8c] font-bold text-[7.5px] uppercase leading-tight mb-1">${bot_t3}</h3>
                                        <p class="text-[#444] text-[6px] leading-tight font-medium">${bot_d3}</p>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <svg class="w-8 h-8 text-[#005a8c] mb-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854-.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71-.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        <h3 class="text-[#005a8c] font-bold text-[7.5px] uppercase leading-tight mb-1">${bot_t4}</h3>
                                        <p class="text-[#444] text-[6px] leading-tight font-medium">${bot_d4}</p>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <svg class="w-8 h-8 text-[#005a8c] mb-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"></path></svg>
                                        <h3 class="text-[#005a8c] font-bold text-[7.5px] uppercase leading-tight mb-1">${bot_t5}</h3>
                                        <p class="text-[#444] text-[6px] leading-tight font-medium">${bot_d5}</p>
                                    </div>
                                    <div class="flex flex-col items-center">
                                        <svg class="w-8 h-8 text-[#005a8c] mb-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"></path></svg>
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

          await page.setContent(htmlContent, { waitUntil: 'load', timeout: 60000 });
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
        fs.unlinkSync(req.file.path);
        res.json({ success: true, files: generatedFiles });

      } catch (error) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, error: error.message });
      }
    });
});

app.listen(36000, () => {});