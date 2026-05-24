import req from "express/lib/request.js";
import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";
   
   
   // getAllYears,
    // getYearById,
    // createYear,
    // updateYear,
    // deleteYear,

export const getAllYears = async (req, res) => {
    try {
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                 success: false,
                 message: "Unauthorized" });
        }
        const years = await prisma.academyYear.findMany();
        return successResponse(res, "berhasil mendapatkan data tahun akademik", years);
    } catch (error) {
        return errorResponse(res, "gagal mendapatkan data tahun akademik", null, 500);
    }
}

export const getYearById = async (req, res) => {
    try {
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                 success: false,
                 message: "Unauthorized" });
        }
        const {id} = req.params;
        const year = await prisma.academyYear.findUnique({
            where :{
                id
            }
        })
        if(!year || year.length ===0) {
            return errorResponse(res, "tahun akademik tidak ditemukan", null, 404);
        }
        return successResponse(res, "berhasil mendapatkan data tahun akademik", year);
        
    } catch (error) {
         return errorResponse(res, "gagal mendapatkan data tahun akademik", null, 500);
    }
}
