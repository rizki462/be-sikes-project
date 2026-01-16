import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";

import { renderMailHtml, sendEmail } from '../utils/mail/mail';
import { CLIENT_HOST, EMAIL_SMTP_USER } from "../utils/env";

export interface User {
    fullname: string;
    username: string;
    email: string;
    password: string;
    role: string;
    profilePicture: string; // URL to profile picture
    isActive: boolean;
    activationCode: string;
    createdAt?: string;
}

const Schema = mongoose.Schema;

const UserSchema = new Schema<User>({
    fullname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    profilePicture: { type: String, default: '/images/dafault/user.png' }, // URL to profile picture
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