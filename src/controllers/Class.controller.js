import req from "express/lib/request.js";
import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";


// getClasses, getClassesRoom, createClassesRoom, updateClassesRoom, deleteClassesRoom

export const getClasses = async (res, req) => {
    try {
         //validate the role must be admin to access this route
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                 success: false,
                 message: "Unauthorized" });
        }

        const classes = await prisma.class.findMany(
            {
                include: {
                    major: true,
                    year: true
                }
            }
        );
        return successResponse (res, "berhasil mendapatkan data class", classes)
    } catch (error) {
        console.error(error);
        return errorResponse (res, "gagal mendapatkan data class",{error: error.message}, 500)
    }
}
