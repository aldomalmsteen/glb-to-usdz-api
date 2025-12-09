const express = require('express');
const multer = require('multer');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Multer nos ayuda a manejar la subida de archivos
const upload = multer({ dest: 'uploads/' });

// La ruta de la herramienta de conversión
const gltfToUsdz = require.resolve('@google/gltf-to-usdz/gltf-to-usdz.js');

app.post('/convert', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se subió ningún archivo.');
  }

  const inputFile = req.file.path;
  const outputFile = path.join('uploads', `${Date.now()}.usdz`);

  // Ejecutamos la herramienta de línea de comandos open-source
  execFile('node', [gltfToUsdz, inputFile, outputFile], (error, stdout, stderr) => {
    // Limpiamos el archivo GLB original sin importar el resultado
    fs.unlinkSync(inputFile);

    if (error) {
      console.error(`Error: ${stderr}`);
      return res.status(500).send(`Error en la conversión: ${stderr}`);
    }

    // Si la conversión fue exitosa, enviamos el archivo USDZ de vuelta
    res.download(outputFile, 'converted.usdz', (err) => {
      if (err) {
        console.error('Error al enviar el archivo:', err);
      }
      // Limpiamos el archivo USDZ generado después de enviarlo
      fs.unlinkSync(outputFile);
    });
  });
});

app.listen(port, () => {
  console.log(`Servicio de conversión escuchando en el puerto ${port}`);
});
