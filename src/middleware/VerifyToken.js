import jwt from "jsonwebtoken"
import { successResponse, errorResponse } from "../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret"

export const verifyToken = (req,res,next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) return errorResponse(res,"Token required")

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
        next();
    } catch (error) {
        return errorResponse(res,"Token invalid")
    }
}