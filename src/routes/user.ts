import { Router } from "express";
import { signin, signup } from "../controllers/user.js";
import { uploadFile } from "../middleware/multer.js";

const userRouter = Router()

userRouter.post("/signup", uploadFile("avatars").single("avatar"), signup)
userRouter.post("/signin", signin)

export default userRouter