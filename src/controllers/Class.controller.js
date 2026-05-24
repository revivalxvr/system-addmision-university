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

export const getClassesRoom = async (res, req) => {
    try {
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                 success: false,
                 message: "Unauthorized" });
        }
        const {id} = req.params
        const classRoom = await prisma.class.findUnique({
            where: {
                id
            },
            include: {
                major: true,
                year: true
            }
        });
        if(!classRoom) {
            return errorResponse (res, "class room tidak ditemukan", null, 404)
        }
        return successResponse (res, "berhasil mendapatkan data class room", classRoom)

    } catch (error) {
         console.error(error);
        return errorResponse (res, "gagal mendapatkan data class room",{error: error.message}, 500)
    }
}

export const createClassesRoom = async (res, req) => {
    try {
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                 success: false,
                 message: "Unauthorized" });
        }

        const {name, majorId, yearId} = req.body;
        if (!name || !majorId || !yearId) {
            return errorResponse (res, "data class room harus diisi", null, 401)
        }
        const classRoom = await prisma.class.create({
            data : {
                name,
                majorId,
                yearId
            }
        });
        return successResponse (res, "berhasil membuat class room", classRoom)
    } catch (error) {
        console.error(error);
        return errorResponse (res, "gagal membuat class room",{error: error.message}, 500)
    }
}

export const updateClassesRoom = async (res, req) => {
    try {
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                 success: false,
                 message: "Unauthorized" });
        }

        const {id} = req.params;
        const existing = await prisma.class.findUnique({
            where: {
                id
            }
        });
        if(!existing) {
            return errorResponse (res, "class room tidak ditemukan", null, 404)
        }
        const {name, majorId, yearId} = req.body;
        if (!name || !majorId || !yearId) {
            return errorResponse (res, "data class room harus diisi", null, 401)
        }
        const classRoom = await prisma.class.update({
            where: {
                id
            },
            data: {
                name,
                majorId,
                yearId
            }
        });
        return successResponse (res, "berhasil update class room", classRoom)
    } catch (error) {
        console.error(error);
        return errorResponse (res, "gagal update class room",{error: error.message}, 500)
    }
}

export const deleteClassesRoom = async (res, req) => {
    try {
          const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                 success: false,
                 message: "Unauthorized" });
        }

        const {id} = req.params;
        const existing = await prisma.class.findUnique({
            where: {
                id
            }
        });
        if(!existing) {
            return errorResponse (res, "class room tidak ditemukan", null, 404)
        }
        const classRoom = await prisma.class.delete({
            where: {
                id
            }
        });
        return successResponse (res, "berhasil delete class room", classRoom)
    } catch (error) {
        console.error(error);
        return errorResponse (res, "gagal update class room",{error: error.message}, 500)
    }
}
