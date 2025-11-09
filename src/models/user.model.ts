import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";

export interface User {
    username: string;
    email: string;
    password: string;
    role: string;
    profilePicture: string; // URL to profile picture
    isActive: boolean;
    activationCode: string;
}

const Schema = mongoose.Schema;

const UserSchema = new Schema<User>({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    profilePicture: { type: String, default: 'user.jpg' }, // URL to profile picture
    isActive: { type: Boolean, default: false },
    activationCode: { type: Schema.Types.String },
},
{
    timestamps: true
});

UserSchema.pre('save', function(next){
    const user = this;
    user.password = encrypt(user.password);
    next();
});

UserSchema.methods.toJSON = function (){
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
}

const UserModel = mongoose.model<User>('User', UserSchema);

export default UserModel;