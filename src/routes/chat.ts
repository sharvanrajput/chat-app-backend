import { Router } from "express";
import { logout, me, signin, signup } from "../controllers/user.js";
import { uploadFile } from "../middleware/multer.js";
import { isAuth } from "../middleware/authMiddleware.js";
import { addMemberInGroup, getMyChat, getMYGroup, newGroupChat, removeMember } from "../controllers/chat.js";

const chatRouter = Router()

chatRouter.use(isAuth)

chatRouter.post("/new", newGroupChat)
chatRouter.get("/my", getMyChat)
chatRouter.get("/my/group", getMYGroup)
chatRouter.put("/addmember", addMemberInGroup)
chatRouter.put("/removemember", removeMember)



// send attachment
// get messages
// get chat details , rename , delete

export default chatRouter