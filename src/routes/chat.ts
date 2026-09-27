import { Router } from "express";
import { logout, me, signin, signup } from "../controllers/user.js";
import { uploadFile } from "../middleware/multer.js";
import { isAuth } from "../middleware/authMiddleware.js";
import { addMemberInGroup, getMyChat, getMYGroup, newGroupChat, removeMember , leaveGroup , sendFile} from "../controllers/chat.js";

const chatRouter = Router()

chatRouter.use(isAuth)

chatRouter.post("/new", newGroupChat)
chatRouter.get("/my", getMyChat)
chatRouter.get("/my/group", getMYGroup)
chatRouter.put("/addmember", addMemberInGroup)
chatRouter.put("/removemember", removeMember)
chatRouter.put("/leave/:id",leaveGroup)

// send attachment

chatRouter.put("/message",uploadFile("attachment").array("files", 5 ) , sendFile )

// get messages
// get chat details , rename , delete

export default chatRouter