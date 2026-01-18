import { Response } from "express";

import { IReqUser } from "../middlewares/auth.middleware";
import uploader from "../utils/uploader";

export default {
  async single(req: IReqUser, res: Response) {
    if (!req.file) {
      return res.status(400).json({ message: "File is not exist", data: null });
    }

    try {
      const file = req.file;
      const result = await uploader.uploadSingle(file as Express.Multer.File);
      res.status(200).json({ message: "Success upload file", data: result });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(500).json({ message: "Error upload file", data: null });
    }
  },
  async multiple(req: IReqUser, res: Response) {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "File are not exist", data: null });
    }

    try {
      const result = await uploader.uploadMultiple(
        req.files as Express.Multer.File[]
      );
      res.status(200).json({ message: "Success upload file", data: result });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(500).json({ message: "Error upload files", data: null });
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
        const { fileUrl } = req.body as { fileUrl: string };
        const result = await uploader.remove(fileUrl);
        res.status(200).json({ message: "Success remove file", data: result });
    } catch (error) {
        const err = error as unknown as Error;
        res.status(500).json({ message: "Error remove file", data: null });
    }
  },
};
