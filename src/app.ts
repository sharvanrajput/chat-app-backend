import express, { type NextFunction, type Request, type Response } from "express";
import userRouter from "./routes/user.js";
import dotenv from "dotenv"
import { connectDb } from "./config/db.js";
import type { Error } from "mongoose";
dotenv.config()

const app = express()
const port = 4000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/user", userRouter)


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({
        success: false,
        message: err.message || "Something went wrong"
    });
});

connectDb().then(() => {
    app.listen(port, () => {
        console.log(`server is running on port ${port}`)
    })
}).catch((error: unknown) => {
    const message = error instanceof globalThis.Error ? error.message : String(error)
    console.error(`startup failed: ${message}`)
    process.exitCode = 1
})



