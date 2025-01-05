import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import fs from 'fs';

// extend the Request interface to include user property
declare module "express-serve-static-core" {
    interface Request {
        user?: string | JwtPayload;
    }
}

// middleware to verify jwt
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    const privateKey = fs.readFileSync('private.key')

    if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            error: 401,
            message: "Unauthorized"
        })
        return;
    }

    jwt.verify(token, privateKey, (err: any, decoded: any) => {
        if (err) {
            res.status(StatusCodes.FORBIDDEN).json({
                error: 403,
                message: "Token Invalid."
            })
            return;
        }

        req.user = decoded;
        next()
    })
}

export default verifyToken;