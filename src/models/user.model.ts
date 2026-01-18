import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";

import { renderMailHtml, sendEmail } from '../utils/mail/mail';
import { CLIENT_HOST, EMAIL_SMTP_USER } from "../utils/env";
import { ROLES } from "../utils/constant";
import * as Yup from "yup";


const validatePassword = Yup.string()
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
        });
const validateConfirmPassword = Yup.string().oneOf([Yup.ref("password"), "" ], "Password tidak sama");


export const USER_MODEL_NAME = "User";

export const userLoginDTO = Yup.object({
   identifier: Yup.string().required(),
   password: validatePassword,
});

export const userUpdatePasswordDTO = Yup.object({
    oldPassword: validatePassword,
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
});

export const userDTO = Yup.object({
    fullname: Yup.string().required(),
    username: Yup.string().required(),
    email: Yup.string().email().required(),
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
});


export type TypeUser = Yup.InferType<typeof userDTO>;

export interface User extends Omit<TypeUser, "confirmPassword"> {
    isActive: boolean;
    activationCode: string;
    role: string;
    profilePicture: string;
    createdAt?: string;
}

const Schema = mongoose.Schema;

const UserSchema = new Schema<User>({
    fullname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: [ROLES.ADMIN, ROLES.USER, ROLES.MANAGER], default: ROLES.USER },
    profilePicture: { type: String, default: '/images/default/user.png' }, // URL to profile picture
    isActive: { type: Boolean, default: false },
    activationCode: { type: Schema.Types.String },
},
{
    timestamps: true
});

UserSchema.pre('save', function(next){
    const user = this;
    user.password = encrypt(user.password);
    user.activationCode = encrypt(user.id);
    next();
});

UserSchema.post("save", async function(doc, next) {
    try {
        const user = doc;

        console.log(`Send email to`, user);
        

        const contentMail = await renderMailHtml("registration-success.ejs", {
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            activationLink: `${CLIENT_HOST}/auth/activation?code=${user.activationCode}`
        });

        await sendEmail({
        from: EMAIL_SMTP_USER,
        to: user.email,
        subject: "Aktivasi akun Anda",
        html: contentMail
        });

    } catch (error) {
        console.log("error send email", error);
    } finally {
        next();
    }
});


UserSchema.methods.toJSON = function (){
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
}

const UserModel = mongoose.model<User>('User', UserSchema);

export default UserModel;