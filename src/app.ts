import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { connectDb } from "./config/db.js";
import userRouter from "./routes/user.js";
import { errorHandler } from "./utils/error.js";
import chatRouter from "./routes/chat.js";
dotenv.config()

const app = express()
const port = 4000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/api/user", userRouter)
app.use("/api/chat", chatRouter)


app.use(errorHandler);

connectDb().then(() => {
    app.listen(port, () => {
        console.log(`server is running on port ${port}`)
    })
}).catch((error: unknown) => {
    const message = error instanceof globalThis.Error ? error.message : String(error)
    console.error(`startup failed: ${message}`)
    process.exitCode = 1
})



