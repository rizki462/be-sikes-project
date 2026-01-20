import mongoose from "mongoose";

const screeningSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  diagnosis: { type: String, required: true },
  confidence: { type: Number, required: true },
  recommendation: { type: String },
  imageUrl: { type: String }, // Simpan URL gambar jika diupload ke cloud
  status: { 
    type: String, 
    enum: ["Normal", "Indikasi Ditemukan"], 
    default: "Normal" 
  },
  createdAt: { type: Date, default: Date.now }
});

const ScreeningModel = mongoose.model("Screening", screeningSchema);
export default ScreeningModel;