import prisma from '../config/Prisma.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieOptions from "../utils/cookieOptions.js";
import { successResponse, errorResponse } from "../utils/response.js";
import req from "express/lib/request.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

//ini merupakan kode bagian register, login, logout

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validasi Input
    if (!name || !email || !password || !role) {
      // Sesuai helper: res, message, data (null), status (400)
      return errorResponse(res, "nama, email, password, dan role harus diisi", null, 400);
    }

    // 2. Hash password sebelum di simpan dalam database
    const hashed = await bcrypt.hash(password, 10);
    
    // 3. Simpan ke database menggunakan Prisma
    const user = await prisma.userSiakad.create({
      data: {
        name,
        email,
        password: hashed,
        role,
      },
    });

    // 4. Response Sukses
    // Sesuai helper: res, message, data (objek user), status (201 untuk Created)
    return successResponse(res, "berhasil mendaftar", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, 201);

  } catch (error) {
    // 5. Response Error jika database / server bermasalah
    // Sesuai helper: res, message, data (error.message), status (500)
    return errorResponse(
      res,
      "gagal untuk mendaftar",
      error.message,
      500
    );
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input kosong
    if (!email || !password) {
      return errorResponse(res, "email dan password harus diisi", null, 400);
    }

    // 2. Cari user berdasarkan email
    const match = await prisma.userSiakad.findUnique({
      where: {
        email,
      },
    });

    // Jika user tidak ditemukan
    if (!match) {
      return errorResponse(res, "email tidak terdaftar di database", null, 401);
    }

    // 3. Validasi password menggunakan bcrypt
    const isValid = await bcrypt.compare(password, match.password);
    if (!isValid) {
      return errorResponse(res, "email atau password salah", null, 401);
    }

  
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
    // 7. Response Error (DIUBAH: Menyesuaikan urutan parameter helpermu)
    return errorResponse(
      res, 
      "gagal untuk login", 
      error.message, 
      500
    );
  }
};


export const logout = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions(req));
    return successResponse(res, "berhasil logout");
  } catch (error) {
    return errorResponse(res, "gagal untuk logout", error.message, null, 500);
  }
};
