import { Router } from "express";
import { logout, me, signin, signup } from "../controllers/user.js";
import { uploadFile } from "../middleware/multer.js";
import { isAuth } from "../middleware/authMiddleware.js";

const userRouter = Router()

userRouter.post("/signup", uploadFile("avatars").single("avatar"), signup)
userRouter.post("/signin", signin)
userRouter.post("/logout", logout)

userRouter.use(isAuth)

userRouter.post("/me", me)

export default userRouter