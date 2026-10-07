import { Types } from "mongoose";
import { ALERT, NEW_ATTACHMENT, NEW_MESSAGE_ALERT, REFETCH_CHAT } from "../constants/events.js";
import { Chat } from "../models/chat.js";
import { Message, type MessageSchema } from "../models/messages.js";
import { User, type ImgType } from "../models/user.js";
import { AppError } from "../utils/error.js";
import { asyncHandler, delCloudnaryFile, eventEmiter, otherMembers, uploadOnCloudinary } from "../utils/helper.js";

export const newGroupChat = asyncHandler(async (req, res, next) => {
    const { name, members } = req.body;

    if (typeof name !== "string" || name.trim() === "") {
        return next(new AppError(400, "all fields are required"));
    }
    

    const allMembers = [...members, req.user.id];

    await Chat.create({
        name,
        groupChat: true,
        members: allMembers,
        creator: req.user.id,
    });

    eventEmiter(req, ALERT, allMembers, `welcome to the ${name} group`);
    eventEmiter(req, REFETCH_CHAT, allMembers);

    return res.status(201).json({ success: true, message: "group created" });
});

export const getMyChat = asyncHandler(async (req, res, next) => {
    type PopulatedUser = {
        _id: Types.ObjectId;
        avatar: ImgType;
        username: string;
    };

    const chats = await Chat.find({ creator: req.user.id }).populate<{
        members: PopulatedUser[];
    }>("members", "username avatar");

    const transformChat = chats.map(({ _id, name, creator, groupChat, members }) => {
        const otherMember = otherMembers(members, req.user.id.toString());
        return {
            _id, creator,
            groupChat,
            avatar: groupChat
                ? members.slice(0, 3).map(({ avatar }) => avatar.url)
                : otherMember,
            name: groupChat ? name : members.map(({ username }) => username),
            members: members.reduce<string[]>((acc, curr) => {
                if (curr._id.toString() !== req.user.id.toString()) {
                    acc.push(curr._id.toString());
                }
                return acc;
            }, []),
        };
    });
    return res
        .status(200)
        .json({ success: true, message: "my chats", chats: transformChat });
});

export const getMYGroup = asyncHandler(async (req, res, next) => {
    type PopulatedUser = {
        _id: string;
        avatar: ImgType;
        username: string;
    };
    const myGroups = await Chat.find({
        creator: req.user.id,
        groupChat: true,
    }).populate<{ members: PopulatedUser[] }>("members", "username avatar");

    const transformGroup = myGroups.map(({ _id, name, groupChat, members }) => {
        return {
            _id,
            groupChat,
            name,
            avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
        };
    });

    return res
        .status(200)
        .json({ success: true, message: "group created", chats: transformGroup });
});

export const addMemberInGroup = asyncHandler(async (req, res, next) => {
    type PopulatedUser = {
        _id: Types.ObjectId;
        avatar: ImgType;
        username: string;
    };
    type AddMemberBody = {
        chatid: string;
        members: string[];
    };
    const { chatid, members }: AddMemberBody = req.body;

    const chat = await Chat.findById({ _id: chatid });

    if (!chat) {
        return next(new AppError(400, "Chat not found"));
    }
    if (!chat.groupChat) {
        return next(new AppError(400, "This is not group chat"));
    }
    if (chat.creator.toString() !== req.user.id.toString()) {
        return next(new AppError(400, "This is not group chat"));
    }

    const allMembersPromise = members.map((i) => User.findById(i));

    const allMembers = await Promise.all(allMembersPromise)

    console.log(chat.members)


    const allUniqueMember = allMembers.filter((i) => i !== null)
        .filter((i) => {
            return !chat.members.includes(i._id)
        })
        .map((i) => i._id);



    if (allUniqueMember.some((member) => member === null)) {
        return next(new AppError(400, "One or more users were not found"));
    }

    const membersid = allUniqueMember.map((_id) => _id);
    chat.members.push(...membersid);

    await chat.save();

    const allusername = allMembers.filter((i) => i !== null).map((i) => i.name).join(", ");

    eventEmiter(
        req,
        ALERT,
        chat.members,
        `${allusername} has been added in the group `,
    );
    eventEmiter(req, REFETCH_CHAT, chat.members);

    return res
        .status(200)
        .json({ success: true, message: "members added", chat });
});

export const removeMember = asyncHandler(async (req, res, next) => {
    type BodyType = {
        chatid: Types.ObjectId;
        userid: string;
    };
    const { chatid, userid }: BodyType = req.body;

    const [chat, userThatWillRemoved] = await Promise.all([
        Chat.findById(chatid),
        User.findById(userid, "name"),
    ]);

    if (!chat) {
        return next(new AppError(400, "Chat not found"));
    }
    if (!chat.groupChat) {
        return next(new AppError(400, "This is not group chat"));
    }
    if (chat.creator !== req.user.id) {
        return next(new AppError(400, "This is not group chat"));
    }
    if (chat.members.length <= 3) {
        return next(new AppError(400, "Group must has atleast 3 members"));
    }

    chat.members = chat.members.filter((member) => member.toString() !== userid);

    await chat.save();

    eventEmiter(
        req,
        ALERT,
        chat.members,
        `${userThatWillRemoved} has been removed from the group`,
    );
    eventEmiter(req, REFETCH_CHAT, chat.members);

    return res
        .status(200)
        .json({ success: true, message: "members remoed successfully" });
});

