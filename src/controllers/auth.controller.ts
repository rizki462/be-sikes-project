import { Request, Response } from "express";
import UserModel, { userDTO, userLoginDTO, userUpdatePasswordDTO } from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middlewares/auth.middleware";
import response from "../utils/response";

export default {
    async register(req: Request, res: Response) {
        const { fullname, username, email, password, confirmPassword } = req.body;

        try { 
            // Validasi Schema Yup
            await userDTO.validate({ fullname, username, email, password, confirmPassword });

            // Validasi username dan email jika sudah terdaftar
            const existingUser = await UserModel.findOne({ 
                $or: [{ username }, { email }] 
            });
            if (existingUser) {
                const field = existingUser.username === username ? "username" : "email";
                return res.status(400).json({
                    message: `${field} sudah terdaftar, silahkan gunakan yang lain`,
                    data: null
                });
            };

            // simpan user ke database
            const result = await UserModel.create({ fullname, username, email, password, role: 'user' });
            res.status(200).json({ message: "Pendaftaran Berhasil", data: result });
        } catch (error) {
            const err = error as unknown as Error
            res.status(400).json({ message: err.message, data: null });
        }
    },

    async login(req: Request, res: Response) {
        try {
            const { identifier, password } = req.body;
            await userLoginDTO.validate({ identifier, password });
            
            const userByIdentifier = await UserModel.findOne({
                $or: [
                    { username: identifier },
                    { email: identifier }
                ],
                isActive: true
            });
            // Validasi identifier user
            if (!userByIdentifier) {
                return res.status(400).json({
                    message: "User tidak ditemukan",
                    data: null
                });
            };

            // Validasi status user
            if (!userByIdentifier.isActive) {
                return res.status(403).json({
                    message: "User belum diaktifkan",
                    data: null
                });
            };

            // Validasi password
            const validatePassword: Boolean = encrypt(password) === userByIdentifier.password;
            if (!validatePassword) {
                return res.status(401).json({
                    message: "Password salah",
                    data: null
                });
            };

            // Generate Token
            const token = generateToken({
                id: userByIdentifier._id,
                role: userByIdentifier.role
            })

            // Response
            res.status(200).json({
                message: "Login Success",
                data: token,
            });

        } catch (error) {
            const err = error as unknown as Error
            res.status(400).json({ message: err.message, data: null });
        }
    },

    async me(req: IReqUser, res: Response) {
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id);

            res.status(200).json({
                message: "Success get user profile", data: result
            });

        } catch (error) {
            const err = error
            response.error(res, err, "Failed to get user profile");
        }
    },

    async activation(req: Request, res: Response) {
        try {
            const { code } = req.body as {code: string};

            const user = await UserModel.findOneAndUpdate(
                { 
                    activationCode: code 
                },
                { 
                    isActive: true 
                },
                { 
                    new: true 
                }
            );

            res.status(200).json({
                message: "User successfully activated",
                data: user
            });

        } catch (error) {
            const err = error as unknown as Error
            res.status(400).json({ message: err.message, data: null });
        }
    },

    async updateProfile(req: IReqUser, res: Response){
        try {
            const userId = req.user?.id;
            const { fullname, profilePicture } = req.body;
            const result = await UserModel.findByIdAndUpdate(userId, {
                fullname,
                profilePicture,
                },
                {
                    new: true, 
                }
            );

            if(!result) return response.notFound(res, "User not found");

            response.success(res, result, "Profile updated successfully");
            
        } catch (error) {
            response.error(res, error, "Failed to update profile");
        }
    },
    async updatePassword(req: IReqUser, res: Response){
        try {
            const userId = req.user?.id;
            const { oldPassword, password, confirmPassword } = req.body;

            await userUpdatePasswordDTO.validate({
                oldPassword,
                password,
                confirmPassword
            });

            const user = await UserModel.findById(userId);

            if(!user || user.password !== encrypt(oldPassword))
                return response.notFound(res, "User not found");

            const result = await UserModel.findByIdAndUpdate(userId, {
                password: encrypt(password),
                },
                {
                    new: true, 
                }
            );

            response.success(res, result, "Password updated successfully");
            
        } catch (error) {
            response.error(res, error, "Failed to update password");
        }
    },
};
