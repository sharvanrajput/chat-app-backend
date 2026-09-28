import { Router } from "express";
import { logout, me, signin, signup } from "../controllers/user.js";
import { uploadFile } from "../middleware/multer.js";
import { isAuth } from "../middleware/authMiddleware.js";

const userRouter = Router()

userRouter.post("/signup", uploadFile("avatars").single("avatar"), signup)
userRouter.post("/signin", signin)

userRouter.use(isAuth)

userRouter.post("/logout", logout)
userRouter.get("/me", me)

export default userRouter