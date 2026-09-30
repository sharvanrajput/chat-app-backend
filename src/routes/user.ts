import { Router } from "express";
import { logout, me, signin, signup, searchUser, sendRequest, acceptRequest } from "../controllers/user.js";
import { uploadFile } from "../middleware/multer.js";
import { isAuth } from "../middleware/authMiddleware.js";
import {
    acceptRequestValidator,
    LoginValidator,
    RegisterValidator,
    sendRequestValidator, validationHandler
} from "../validator/validator.js";

const userRouter = Router()

userRouter.post("/signup",
    uploadFile("avatars").single("avatar"),
    RegisterValidator(),
    validationHandler,
    signup)

userRouter.post("/signin", LoginValidator(), validationHandler, signin)

userRouter.use(isAuth)

userRouter.post("/logout", logout)
userRouter.get("/me", me)
userRouter.get("/search", searchUser)
userRouter.put("/sendrequest", sendRequestValidator(), validationHandler, sendRequest)
userRouter.put("/acceptequest", acceptRequestValidator(), validationHandler, acceptRequest)

export default userRouter