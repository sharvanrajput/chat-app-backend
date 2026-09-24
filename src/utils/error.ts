import type { NextFunction, Request, Response } from "express";


export class AppError extends Error {
    statusCode: number;

    constructor(code: number, message: string) {
        super(message)
        this.statusCode = code
    }
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    err.message ||= "something went wrong"
    err.statusCode ||= 500
    
    res.status(err.statusCode).json({
        success: false,
        message: err.message 
    });
}