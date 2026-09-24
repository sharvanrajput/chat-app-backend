
import bcrypt from "bcryptjs"
import { User, type ImgType } from "../models/user.js"
import { asyncHandler, gentoken, uploadOnCloudinary } from "../utils/helper.js"
import { error } from "node:console"
import { AppError } from "../utils/error.js"


const option = {
    httpOnly: true,
    secure: false,
    sameSite: "lax" as const,
    maxAge: 1000 * 60 * 15
}

export const signup = asyncHandler(async (req, res, next) => {
    const { name, username, password, bio } = req.body ?? {}
    const avatar = req.file

    if ([name, username, password, bio].some(field => typeof field !== "string" || field.trim() === "")) {
        return next(new AppError(400, "all fields are required"))
    }
    if (!avatar) {
        return next(new AppError(400, "avatar is  required"))
    }

    const existing = await User.findOne({ username })

    if (existing) {
        return next(new AppError(400, "user already exist"))
    }
    const profiledata = await uploadOnCloudinary(avatar.path)
    const user = await User.create({
        name,
        username,
        password,
        bio,
        avatar: { public_id: profiledata.public_id, url: profiledata.url }
    })

    const token = gentoken(user._id.toString())

    console.log({ name, username, password, avatar, bio })

    return res.cookie("token", token, option).status(201).json({ success: true, message: "Register Successfuly" })

})

export const signin = asyncHandler(async (req, res, next) => {

    const { username, password } = req.body

    if ([username, password].some(field => typeof field !== "string" || field.trim() === "")) {
        return next(new AppError(400, "all fields are required"))
    }

    const user = await User.findOne({ username }).select("+password")

    if (!user) {
        return next(new AppError(400, "user not exist"))
    }

    const isCorrect = await bcrypt.compare(password, user.password)

    if (!isCorrect) {
        return next(new AppError(400, "invalid password"))
    }

    const token = gentoken(user._id.toString())

    return res.cookie("token", token, option).status(200).json({ success: true, message: "Login Successfuly" })

})

export const logout = asyncHandler(async (req, res, next) => {
    return res.clearCookie("token", option).status(200).json({ success: true, message: "logout Successfuly" })
})
export const me = asyncHandler(async (req, res, next) => {
    console.log(req.user.id)
    const user = await User.findById(req.user.id)
    return res.status(200).json({ success: true, message: "logout Successfuly", user })
})
