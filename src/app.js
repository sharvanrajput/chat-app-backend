import express from "express"
import dotenv from "dotenv"
import userRotues from "./routes/user.routes.js"
import { connectdb } from "./config/db.js"
import cookieParser from "cookie-parser"
import { errorMiddleware } from "./middlewares/error.js"
dotenv.config()
const app = express()
const port = process.env.PORT || 3000

// =====  MIDDLEWARE ======
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use("/avatar", express.static("public/avatars"));


// =====  ROUTER ======
app.use("/api/user", userRotues)

app.use(errorMiddleware())
connectdb().then(() => {
    app.listen(port, () => {
        console.log(`app is runing on http://localhost:${port}`)
    })
})