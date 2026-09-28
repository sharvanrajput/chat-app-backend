import { Router } from "express";
import {
    addMemberInGroup,
    deleteChat,
    getChatDetails,
    getMyChat, getMYGroup,
    leaveGroup,
    newGroupChat, removeMember,
    renameGroup,
    sendFile,
    getMessages
} from "../controllers/chat.js";
import { isAuth } from "../middleware/authMiddleware.js";
import { uploadFile } from "../middleware/multer.js";

const chatRouter = Router()

chatRouter.use(isAuth)

chatRouter.post("/new", newGroupChat)
chatRouter.get("/my", getMyChat)
chatRouter.get("/my/group", getMYGroup)
chatRouter.put("/addmember", addMemberInGroup)
chatRouter.put("/removemember", removeMember)
chatRouter.delete("/leave/:id", leaveGroup)

// send attachment
chatRouter.post("/message", uploadFile("attachment").array("attachments", 5), sendFile)

// get messages
chatRouter.post("/message/:id", getMessages)

// get chat details , rename , delete

chatRouter.route("/:id").get(getChatDetails).put(renameGroup).delete(deleteChat)

export default chatRouter