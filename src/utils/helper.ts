import "dotenv/config"
import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { v2 as cloudinary } from "cloudinary"

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

export const uploadOnCloudinary = async (filepath: string) => {
    const result = await cloudinary.uploader.upload(filepath)
    return { public_id: result.public_id, url: result.secure_url }
}


export const gentoken = (userid: string) => {
    return jwt.sign({ id: userid }, process.env.JWT_SECRET as string, { expiresIn: "15m" })
}
