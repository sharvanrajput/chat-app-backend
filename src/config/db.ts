import mongoose from "mongoose"

export const connectDb = async () => {
    const mongoUrl = process.env.MONGO_URL

    if (!mongoUrl) {
        throw new Error("MONGO_URL is not configured")
    }

    await mongoose.connect(mongoUrl)
    console.log("db connected")
}  
