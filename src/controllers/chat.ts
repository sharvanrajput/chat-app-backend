import { ALERT, REFETCH_CHAT } from "../constants/events.js";
import { Chat } from "../models/chat.js";
import type { ImgType } from "../models/user.js";
import { AppError } from "../utils/error.js";
import { asyncHandler, eventEmiter } from "../utils/helper.js";

export const newGroupChat = asyncHandler(async (req, res, next) => {

    const { name, members } = req.body

    if (typeof name !== "string" || name.trim() === "") {
        return next(new AppError(400, "all fields are required"))
    }
    if (members.length < 2) {
        return next(new AppError(400, "group Chat must have least 2 more member  "))
    }

    const allMembers = [...members, req.user.id]

    await Chat.create({
        name,
        groupChat: true,
        members: allMembers,
        creator: req.user.id
    })

    eventEmiter(req, ALERT, allMembers, `welcome to the ${name} group`)
    eventEmiter(req, REFETCH_CHAT, allMembers)

    return res.status(201).json({ success: true, message: "group created" })

})
export const getMyChat = asyncHandler(async (req, res, next) => {

    const chats = await Chat.find({ creator: req.user.id }).populate("members", "username avatar")

    // const transformChat = chats.map(({ _id, groupChat, members, name }) => {
    //     return {
    //         _id,
    //         avatar: groupChat ? members.slice(0, 3).map(({ avatar }: { avatar: { public_id: string, url: string } }) => avatar.url) : "",
    //         name,
    //         groupChat,
    //         members
    //     }
    // })
    return res.status(201).json({ success: true, message: "group created", chats })

})