import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";
import bcrypt from "bcrypt";

//     getAllUsers,
export const getAllUsers = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const users = await prisma.user.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });
    return successResponse(res, "berhasil mendapatkan data", users);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     getUserById,
export const getUserById = async (req, res) => {
    try {
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                role: true
            },
        });
        if (!user) {
            return errorResponse(res, "data tidak ditemukan di data base", null, 404);
        }
        return successResponse(res, "berhasil mendapatkan data", user);
    } catch (error) {
        return errorResponse(res, "terjadi kesalahan", error.message, 500);
    }
}
//getUserByRole
export const getUserByRole = async (req, res) => {
    try {
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const { roleId } = req.params;
        const users = await prisma.user.findMany({
            where: {
                roleId,
            },
            include: {
                role: true
            },
        });
        return successResponse(res, "berhasil mendapatkan data by role", users, 200);
    } catch (error) {
         return errorResponse(res, "terjadi kesalahan", error.message, 500);
    }
}
//     createUser,
//     updateUser,
//     deleteUser,
