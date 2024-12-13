/**
 *  @prettier
 */

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import archiver from 'archiver'

// npx ts-node scripts/job/changeQualityImages.js

// Ruta de la carpeta de imágenes de entrada
const inputFolder = './input-images'
const outputArchive = './output-images.zip'

// Calidad deseada (0 a 100)
const quality = 15

async function processImages() {
  try {
    const files = fs.readdirSync(inputFolder)
    const output = fs.createWriteStream(outputArchive)
    const archive = archiver('zip', { zlib: { level: 9 } })
    output.on('close', () => {
      console.log(`Archivo ZIP creado: ${outputArchive} (${archive.pointer()} bytes)`)
    })
    archive.on('error', (err) => {
      throw err
    })
    archive.pipe(output)
    for (const file of files) {
      const inputPath = path.join(inputFolder, file)
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file).toLowerCase())) {
        console.log(`Procesando: ${file}`)
        const imageBuffer = await sharp(inputPath).jpeg({ quality }).toBuffer()
        archive.append(imageBuffer, { name: file })
      } else {
        console.log(`Saltando: ${file} (no es una imagen soportada)`)
      }
    }

    await archive.finalize()
    console.log('Procesamiento de imágenes completado.')
  } catch (error) {
    console.error('Error procesando las imágenes:', error)
  }
}

processImages()
