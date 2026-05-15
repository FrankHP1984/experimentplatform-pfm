const fs = require('fs');
const path = require('path');

// Leer el SVG
const svgPath = path.join(__dirname, 'frontend', 'public', 'favicon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Crear un HTML temporal para renderizar el SVG
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background: transparent; }
    svg { display: block; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>
`;

// Guardar HTML temporal
const htmlPath = path.join(__dirname, 'temp-logo.html');
fs.writeFileSync(htmlPath, html);

console.log('HTML temporal creado en:', htmlPath);
console.log('Abre este archivo en un navegador y haz captura de pantalla,');
console.log('o usa una herramienta online de conversión SVG a PNG.');
console.log('\nAlternativa: Usa https://cloudconvert.com/svg-to-png');
