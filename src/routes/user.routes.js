import { Router } from "express";
import { login, logout, newUser } from "../controllers/user.controller.js";
import { singleAvatar } from "../middlewares/uploadPhoto.js";

const userRotues = Router()

userRotues.post("/new", singleAvatar, newUser)
userRotues.post("/login", login)
userRotues.post("/logout", logout)


export default userRotues