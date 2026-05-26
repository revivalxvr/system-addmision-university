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
    const users = await prisma.userSiakad.findMany({
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
        const user = await prisma.userSiakad.findUnique({
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
        const users = await prisma.userSiakad.findMany({
            where: {
                roleId,
            }
        });
        return successResponse(res, "berhasil mendapatkan data by role", users, 200);
    } catch (error) {
         return errorResponse(res, "terjadi kesalahan", error.message, 500);
    }
}
//     createUser,
export const createUser = async (req, res) => {
    try {
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return errorResponse(res, "data harus diisi", null, 400);
        }
        const existEmail = await prisma.userSiakad.findUnique({
            where : {
                email
            }
        })
        if (existEmail) {
            return errorResponse(res, "email sudah terdaftar", null, 400);
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.userSiakad.create({
            data: {
                name,
                email,
                password: hashed,
                role,
            },
        });
        return successResponse(res, "berhasil membuat data user", {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        return errorResponse(res, "terjadi kesalahan", error.message, 500);
    }
}
//     updateUser,
export const updateUser = async (req, res) => {
    try {
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const { name, email, password, roleId } = req.body;
        if (!name || !email || !password || !roleId) {
            return errorResponse(res, "data harus diisi", null, 400);
        }
        const { id } = req.params;
        const existUser = await prisma.user.findUnique({
            where: {
                id,
            },
        });
        if (!existUser) {
            return errorResponse(res, "data tidak ditemukan di database", null, 404);
        }
        const dataToUpdate = {name, email, roleId};
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            dataToUpdate.password = hashed;
        }
        const user = await prisma.user.update({
            where: {
                id,
            },
            data: dataToUpdate,
        });
        return successResponse(res, "berhasil memperbarui data user", user);
    } catch (error) {
         return errorResponse(res, "terjadi kesalahan", error.message, 500);
    }
}
//     deleteUser,
export const deleteUser = async (req, res) => {
    try {
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const {id} = req.params
        const existId = await prisma.userSiakad.findUnique({
            where : {
                id,
            }
        })
        if(!existId) {
            return errorResponse(res, "data tidak ditemukan di database", null, 404);
        }
        const user = await prisma.user.delete({
            where: {
                id,
            },
        });
        return successResponse(res, "berhasil menghapus data user", user);
    } catch (error) {
         return errorResponse(res, "terjadi kesalahan", error.message, 500);
    }
}