export const leaveGroup = asyncHandler(async (req, res, next) => {
    console.log(req.params)
    const { id } = req.params;
    const chats = await Chat.findById(id);

    if (!chats) {
        return next(new AppError(400, "Chat not found"));
    }
    if (!chats.groupChat) {
        return next(new AppError(400, "This is not group chat"));
    }
    if (chats.members.length < 3) {
        return next(new AppError(400, "chat members count shoud be more then 3"));
    }

    const remainingMember = chats.members.filter(
        (chat) => chat._id.toString() !== req.user.id.toString(),
    );

    if (chats.creator.toString() === req.user.id.toString()) {
        const randomCreator = Math.floor(Math.random() * remainingMember.length);
        const newCreator = remainingMember[randomCreator];
        if (!newCreator) {
            return next(new AppError(400, "creater is required"));
        }
        chats.creator = newCreator._id;
    }

    chats.members = remainingMember;

    const [user] = await Promise.all([User.findById(req.user.id), chats.save()]);

    if (!user) {
        return next(new AppError(400, "user not found"));
    }

    eventEmiter(
        req,
        ALERT,
        chats.members,
        `${user.name as string} has leaved the group`,
    );

    return res
        .status(200)
        .json({ success: true, message: "Chat leave successfuly" });
});

export const sendFile = asyncHandler(async (req, res, next) => {
    const { chatid } = req.body
    console.log(chatid)
    const [chat, me] = await Promise.all([
        Chat.findById(chatid),
        User.findById(req.user.id)
    ])

    if (!chat) return next(new AppError(400, "chat is not found"))
    if (!me) return next(new AppError(400, "me not found"))

    console.log(req.files)
    const files = req.files as Express.Multer.File[] || []

    if (files.length < 1) return next(new AppError(400, "Please provid attachments "))


    const filepaths = files.map((file) => file.path)

    const attachments: ImgType[] = await uploadOnCloudinary(filepaths)



    const msgForDb: MessageSchema = {
        content: "",
        attachments: attachments,
        sender: me._id,
        chatid
    }

    const msgForRealTime = {
        ...msgForDb,
        sender: {
            _id: me._id,
            name: me.name
        },
    }

    const message = await Message.create(msgForDb)

    eventEmiter(req, NEW_ATTACHMENT, chat.members, {
        message: msgForRealTime,
        chatid
    })

    eventEmiter(req, NEW_MESSAGE_ALERT, chat.members, { chatid })

    return res.status(201).json({
        success: true,
        message
    })
})

export const getChatDetails = asyncHandler(async (req, res, next) => {
    type ChatMemberType = {
        _id: Types.ObjectId, name: string, avatar: { url: string }
    }
    if (req.query.populate === "true") {
        const chat = await Chat.findById(req.params.id).populate<{ "members": ChatMemberType[] }>("members", "name avatar").lean()
        if (!chat) {
            return next(new AppError(400, "chat not found"))
        }

        const members = chat.members.map(({ _id, name, avatar }) => ({
            _id, name, avatar: avatar.url
        }))

        return res.status(201).json({
            success: true,
            chat: {
                ...chat,
                members
            }
        })
    } else {
        const chat = await Chat.findById(req.params.id)
        if (!chat) {
            return next(new AppError(400, "chat not found"))
        }
        return res.status(201).json({
            success: true,
            chat
        })
    }
})

export const renameGroup = asyncHandler(async (req, res, next) => {

    const chatid = req.params.id
    const { name } = req.body

    const chat = await Chat.findById(chatid)

    if (!chat) return next(new AppError(400, " chat not round "))
    if (!chat.groupChat) return next(new AppError(400, " This is not group chat "))
    if (chat.creator.toString() !== req.user.id.toString()) return next(new AppError(400, "Only creator can change the Group name"))

    chat.name = name

    await chat.save()

    eventEmiter(req, REFETCH_CHAT, chat.members)

    return res.status(200).json({
        success: true,
        message: "Group renamed successfully"
    })

})

export const deleteChat = asyncHandler(async (req, res, next) => {

    const chatid = req.params.id

    if (!chatid) return next(new AppError(400, "Chat id is required"))

    const chat = await Chat.findById(chatid)

    if (!chat) return next(new AppError(400, " chat not round "))

    const members = chat.members

    if (chat.groupChat && chat.creator.toString() !== req.user.id.toString())
        return next(new AppError(400, "You are not allowed to delete this group"))

    if (chat.groupChat && !chat.members.includes(req.user.id))
        return next(new AppError(400, "You are not allowed to delete this group"))


    const msgWithAttachment = await Message.find({ chatid, attachments: { $exists: true, $ne: [] } })

    const public_ids: string[] = []

    msgWithAttachment.forEach(({ attachments }) =>
        attachments.forEach(({ public_id }) => public_ids.push(public_id))
    )

    await Promise.all([
        delCloudnaryFile(public_ids),
        chat.deleteOne(),
        Message.deleteMany({ chatid })
    ])

    eventEmiter(req, REFETCH_CHAT, members)

    return res.status(200).json({
        success: true,
        message: "chat delted successfully"
    })

})

export const getMessages = asyncHandler(async (req, res, next) => {

    if (!req.params.id) return next(new AppError(400, "Chat id is required"))

    const chatid = req.params.id

    const { page = 1 } = req.query

    const limit = 20;
    const skip = ((Number(page) - 1) * limit)

    const [messages, msgCount] = await Promise.all([
        await Message.find({ chatid })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("sender", "name avatar")
            .lean(),
        await Message.countDocuments({ chatid })
    ])

    const totalpage = Math.ceil(msgCount / limit) || 0

    return res.status(200).json({
        success: false,
        message: {
            totalpage,
            message: messages.reverse()
        }
    })

})








