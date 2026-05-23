import jwt from "jsonwebtoken"

const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECREAT, { expiresIn: "15m" })
}

export { generateToken }
