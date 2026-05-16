import { Router } from "express";
import { login, newUser } from "../controllers/user.controller.js";
import { uploadImage } from "../middlewares/uploadPhoto.js";

const userRotues = Router()

userRotues.post("/new", uploadImage("avatars").single('avatar'), newUser)
userRotues.post("/login", login)


export default userRotues