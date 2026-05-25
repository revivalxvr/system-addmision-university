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
      const tfGroups = await prisma.tfGroup.findMany({
        orderBy: {
          createdAt: "desc",
        }
      });
      return successResponse(res, "berhasil mendapatkan data", tfGroups);
    } catch (error) {
      return errorResponse(res, "gagal mendapatkan data", null, 500);
    }
  };

  export const getTfGroupById = async (req, res) => {
    try {
      const tokenCredential = req.user;
      if (tokenCredential.role !== "admin") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      const { id } = req.params;
      const tfGroup = await prisma.tfGroup.findUnique({
        where: {
          id,
        },
      });
      if (!tfGroup) {
        return errorResponse(res, "data tidak ditemukan", null, 404);
      }
      return successResponse(res, "berhasil mendapatkan data", tfGroup);
    } catch (error) {
      return errorResponse(res, "gagal mendapatkan data", null, 500);
    }
  };