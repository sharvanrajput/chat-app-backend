import { ALERT, REFETCH_CHAT } from "../constants/events.js";
import { Chat, type ChatSchema } from "../models/chat.js";
import { User, type ImgType, type UserType } from "../models/user.js";
import { Types } from "mongoose";
import { AppError } from "../utils/error.js";
import { asyncHandler, eventEmiter, otherMembers } from "../utils/helper.js";
import type { types } from "node:ffi";

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

    type PopulatedUser = {
        _id: string;
        avatar: ImgType;
        username: string;
    }

    const chats = await Chat.find({ creator: req.user.id }).populate<{ members: PopulatedUser[] }>("members", "username avatar")

    const transformChat = chats.map(({ _id, name, groupChat, members }) => {
        const otherMember = otherMembers(members, req.user.id)
        return {
            _id,
            groupChat,
            avatar: groupChat ? members.slice(0, 3).map(({ avatar }) => avatar.url) : otherMember,
            name: groupChat ? name : members.map(({ username }) => username),
            members: members.reduce<string[]>((acc, curr) => {
                if (curr._id.toString() !== req.user.id.toString()) {
                    acc.push(curr._id.toString())
                }
                return acc
            }, [])
        }
    })
    return res.status(200).json({ success: true, message: "group created", chats: transformChat })

})

export const getMYGroup = asyncHandler(async (req, res, next) => {
    type PopulatedUser = {
        _id: string;
        avatar: ImgType;
        username: string;
    }
    const myGroups = await Chat.find({
        creator: req.user.id,
        groupChat: true,
    }).populate<{ members: PopulatedUser[] }>("members", "username avatar")


    const transformGroup = myGroups.map(({ _id, name, groupChat, members }) => {

        return {
            _id, groupChat, name,
            avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
        }
    })

    return res.status(200).json({ success: true, message: "group created", chats: transformGroup })

})

export const addMemberInGroup = asyncHandler(async (req, res, next) => {
    type PopulatedUser = {
        _id: Types.ObjectId;
        avatar: ImgType;
        username: string;
    }
    type AddMemberBody = {
        chatid: string;
        members: string[];
    };
    const { chatid, members }: AddMemberBody = req.body

    const chat = await Chat.findById({ _id: chatid })

    if (!chat) {
        return next(new AppError(400, "Chat not found"))
    }
    if (!chat.groupChat) {
        return next(new AppError(400, "This is not group chat"))
    }
    if (chat.creator.toString() !== req.user.id) {
        return next(new AppError(400, "This is not group chat"))
    }

    const allMembersPromise = members.map((i) => User.findById(i))

    const allMembers = await Promise.all(allMembersPromise)

    const allUniqueMember = allMembers.filter((i) => !chat.members.includes(i?.toString())).map(i => i._id)


    if (allUniqueMember.some((member) => member === null)) {
        return next(new AppError(400, "One or more users were not found"))
    }

    const membersid = allUniqueMember.map(({ _id }) => _id)
    chat.members.push(...membersid)

    await chat.save()

    const allusername = allMembers.map(i => i.name).join(", ")
    eventEmiter(req, ALERT, chat.members, `${allusername} has been added in the group `)
    eventEmiter(req, REFETCH_CHAT, chat.members)

    return res.status(200).json({ success: true, message: "members added", chat })
})

export const removeMember = asyncHandler(async (req, res, next) => {
    type BodyType = {
        chatid: Types.ObjectId,
        userid: string
    }
    const { chatid, userid }: BodyType = req.body

    const [chat, userThatWillRemoved] = await Promise.all([
        Chat.findById(chatid),
        User.findById(userid, "name"),
    ])

    if (!chat) {
        return next(new AppError(400, "Chat not found"))
    }
    if (!chat.groupChat) {
        return next(new AppError(400, "This is not group chat"))
    }
    if (chat.creator.toString() !== req.user.id) {
        return next(new AppError(400, "This is not group chat"))
    }
    if (chat.members.length <= 3) {
        return next(new AppError(400, "Group must has atleast 3 members"))
    }

    chat.members = chat.members.filter(
        (member) => member.toString() !== userid
    )

    await chat.save()

    eventEmiter(req, ALERT, chat.members, `${userThatWillRemoved} has been removed from the group`)
    eventEmiter(req, REFETCH_CHAT, chat.members)

    return res.status(200).json({ success: true, message: "members remoed successfully" })
})