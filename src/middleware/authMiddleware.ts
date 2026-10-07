import { AppError } from "../utils/error.js";
import jwt from "jsonwebtoken"
import { asyncHandler, requiredEnv } from "../utils/helper.js";
import type { Types } from "mongoose";
interface JwtPayoad { id: Types.ObjectId, iat: number, exp: number }

export const isAuth = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[0]
    if (!token) {
        return next(new AppError(401, "Unauthorize request"))
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayoad

    if (!decode) {
        return next(new AppError(401, "Unauthorize request"))
    }

    req.user = {
        id: decode?.id
    }
    return next()

})

export const adminOnly = asyncHandler(async (req, res, next) => {

    const token = req.cookies['admin-token'] || req.headers.authorization?.split(" ")[0]

    if (!token) {
        return next(new AppError(401, "Unauthorize request"))
    }

    const secret = requiredEnv("JWT_SECRET")
    const adminsec = requiredEnv("ADMIN_SECRET")

    const decode = jwt.verify(token, secret)

    const isMatched = decode === adminsec

    if (!isMatched) {
        return next(new AppError(401, "Unauthorize request"))
    }

    return next()

})