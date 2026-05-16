import { User } from "../models/user.js"

export const newUser = async (req, res) => {
    try {
        const { name, username, password, bio } = req.body
        const avatar = {
            public_id: "asdf",
            url: "asdfa"
        }
        await User.create({ name, username, password, avatar })
        res.send({ name, username, password, avatar })
    } catch (error) {
        res.status(500).json({ success: false, message: "something went wrong" })
    }
}

export const login = async (req, res) => {
    try {
        res.send("hello world")
    } catch (error) {
        res.status(500).json({ success: false, message: "something went wrong" })
    }
}
