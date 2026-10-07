import { Router } from "express";
import { adminLogin, adminLogout, allChats, allMessages, allUsers, dashboradStask } from "../controllers/admin.js";
import { adminLoginValidator, validationHandler } from "../validator/validator.js";
import { adminOnly } from "../middleware/authMiddleware.js";

const adminRouter = Router()

adminRouter.post("/verify", adminLoginValidator(), validationHandler, adminLogin)
adminRouter.use(adminOnly)
adminRouter.post("/adminlogout", adminLogout)
adminRouter.get("/users", allUsers)
adminRouter.get("/chats", allChats)
adminRouter.get("/messages", allMessages)
adminRouter.get("/stats", dashboradStask)

export default adminRouter