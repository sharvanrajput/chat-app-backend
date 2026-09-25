import { Schema, Types, model } from "mongoose";


export interface ChatSchema {
    name: string,
    groupChat: boolean,
    creator: Types.ObjectId,
    members: Types.ObjectId[],
}

const schema = new Schema<ChatSchema>({
    name: {
        type: String,
        required: true
    },
    groupChat: {
        type: Boolean,
        default: false
    },
    creator: {
        type: Types.ObjectId,
        ref: "User"
    },
    members: [
        {
            type: Types.ObjectId,
            ref: "User"
        }
    ],

}, { timestamps: true })

export const Chat = model<ChatSchema>("Chat", schema)