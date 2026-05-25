import req from "express/lib/request.js";
import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";  
    
    // getAllTfGroups,
    // getTfGroupById,
    // createTfGroup,
    // updateTfGroup,
    // deleteTfGroup,

export const getAllTfGroups = async (req, res) => {
    try {
         const tokenCredential = req.user;
         if (tokenCredential.role !== "admin") {
         return res.status(401).json({
        success: false,
        message: "Unauthorized",
         });
    }
      const tfGroups = await prisma.tfGroup.findMany();
      return successResponse(res, "berhasil mendapatkan data", tfGroups);
    } catch (error) {
      return errorResponse(res, "gagal mendapatkan data", null, 500);
    }
  };