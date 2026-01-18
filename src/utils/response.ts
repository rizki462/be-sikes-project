import { Response } from "express";

// Standarisasi format response untuk API Sikes
const response = {
  // Response Berhasil (200 OK)
  success: (res: Response, data: any, message: string = "Success") => {
    return res.status(200).json({
      message,
      data,
    });
  },

  // Response Error Umum (400 Bad Request) - Sering dipakai untuk validasi input/yup
  error: (res: Response, error: any, message: string = "Error") => {
    // Jika error datang dari Yup Validation, ambil pesan pertamanya
    const errorMessage = error?.message || error;
    
    return res.status(400).json({
      message: errorMessage,
      data: null,
    });
  },

  // Response Data Tidak Ditemukan (404 Not Found)
  notFound: (res: Response, message: string = "Resource not found") => {
    return res.status(404).json({
      message,
      data: null,
    });
  },

  // Response Tidak Memiliki Izin (401 Unauthorized / 403 Forbidden)
  unauthorized: (res: Response, message: string = "Unauthorized access") => {
    return res.status(401).json({
      message,
      data: null,
    });
  },

  forbidden: (res: Response, message: string = "Access forbidden") => {
    return res.status(403).json({
      message,
      data: null,
    });
  }
};

export default response;