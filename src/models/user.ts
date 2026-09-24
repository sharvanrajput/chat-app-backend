import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs"

export interface ImgType {
    public_id: string,
    url: string
}

export interface User {
    avatar: ImgType,
    name: string,
    username: string,
    password: string,
    bio: string,
}

const schema = new Schema<User>({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    bio: {
        type: String,
        required: true
    },
}, { timestamps: true })

schema.pre("save", async function () {
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10)
})

export const User = model<User>("User", schema)