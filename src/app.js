import express from "express"
import dotenv from "dotenv"
import userRotues from "./routes/user.routes.js"
import { connectdb } from "./config/db.js"
dotenv.config()
const app = express()
const port = process.env.PORT || 3000

// =====  MIDDLEWARE ======
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// =====  ROUTER ======
app.use("/user", userRotues)


connectdb().then(() => {
    app.listen(port, () => {
        console.log(`app is runing on http://localhost:${port}`)
    })
})