import { Router } from "express";
import { login, newUser } from "../controllers/user.controller.js";

const userRotues = Router()

userRotues.post("/new", newUser)
userRotues.post("/login", login)


export default userRotues