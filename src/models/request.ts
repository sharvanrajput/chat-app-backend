import { Schema, Types, model } from "mongoose";

interface RequestSchemas {
    status: "accepted" | "pending" | "rejected",
    sender: Types.ObjectId,
    reciver: Types.ObjectId,

}

const schema = new Schema<RequestSchemas>({
    status: {
        type: String,
        default: "pending",
        enum: ["accepted", "pending", "rejected"]
    },
    sender: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    reciver: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },

}, { timestamps: true })

export const Request = model<RequestSchemas>("Request", schema)