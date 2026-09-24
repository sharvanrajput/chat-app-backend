import { AppError } from "../utils/error.js";
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/helper.js";
interface JwtPayoad { id: string, iat: number, exp: number }

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
