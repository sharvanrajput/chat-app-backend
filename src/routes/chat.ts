import { Router } from "express";
import { logout, me, signin, signup } from "../controllers/user.js";
import { uploadFile } from "../middleware/multer.js";
import { isAuth } from "../middleware/authMiddleware.js";
import { getMyChat, newGroupChat } from "../controllers/chat.js";

const chatRouter = Router()

chatRouter.use(isAuth)

chatRouter.post("/new", newGroupChat )
chatRouter.post("/mychats", getMyChat )

export default chatRouter