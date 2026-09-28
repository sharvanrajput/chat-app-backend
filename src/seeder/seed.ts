import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";

dotenv.config();
faker.seed(20260928);

const USER_COUNT = 50;
const DIRECT_CHAT_COUNT = 50;
const GROUP_CHAT_COUNT = 20;
const PASSWORD = "123456";

const seedDatabase = async () => {
    await connectDb();

    try {
        const usernames = Array.from(
            { length: USER_COUNT },
            (_, index) => `seed_user_${String(index + 1).padStart(2, "0")}`,
        );
        const existingUsers = await User.find({ username: { $in: usernames } });
        const usersByUsername = new Map(
            existingUsers.map((user) => [user.username, user]),
        );

        const missingUsers = usernames
            .filter((username) => !usersByUsername.has(username))
            .map((username) => ({
                name: faker.person.fullName(),
                username,
                password: PASSWORD,
                bio: faker.lorem.sentence(),
                avatar: {
                    public_id: faker.string.uuid(),
                    url: faker.image.avatar(),
                },
            }));

        const createdUsers = await User.create(missingUsers);
        for (const user of createdUsers) {
            usersByUsername.set(user.username, user);
        }

        const users = usernames.map((username) => {
            const user = usersByUsername.get(username);
            if (!user) {
                throw new Error(`Could not load seeded user ${username}`);
            }
            return user;
        });

        const userAt = (index: number) => {
            const user = users[index];
            if (!user) {
                throw new Error(`No seeded user at index ${index}`);
            }
            return user;
        };

        const chatSeeds = [
            ...Array.from({ length: DIRECT_CHAT_COUNT }, (_, index) => {
                const members = [userAt(index), userAt((index + 1) % USER_COUNT)];
                return {
                    name: `Seed Direct Chat ${String(index + 1).padStart(2, "0")}`,
                    groupChat: false,
                    creator: userAt(index)!._id,
                    members: members.map((user) => user._id),
                };
            }),
            ...Array.from({ length: GROUP_CHAT_COUNT }, (_, index) => {
                const creator = userAt((index * 5) % USER_COUNT)!;
                const members = Array.from({ length: 5 }, (_, memberIndex) =>
                    userAt((index * 5 + memberIndex) % USER_COUNT),
                );
                return {
                    name: `Seed Group ${String(index + 1).padStart(2, "0")}`,
                    groupChat: true,
                    creator: creator._id,
                    members: members.map((user) => user._id),
                };
            }),
        ];

        const chatNames = chatSeeds.map(({ name }) => name);
        const existingChats = await Chat.find({ name: { $in: chatNames } });
        const existingChatNames = new Set(existingChats.map(({ name }) => name));
        const missingChats = chatSeeds.filter(
            ({ name }) => !existingChatNames.has(name),
        );

        await Chat.insertMany(missingChats);

        console.log(
            `Seed complete: ${createdUsers.length} users created, ` +
            `${missingChats.length} chats created (${DIRECT_CHAT_COUNT} direct + ${GROUP_CHAT_COUNT} groups requested).`,
        );
        console.log(`Seed account password: ${PASSWORD}`);
    } finally {
        await mongoose.disconnect();
    }
};

seedDatabase().catch((error: unknown) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
});