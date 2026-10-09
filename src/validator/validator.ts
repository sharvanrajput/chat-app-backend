import { body, check, param, validationResult } from "express-validator";
import { asyncHandler } from "../utils/helper.js";
import { error } from "node:console";
import { AppError } from "../utils/error.js";
import { isBooleanObject } from "node:util/types";

export const validationHandler = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const errorMessages = errors.array().map((error) => error.msg).join(", ")
    if (!errors.isEmpty()) {
        return next(new AppError(400, errorMessages))
    }
    next();
});

export const RegisterValidator = () => [
    body("name", "Please enter the name").notEmpty(),
    body("username", "Please enter the username").notEmpty(),
    body("password", "Please enter the password").notEmpty(),
    body("bio", "Please enter the bio").notEmpty(),
]
export const LoginValidator = () => [
    body("username", "Please enter the username").notEmpty(),
    body("password", "Please enter the password").notEmpty(),
]
export const newGroupValidator = () => [
    body("name", "Please enter name").notEmpty(),
    body("members")
        .notEmpty().withMessage("Please provide members")
        .isArray({ min: 2, max: 100 }).withMessage("members must be 3-100"),
]
export const addMemberValidator = () => [
    body("chatid", "Please enter chat id").notEmpty(),
    body("members")
        .notEmpty().withMessage("Please provide members")
        .isArray({ min: 1, max: 97 }).withMessage("members must be 3-100"),
]
export const chatIdValidator = () => [
    body("chatid", "Please enter chat id").notEmpty(),
    body("userid", "Please enter user id").notEmpty(),
]
export const leaveGroupValidator = () => [
    param("id", "Please provide chat id").notEmpty(),
]
export const sendAttachmentValidator = () => [
    body("chatid", "Please enter chat id").notEmpty(),
    check("attachment")
        .notEmpty().withMessage("Please provide attachments")
        .isArray({ min: 1, max: 5 }).withMessage("members must be 1-5"),
]

export const sendRequestValidator = () => [
    body("userid", "Please provide user id").notEmpty(),
]
export const acceptRequestValidator = () => [
    body("requestid", "Please provide request id").notEmpty(),
    body("accept")
        .notEmpty()
        .withMessage("Please provide accept")
        .isBoolean()
        .withMessage("Accept must be boolean")
]
export const adminLoginValidator = () => [
    body("secretKey", "Please provide secret key id").notEmpty(),
]