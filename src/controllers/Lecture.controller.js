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
    const lectures = await prisma.lecture.findMany({
        include : {
            major : {
                include : {
                    faculty : true
                }
            }
        }
    });
    return successResponse(res, "berhasil mendapatkan data", lectures);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", null, 500);
  }
};

export const getLectureById = async (req, res) => {
  try {
    //validate the role must be admin to access this route
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const existLecture = await prisma.lecture.findUnique({
      where: {
        id,
      },
    })
    if (!existLecture) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }
    const lecture = await prisma.lecture.findUnique({
      where: {
        id,
      },
      include : {
        major : {
            include : {
                faculty : true
            }
        }
    }
    });
    return successResponse(res, "berhasil mendapatkan data", lecture);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", null, 500);
  }
};
