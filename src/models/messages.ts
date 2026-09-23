import { Schema, Types, model } from "mongoose";
import type { ImgType } from "./user.js";

interface MessageSchema {
    content: string,
    attachments: ImgType[],
    sender: Types.ObjectId,
    chatid: Types.ObjectId,
}

const schema = new Schema<MessageSchema>({
    content: String,
    attachments: [{
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    }],
    sender: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    chatid: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true })

export const Message = model<MessageSchema>("Message", schema)