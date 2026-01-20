import express, { Request, Response } from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import aclMiddleware from "../middlewares/acl.middleware";
import mediaMiddleware from "../middlewares/media.middleware";
import { ROLES } from "../utils/constant";
import mediaControllers from "../controllers/media.controller";
import uploadSingle from "../middlewares/media.middleware";
import { screeningController } from "../controllers/screening.controller";

const router = express.Router();

// --- Auth Public ---
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/activation", authController.activation);

// --- Auth Protected ---
router.get("/auth/me", authMiddleware, (req, res) => {
  /* #swagger.security = [{ "bearerAuth": [] }] */
  authController.me(req, res);
});

// Update Profile
router.put(
  "/auth/update-profile",
  [authMiddleware, aclMiddleware([ROLES.USER])],
  authController.updateProfile
);

router.put(
  "/auth/update-password",
  [authMiddleware, aclMiddleware([ROLES.USER])],
  (req: Request, res: Response) => {
    /* #swagger.security = [{ "bearerAuth": [] }] */
    authController.updatePassword(req, res);
  }
);

// --- Media Handling ---
router.post(
  "/media/upload-single",
  [
    authMiddleware,
    aclMiddleware([ROLES.ADMIN, ROLES.USER]),
    mediaMiddleware.single("file"),
  ],
  (req: Request, res: Response) => {
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.parameters['file'] = {
        in: 'formData',
        type: 'file',
        required: true,
        description: 'File gambar yang akan diupload'
    } */
    mediaControllers.single(req, res);
  }
);

router.post(
  "/media/upload-multiple",
  [
    authMiddleware,
    aclMiddleware([ROLES.ADMIN, ROLES.USER]),
    mediaMiddleware.multiple("files"),
  ],
  (req: Request, res: Response) => {
    /* #swagger.security = [{ "bearerAuth": [] }] */
    mediaControllers.multiple(req, res);
  }
);

router.delete(
  "/media/remove",
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.USER])],
  (req: Request, res: Response) => {
    /* #swagger.security = [{ "bearerAuth": [] }] */
    mediaControllers.remove(req, res);
  }
);

// --- SCREENING IMAGE PROCESSING ---
router.post("/screening/analyze", authMiddleware, (req: Request, res: Response) => {
  screeningController.analyzeImage(req, res);
});

router.get("/screening/history", authMiddleware, (req: Request, res: Response) => {
  /* #swagger.security = [{ "bearerAuth": [] }] */
  screeningController.getHistory(req, res);
});

export default router;