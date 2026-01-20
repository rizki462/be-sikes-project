import { Response } from "express";
import axios from "axios";
import { analyzeObjectDetection } from "../utils/ai/scanner";
import ScreeningModel from "../models/screening.model";
import response from "../utils/response";

// Sesuaikan interface agar cocok dengan scanner.ts
interface Analysis {
  diagnosis: string;
  confidence: number; // Ubah ke number
  recommendation: string;
  status: string;
}

export const screeningController = {
  analyzeImage: async (req: any, res: Response) => {
    try {
      // Ambil imageUrl dari body, bukan file dari req.file
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return response.error(res, null, "URL gambar tidak ditemukan");
      }

      // Download gambar dari URL menjadi Buffer agar bisa diproses TF.js
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(imageResponse.data, 'binary');

      // Jalankan Analisis AI
      const analysis = await analyzeObjectDetection(buffer);

      const newScreening = new ScreeningModel({
        userId: req.user.id,
        diagnosis: analysis.diagnosis,
        confidence: analysis.confidence,
        recommendation: analysis.recommendation,
        imageUrl: imageUrl, // Simpan URL asli untuk riwayat
        status: analysis.confidence > 70 ? "Normal" : "Perlu Perhatian"
      });

      await newScreening.save();
      return response.success(res, newScreening, "Analisis objek berhasil disimpan");
    } catch (error) {
      console.error("Backend Error:", error);
      return response.error(res, error, "Gagal memproses gambar dari URL");
    }
  },

  getHistory: async (req: any, res: Response) => {
    try {
      const history = await ScreeningModel.find({ userId: req.user.id }).sort({ createdAt: -1 });
      return response.success(res, history, "Berhasil mengambil riwayat");
    } catch (error) {
      return response.error(res, error, "Gagal mengambil riwayat");
    }
  }
};