import prisma from '../config/Prisma.js';
import { successResponse, errorResponse } from "../utils/response.js";


    // getFaculties,
    // getFaculty,
    // createFaculty,
    // updateFaculty,
    // deleteFaculty

export const getFaculties = async (req, res) => {
    try {
        //validate the role must be admin to access this route
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                 success: false,
                 message: "Unauthorized" });
        }

        const faculties = await prisma.faculty.findMany();
        return successResponse(res, "berhasil mendapatkan data fakultas", faculties);
        
    } catch (error) {
        return errorResponse(res, "gagal mendapatkan data fakultas", error.message, 500);
    }
};

export const getFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const faculty = await prisma.faculty.findUnique({
            where: {
                id
            },
        });

        if(!faculty) {
            return errorResponse(res, "fakultas tidak ditemukan", null, 404);
        }
        return successResponse(res, "berhasil mendapatkan data fakultas", faculty);
    } catch (error) {
        return errorResponse(res, "gagal mendapatkan data fakultas", error.message, 500);
    }
};

export const createFaculty = async (req, res) => {
    try {
        //validate the role must be admin to access this route
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                 success: false,
                 message: "Unauthorized" });
        }
        const { name, code } = req.body;
        if(!name || !code) {
            return errorResponse(res, "nama dan kode fakultas harus diisi", null, 400);            
        }
        const faculty = await prisma.faculty.create({
            data: {
                name,
                code
            },
        })
        return successResponse(res, "berhasil membuat fakultas", faculty, 201);
    } catch (error) {
        return errorResponse(res, "gagal membuat fakultas", error.message, 500);
    }
};

export const updateFaculty = async (req, res) => {
    try {
        //validate the role must be admin to access this route
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                 success: false,
                 message: "Unauthorized" });
        }
        const { id } = req.params;
        const { name, code } = req.body;
        if(!name || !code) {
            return errorResponse(res, "nama dan kode fakultas harus diisi", null, 400);            
        }

        const existing = await prisma.faculty.findUnique({
            where: {
                id
            },
        });
        if(!existing) {
            return errorResponse(res, "Fakultas tidak ditemukan", null, 404);
        }

       
        const faculty = await prisma.faculty.update({
            where: {
                id
            },
            data: {
                name,
                code
            },
        })
        return successResponse(res, "Berhasil Update fakultas", faculty);
    } catch (error) {
        return errorResponse(res, "Gagal Update fakultas", error.message, 500);
    }
};

export const deleteFaculty = async (req, res) => {
    try {
        //validate the role must be admin to access this route
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                 success: false,
                 message: "Unauthorized" });
        }
        const { id } = req.params;
        const faculty = await prisma.faculty.delete({
            where: {
                id
            },
        })
        return successResponse(res, "berhasil menghapus fakultas", faculty);
    } catch (error) {
        return errorResponse(res, "gagal menghapus fakultas", error.message, 500);
    }    
};