import { User } from "../models/user.js"


export const newUser = async (req, res) => {
    try {
        const avatar = {
            public_id: "123",
            url: "asda"
        }
        await User.create({
            name: "sharvan",
            username: "sharvan098",
            password: "asdf",
            avatar
        })

        res.status(201).json({ success: true, message: ` Welcome  ${name} ` })

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
