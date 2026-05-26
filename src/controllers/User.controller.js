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
//     createUser,
//     updateUser,
//     deleteUser,
