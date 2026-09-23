
import bcrypt from "bcryptjs"
import { User, type ImgType } from "../models/user.js"
import { asyncHandler, gentoken, uploadOnCloudinary } from "../utils/helper.js"


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
        return res.status(400).json({ success: false, message: "all fields are required" })
    }
    if (!avatar) {
        return res.status(400).json({ success: false, message: "avatar is  required" })
    }

    const existing = await User.findOne({ username })

    if (existing) {
        return res.status(400).json({ success: false, message: "user already exist" })
    }
    const profiledata = await uploadOnCloudinary(avatar.path)
    const { _id } = await User.create({
        name,
        username,
        password,
        bio,
        avatar: { public_id: profiledata.public_id, url: profiledata.url }
    })

    const token = gentoken(_id.toString())

    console.log({ name, username, password, avatar, bio })

    return res.cookie("token", token, option).status(201).json({ success: true, message: "Register Successfuly" })

})

export const signin = asyncHandler(async (req, res, next) => {

    const { username, password } = req.body

    if ([username, password].some(field => typeof field !== "string" || field.trim() === "")) {
        return res.status(400).json({ success: false, message: "all fields are required" })
    }

    const user = await User.findOne({ username }).select("+password")

    if (!user) {
        return res.status(400).json({ success: false, message: "user not exist" })
    }

    const isCorrect = await bcrypt.compare(password, user.password)

    if (!isCorrect) {
        return res.status(400).json({ success: false, message: "invalid password" })
    }

    const token = gentoken(user._id.toString())

    return res.cookie("token", token, option).status(201).json({ success: true, message: "Login Successfuly" })

})
