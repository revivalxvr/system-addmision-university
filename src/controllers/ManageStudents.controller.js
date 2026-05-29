import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieOptions from "../utils/cookieOptions.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
// registerStudent,
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validasi Input
    if (!name || !email || !password) {
      // Sesuai helper: res, message, data (null), status (400)
      return errorResponse(
        res,
        " email, password,  harus diisi",
        null,
        400,
      );
    }
    const emailExist = await prisma.student.findFirst({
        where: {
            email: email
        }
    })
    if (emailExist) {
        return errorResponse(res, "email sudah terdaftar", null, 400);
    }
    // 2. Hash password sebelum di simpan dalam database
    const hashed = await bcrypt.hash(password, 10);

    // 3. Simpan ke database menggunakan Prisma
    const user = await prisma.student.create({
      data: {
        name,
        email,
        password: hashed,
      },
    });

    return successResponse(res, "berhasil mendaftar",
      {
        id: user.id,
        name:user.name,
        email: user.email,
        role: user.role,
      },
      201,
    );
  } catch (error) {
    return errorResponse(res, "gagal untuk mendaftar", error.message, 500);
  }
};

// loginStudent,
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input kosong
    if (!email || !password) {
      return errorResponse(res, "email dan password harus diisi", null, 400);
    }

    // 2. Cari user berdasarkan email
    const match = await prisma.student.findFirst({
      where: {
        email,
      },
    });

    // Jika user tidak ditemukan
    if (!match) {
      return errorResponse(res, "email atau password salah", null, 401);
    }

    // 3. Validasi password menggunakan bcrypt
    const isValid = await bcrypt.compare(password, match.password);
    if (!isValid) {
      return errorResponse(res, "email atau password salah", null, 401);
    }

    // 4. Buat token JWT 
    const token = jwt.sign(
      { id: match.id, role: match.role }, 
      JWT_SECRET, 
      { expiresIn: "1d" }
    );

    // 5. Set cookie token
    res.cookie("token", token, cookieOptions(req));

    // 6. Response Sukses
    return successResponse(res, "berhasil login", {
      id: match.id,
      name: match.name,
      email: match.email,
      role: match.role,
      token: token,
    });

  } catch (error) {
    return errorResponse(res, "gagal untuk login", error.message, 500);
  }
};
// logoutStudent
export const logoutStudent = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions(req));
    return successResponse(res, "berhasil logout");
  } catch (error) {
    return errorResponse(res, "gagal untuk logout", error.message, null, 500);
  }
};
// getSecheduleById,
// getAllCourses,
// createStudyPlan,
// getStudyPlanById,
// getPaymentById,
// getStudentStats,
// updatePaymentById
