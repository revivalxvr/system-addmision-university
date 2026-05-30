import prisma from "../config/Prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieOptions from "../utils/cookieOptions.js";
import { successResponse, errorResponse } from "../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
//   createLecture, //register
export const createLecture = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "email dan password harus diisi", null, 400);
    }
    //cek email dosen terdaftar di database
    const lecture = await prisma.lecture.findFirst({
      where: {
        email : email
      },
    });
    if (!lecture) {
      return errorResponse(res, "email tidak terdaftar", null, 400);
    }
    if (lecture.password) {
      return errorResponse(res, "password sudah di set", null, 400);
    }
    //hash password
    const hashed = await bcrypt.hash(password, 10);
    const update = await prisma.lecture.update({
      where: {
        id: lecture.id,
      },
      data: {
        password: hashed,
      },
    });
    return successResponse(
      res,
      "berhasil mendaftar",
      {
        id: update.id,
        name: update.name,
        email: update.email,
        role: update.role,
        passwordSet: true,
      },
      201,
    );
  } catch (error) {
    console.log("=== ERROR ASLI ===", error);
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     loginLecture, //login
export const loginLecture = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, "email dan password harus diisi", null, 400);
    }
    const match = await prisma.lecture.findFirst({
      where: {
        email,
      },
    });
    if (!match) {
      return errorResponse(res, "email atau password salah", null, 401);
    }
    const isValid = await bcrypt.compare(password, match.password);
    if (!isValid) {
      return errorResponse(res, "email atau password salah", null, 401);
    }
    const token = jwt.sign({ id: match.id, role: match.role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, cookieOptions);
    return successResponse(
      res,
      "berhasil login",
      {
        id: match.id,
        name: match.name,
        email: match.email,
        role: match.role,
        token : token
      },
      200,
    );
    if (match.passwordSet) {
      return errorResponse(res, "password sudah di set", null, 400);
    }
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};

//     logoutLecture, //logout
export const logoutLecture = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions(req));
    return successResponse(res, "berhasil logout");
  } catch (error) {
    return errorResponse(res, "gagal untuk logout", error.message, null, 500);
  }
}
//     getLectureStats, //dashboard

//     getCoursesByLectureId,
//     getStudentByClassId,
//     updatesStudyPlanCourse,

//     getScheduleByLectureId, //jadwal

//     //study plan
//     getStudyPlanCourseByLectureId,
//     updateStudyPlanById,
//     updateStudyPlanScoreById,
