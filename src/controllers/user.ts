
import bcrypt from "bcryptjs"
import { User, type ImgType } from "../models/user.js"
import { asyncHandler, eventEmiter, gentoken, uploadOnCloudinary } from "../utils/helper.js"
import { error } from "node:console"
import { AppError } from "../utils/error.js"
import { Chat } from "../models/chat.js"
import { Request } from "../models/request.js"
import { NEW_REQUEST } from "../constants/events.js"


const option = {
    httpOnly: true,
    secure: false,
    sameSite: "lax" as const,
    maxAge: 1000 * 60 * 60 * 24
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
    const profiledata = await uploadOnCloudinary([avatar.path])

    const profile = profiledata[0]

    if (!profile) {
        return next(new AppError(400, "profile data is required"))
    }

    const user = await User.create({
        name,
        username,
        password,
        bio,
        avatar: { public_id: profile.public_id, url: profile.url }
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
    return res.status(200).json({ success: true, user })
})

export const searchUser = asyncHandler(async (req, res, next) => {
    const { name } = req.query

    const myChats = await Chat.find({ groupChat: false, members: req.user.id })
    const allUserFromMyChats = myChats.map(chat => chat.members).flat()
    const allUserExceptMeAndFriends = await User.find({
        _id: { $nin: allUserFromMyChats },
        name: { $regex: name, $options: "i" }
    })
    const users = allUserExceptMeAndFriends.map(({ _id, name, avatar }) => (
        { _id, name, avatar: avatar.url }
    ))

    return res.status(200).json({ success: true, users })
})

export const sendRequest = asyncHandler(async (req, res, next) => {
    const { userid } = req.body

    const request = await Request.findOne({
        $or: [
            { sender: req.user.id, reciver: userid },
            { sender: userid, reciver: req.user.id }
        ]
    })

    if (request) return next(new AppError(400, "Request already send"))

    await Request.create({
        sender: req.user.id,
        reciver: userid
    })

    eventEmiter(req, NEW_REQUEST, [userid])

    return res.status(200).json({ success: true, msg: "Frequend request sent" })
})
export const acceptRequest = asyncHandler(async (req, res, next) => {
    const { requestid, accept } = req.body

    const request = await Request.findById({ requestid }).populate("sender", "name").populate("reciver", "name")

    if (!request) return next(new AppError(400, "Request not found"))

    if (request.reciver !== req.user.id) return next(new AppError(400, "You are not authorize to accept this request"))

    if (!accept) {
        await request.deleteOne()
        return res.status(200).json({ success: true, msg: "Friend Request Rejected" })
    }

    const members = [request.sender._id, request.reciver._id]

    await Promise.all([
        Chat.create({
            members,
            name: `${request.sender.name}-${request.reciver.name}`
        })
    ])

    return res.status(200).json({ success: true, msg: "Frequend request sent" })
})