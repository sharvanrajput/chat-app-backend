import "dotenv/config"
import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { v2 as cloudinary } from "cloudinary"
import { unlinkSync } from "fs"
import type { ImgType, User, UserType } from "../models/user.js"
import type { Types } from "mongoose"
import { AppError } from "./error.js"

export type ParamsType = {
    id: string;
};

export type QueryType = {
    page?: string;
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

const requiredEnv = (name: string): string => {
    const value = process.env[name]
    if (!value) {
        throw new Error(`${name} is not configured`)
    }
    return value
}

cloudinary.config({
    cloud_name: requiredEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: requiredEnv("CLOUDINARY_API_KEY"),
    api_secret: requiredEnv("CLOUDINARY_API_SECRET")
})

export type UploadFileType = {
    public_id: string;
    url: string;
}

export const uploadOnCloudinary = async (filepath: string[]): Promise<UploadFileType[]> => {

    const allCloudinaryFile = filepath.map(file => cloudinary.uploader.upload(file))

    const result = await Promise.all(allCloudinaryFile)

    filepath.map(file => unlinkSync(file))

    const AlterData = result.map(data => ({ public_id: data.public_id, url: data.secure_url }))

    return AlterData
}

export const delCloudnaryFile = async (public_ids: string[]): Promise<unknown[]> => {
    const promises = public_ids.map((id) => {
        cloudinary.uploader.destroy(id)
    })

    return promises
}



export const gentoken = (userid: string) => {
    return jwt.sign({ id: userid }, process.env.JWT_SECRET as string, { expiresIn: "1d" })
}

export const eventEmiter = (req: Request, event: string, users: Types.ObjectId[], data?: any) => {
    console.log("event emiting", event)
}

type MembetsType = {
    _id: string;
    avatar: ImgType;
    username: string;
}
export const otherMembers = (members: MembetsType[], id: string) => {
    return members.filter((member) => member._id !== id)
}
