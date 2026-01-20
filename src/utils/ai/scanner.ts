import * as tf from '@tensorflow/tfjs';
// backend CPU di Node.js
import '@tensorflow/tfjs-backend-cpu'; 
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { createCanvas, loadImage } from 'canvas';

export const analyzeObjectDetection = async (imageBuffer: Buffer) => {
  // Set backend ke CPU secara eksplisit sebelum memproses
  await tf.setBackend('cpu');
  await tf.ready();

  // 1. Memuat model COCO-SSD
  const model = await cocoSsd.load();

  // 2. Pre-processing gambar
  const img = await loadImage(imageBuffer);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // 3. Deteksi Objek
  const predictions = await model.detect(canvas as any);

  // 4. Mapping hasil sesuai standar output SIKes
  if (predictions.length > 0) {
    const mainObject = predictions[0];
    return {
      diagnosis: `Terdeteksi: ${mainObject.class}`,
      confidence: Math.round(mainObject.score * 100),
      status: "Berhasil Dianalisis",
      recommendation: `Sistem mengenali objek ini sebagai ${mainObject.class} dengan akurasi tinggi.`
    };
  }

  return {
    diagnosis: "Objek tidak dikenali",
    confidence: 0,
    status: "Gagal",
    recommendation: "Coba gunakan foto dengan pencahayaan yang lebih baik."
  };
};