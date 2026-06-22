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
        const { role } = req.params;
        const users = await prisma.userSiakad.findMany({
            where: {
                role
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
            return errorResponse(res, "data yang di kirimkan ada yang kosong, data harus diisi", null, 400);
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

        const { id } = req.params;
        const { name, email, password, role } = req.body;

        // 1. Cek apakah ada minimal satu data yang dikirim untuk diupdate
        // Jika body kosong total, kembalikan error
        if (Object.keys(req.body).length === 0) {
            return errorResponse(res, "Tidak ada data yang dikirim untuk diperbarui", null, 400);
        }

        // 2. Pastikan user-nya ada di database sebelum diupdate
        const existUser = await prisma.userSiakad.findUnique({
            where: { id },
        });

        if (!existUser) {
            return errorResponse(res, "Data tidak ditemukan di database", null, 404);
        }

        // 3. STRATEGI DINAMIS: Buat objek kosong terlebih dahulu
        const dataToUpdate = {};

        // 4. Masukkan ke objek HANYA JIKA data tersebut dikirim dan tidak kosong
        if (name && name.trim() !== "") dataToUpdate.name = name;
        if (email && email.trim() !== "") dataToUpdate.email = email;
        if (role && role.trim() !== "") dataToUpdate.role = role;

        // Khusus password, lakukan enkripsi terlebih dahulu jika dikirim
        if (password && password.trim() !== "") {
            const hashed = await bcrypt.hash(password, 10);
            dataToUpdate.password = hashed;
        }

        // 5. Eksekusi ke Prisma
        const user = await prisma.userSiakad.update({
            where: { id },
            data: dataToUpdate, // Hanya kolom yang terisi di atas yang akan diupdate
        });

        return successResponse(res, "Berhasil memperbarui data user secara dinamis", user);
    } catch (error) {
         return errorResponse(res, "Terjadi kesalahan", error.message, 500);
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
        const user = await prisma.userSiakad.delete({
            where: {
                id,
            },
        });
        return successResponse(res, "berhasil menghapus data user", user);
    } catch (error) {
         return errorResponse(res, "terjadi kesalahan", error.message, 500);
    }
}
