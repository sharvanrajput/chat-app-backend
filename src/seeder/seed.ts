import { faker } from "@faker-js/faker"
import dotenv from "dotenv"
import mongoose from "mongoose"
import { connectDb } from "../config/db.js"
import { Chat } from "../models/chat.js"
import { Message } from "../models/messages.js"
import { User } from "../models/user.js"

const seedCount = 50

dotenv.config()

const createFakeData = async () => {
    const users = await User.create(Array.from({ length: seedCount }, () => ({
        name: faker.person.fullName(),
        username: `${faker.internet.username().toLowerCase()}_${faker.string.alphanumeric(8).toLowerCase()}`,
        password: faker.internet.password(),
        bio: faker.lorem.sentence(),
        avatar: {
            public_id: faker.string.uuid(),
            url: `https://i.pravatar.cc/150?img=${faker.number.int({ min: 1, max: 70 })}`,
        },
    })))

    const singleChats = await Chat.create(Array.from({ length: seedCount }, () => {
        const participants = faker.helpers.shuffle(users).slice(0, 2)
        const creator = participants[0]!
        const otherMember = participants[1]!

        return {
            name: `${creator.name} & ${otherMember.name}`,
            groupChat: false,
            creator: creator._id,
            members: participants.map((user) => user._id),
        }
    }))

    const groupChats = await Chat.create(Array.from({ length: seedCount }, () => {
        const participants = faker.helpers.shuffle(users).slice(0, faker.number.int({ min: 3, max: 8 }))
        const creator = participants[0]!

        return {
            name: faker.company.name(),
            groupChat: true,
            creator: creator._id,
            members: participants.map((user) => user._id),
        }
    }))

    const chats = [...singleChats, ...groupChats]
    await Message.create(Array.from({ length: seedCount }, () => {
        const chat = faker.helpers.arrayElement(chats)

        return {
            content: faker.lorem.sentence(),
            attachments: [],
            sender: faker.helpers.arrayElement(chat.members),
            chatid: chat._id,
        }
    }))

    console.log(`Created ${users.length} users, ${singleChats.length} single chats, ${groupChats.length} group chats, and ${seedCount} messages.`)
}

try {
    await connectDb()
    await createFakeData()
} catch (error) {
    console.error("Failed to seed fake chat data:", error)
    process.exitCode = 1
} finally {
    await mongoose.disconnect()
}
