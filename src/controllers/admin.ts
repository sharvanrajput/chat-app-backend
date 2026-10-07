import jwt from "jsonwebtoken";
import { Chat } from "../models/chat.js";
import { Message } from "../models/messages.js";
import { User, type ImgType } from "../models/user.js";
import { AppError } from "../utils/error.js";
import { asyncHandler, requiredEnv } from "../utils/helper.js";
import { option } from "./user.js";

export const adminLogin = asyncHandler(async (req, res, next) => {

    const { secretKey } = req.body
    console.log(secretKey)
    const envkey = requiredEnv("ADMIN_SECRET")

    const isMatched = secretKey === envkey

    if (!isMatched) {
        return next(new AppError(401, "Unauthorized"))
    }

    const secret = requiredEnv("JWT_SECRET")

    const token = jwt.sign(envkey, secret)

    return res.status(200).cookie("admin-token", token, { ...option, maxAge: 1000 * 60 * 15 }).json({
        success: true,
        message: "Welcome Boss"
    })

})

export const adminLogout = asyncHandler(async (req, res, next) => {

    return res.clearCookie("admin-token", option).status(200).json({ success: true, message: "logout Successfuly" })

})

export const allUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find()

    const transformUsers = await Promise.all(
        users.map(async ({ name, avatar, username, _id }) => {

            const [groupCount, chatCount] = await Promise.all([
                Chat.countDocuments({ groupChat: true, members: _id }),
                Chat.countDocuments({ groupChat: false, members: _id })
            ])

            return {
                _id, name, username, avatar: avatar.url, groupCount, chatCount
            }
        })
    )

    return res.status(200).json({ success: true, users: transformUsers })
})

export const allChats = asyncHandler(async (req, res, next) => {

    type PopulatedMembers = {
        _id: string;
        name: string;
        avatar: ImgType;
    };

    const chats = await Chat.find({})
        .populate<{ members: PopulatedMembers[] }>("members", "name avatar")
        .populate<{ creator: PopulatedMembers }>("creator", "name avatar")

    const transformChat = await Promise.all(chats.map(async ({ _id, name, groupChat, members, creator }) => {
        const totalMessages = await Message.countDocuments({ chatid: _id })

        return {
            _id,
            groupChat,
            name,
            avatar: members.slice(0, 3).map((member) => member.avatar.url),
            members: members.map(({ _id, name, avatar }) => ({
                _id, name, avatar: avatar.url
            })),
            creator: {
                name: creator?.name || "None",
                avatar: creator?.avatar.url || "None"
            },
            messages: totalMessages
        }
    }))

    return res.status(200).json({ success: true, chats: transformChat })

})


export const allMessages = asyncHandler(async (req, res, next) => {
    type PopulatedMembers = {
        _id: string;
        name: string;
        avatar: ImgType;
    };
    const messages = await Message.find()
        .populate<{ members: PopulatedMembers[] }>("sender", "name avatar")
        .populate("chatid", "groupChat")


    return res.status(200).json({ success: true, messages })
})

export const dashboradStask = asyncHandler(async (req, res, next) => {
    const [groupCount, userCount, msgCount, totleChatCount] = await Promise.all([
        Chat.countDocuments({ groupChat: true }),
        User.countDocuments(),
        Message.countDocuments(),
        Chat.countDocuments(),
    ])

    const today = new Date();

    const last7Date = new Date()
    last7Date.setDate(last7Date.getDate() - 7)

    const last7DaysMessages = await Message.find({
        createdAt: {
            $gte: last7Date,
            $lte: today
        }
    })

    const messages = new Array(7).fill(0)

    last7DaysMessages.forEach((msg) => {
        if (!msg.createdAt) {
            return next(new AppError(401, "msg time is required"))
        }
        const index = Math.floor((today.getTime() - msg.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        messages[6 - index]++
    })

    const data = {
        groupCount,
        userCount,
        msgCount,
        totleChatCount,
        singleChatCount: totleChatCount - groupCount,
        messages
    }

    return res.status(200).json({ success: true, stats: data })
})