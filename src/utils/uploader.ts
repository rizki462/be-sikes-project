import { v2 as cloudinary } from "cloudinary";

import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "./env";

const cloudName = CLOUDINARY_CLOUD_NAME;
const apiKey = CLOUDINARY_API_KEY;
const apiSecret = CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const toDataUrl = (file: Express.Multer.File) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURL = `data:${file.mimetype};base64,${b64}`;
  return dataURL;
};

const getPublicIdFromFileUrl = (fileUrl: string) => {
  const fileNameUsingSubstring = fileUrl.substring(
    fileUrl.lastIndexOf("/") + 1
  );
  const publicId = fileNameUsingSubstring.substring(
    0,
    fileNameUsingSubstring.lastIndexOf(".")
  );
  return publicId;
};

export default {
  async uploadSingle(file: Express.Multer.File) {
    const fileDataUrl = toDataUrl(file);
    const result = await cloudinary.uploader.upload(fileDataUrl, {
      resource_type: "auto",
    });
    return result;
  },
  async uploadMultiple(file: Express.Multer.File[]) {
    const uploadBatch = file.map((item) => {
      const result = this.uploadSingle(item);
      return result;
    });

    const result = await Promise.all(uploadBatch);
    return result;
  },
  async remove(fileUrl: string) {
    const publicId = getPublicIdFromFileUrl(fileUrl);
    const result = await cloudinary.uploader.destroy(fileUrl);
    return result;
  },
};
