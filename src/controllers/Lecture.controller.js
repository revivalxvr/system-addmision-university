import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

//   getAllLectures,
//     getLectureById,
//     createLecture,
//     updateLecture,
//     deleteLecture,

export const getAllLectures = async (req, res) => {
  try {
    //validate the role must be admin to access this route
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const lectures = await prisma.lecture.findMany();
    return successResponse(res, "berhasil mendapatkan data", lectures);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", null, 500);
  }
};
