import { Request, Response } from "express";
import * as Yup from "yup";

// Model
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middlewares/auth.middleware";

// Schema Register
type TRegister = {
    fullname: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// Schema Login
type TLogin = {
    identifier: string;
    password: string;
}


const registerValidateSchema = Yup.object({
    fullname: Yup.string().required(),
    username: Yup.string().min(5, "Username minimal harus 5 karakter").required(),
    email: Yup.string().email("Email tidak valid").required(),
    password: Yup.string()
        .min(8, "Password minimal harus 8 karakter")
        .required()
        .test('at-least-one-uppercase-letter', "Password harus memiliki 1 atau lebih huruf besar", (value) => {
            if(!value) return false;
            const regex = /^(?=.*[A-Z])/;
            return regex.test(value);
        })
        .test('at-least-one-number', "Password harus memiliki 1 atau lebih angka", (value) => {
            if(!value) return false;
            const regex = /^(?=.*\d)/;
            return regex.test(value);
        }),
    confirmPassword: Yup.string().oneOf([Yup.ref("password"), "" ], "Password tidak sama")
});

export default {
    async register(req: Request, res: Response) {
        /**
        #swagger.tags = ['Auth']
         */
        const { fullname, username, email, password, confirmPassword } = req.body as unknown as TRegister;

        try {
            await registerValidateSchema.validate({ fullname, username, email, password, confirmPassword });
            const result = await UserModel.create({ fullname, username, email, password, role: 'user' });
            res.status(200).json({ message: "Pendaftaran Berhasil", data: result });
        } catch (error) {
            const err = error as unknown as Error
            res.status(400).json({ message: err.message, data: null });
        }
    },

    async login(req: Request, res: Response) {
        /**
         #swagger.tags = ['Auth']
         #swagger.requestBody = {
            required: true,
            schema: {
                $ref: '#/components/schemas/LoginRequest'
            }
         }
         */
        const { identifier, password } = req.body as unknown as TLogin;

        try {
            // Ambil data user berdasarkan Identifier -> (email dan username)
            
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
                return res.status(400).json({
                    message: "User belum diaktifkan",
                    data: null
                });
            };

            // Validasi password
            const validatePassword: Boolean = encrypt(password) === userByIdentifier.password;
            if (!validatePassword) {
                return res.status(400).json({
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
        /**
        #swagger.tags = ['Auth']
        #swagger.security = [{
            "bearerAuth": []
        }]
         */
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id);

            res.status(200).json({
                message: "Success get user profile", data: result
            });

        } catch (error) {
            const err = error as unknown as Error
            res.status(400).json({ message: err.message, data: null });
        }
    },

    async activation(req: Request, res: Response) {
        /**
        #swagger.tags = ['Auth']
        #swagger.requestBody = {
            required: true,
            schema: {
                $ref: '#/components/schemas/ActivationRequest'
            }
        }
         */
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
    }
};
