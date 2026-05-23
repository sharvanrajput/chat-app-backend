import { User } from "../models/user.js"
import { generateToken } from "../utils/features.js"
import bcrypt from "bcrypt"

const options = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: "none",
    httpOnly: true,
    secure: true
}

export const newUser = async (req, res) => {
    try {
        const { name, username, password, bio } = req.body || {}

        if (!name || !username || !password) {
            return res.status(400).json({
                success: false,
                message: "name, username and password are required"
            })
        }

        const avatar = {
            public_id: "asdf",
            url: "asdfa"
        }
        const newuser = await User.create({ name, username, password, avatar, bio })

        const token = generateToken(newuser)
        res.cookie("token", token, options)
        res.status(201).json({ success: true, user: newuser })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "something went wrong" })
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body || {}

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "username and password are required"
            })
        }

        const existingUser = await User.findOne({ username }).select("+password")
        if (!existingUser) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)

        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Invalid credential" })
        }

        const token = generateToken(existingUser)
        res.cookie("token", token, options)
        res.status(200).json({ success: true, message: `Welcome Back ${existingUser?.name}` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "something went wrong in login" })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token")
        res.json({
            success: true,
            message: "Logout successful"
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "something went wrong" })
    }
}
