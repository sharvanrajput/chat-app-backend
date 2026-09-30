import { Router } from "express";
import {
    addMemberInGroup,
    deleteChat,
    getChatDetails,
    getMessages,
    getMyChat, getMYGroup,
    leaveGroup,
    newGroupChat, removeMember,
    renameGroup,
    sendFile
} from "../controllers/chat.js";
import { isAuth } from "../middleware/authMiddleware.js";
import { uploadFile } from "../middleware/multer.js";
import { addMemberValidator, chatIdValidator, leaveGroupValidator, newGroupValidator, sendAttachmentValidator, validationHandler } from "../validator/validator.js";

const chatRouter = Router()

chatRouter.use(isAuth)

chatRouter.post("/new", newGroupValidator(), validationHandler, newGroupChat)
chatRouter.get("/my", getMyChat)
chatRouter.get("/my/group", getMYGroup)
chatRouter.put("/addmember", addMemberValidator(), validationHandler, addMemberInGroup)
chatRouter.put("/removemember", chatIdValidator(), validationHandler, removeMember)
chatRouter.delete("/leave/:id", chatIdValidator(), validationHandler, leaveGroup)

// send attachment
chatRouter.post("/message", uploadFile("attachment").array("attachments", 5), sendAttachmentValidator(), validationHandler, sendFile)

// get messages
chatRouter.get("/message/:id", chatIdValidator(), validationHandler, getMessages)  

// get chat details , rename , delete

chatRouter.route("/:id").get(getChatDetails).put(renameGroup).delete(deleteChat)

export default chatRouter