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
    return successResponse(res, "berhasil mendapatkan data dosen", lecture);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", null, 500);
  }
};

export const createLecture = async (req, res) => {
  try {
    //validate the role must be admin to access this route
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { name, email, lectureNumber, position, majorId } = req.body;
    if (!name || !email || !lectureNumber || !position || !majorId) {
      return errorResponse(res, "data harus diisi", null, 400);
    }
    const lecture = await prisma.lecture.create({
      data: {
        name,
        email,
        lectureNumber: Number(lectureNumber),
        position,
        majorId,
      },
    });
    return successResponse(res, "berhasil membuat data dosen", lecture);
  } catch (error) {
    console.log("=== ERROR ASLI ===", error);
    return errorResponse(res, "terjadi kesalahan", null, 500);
  }
};

export const updateLecture = async (req, res) => {
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
    const { name, email, lectureNumber, position, majorId } = req.body;
    if (!name || !email || !lectureNumber || !position || !majorId) {
      return errorResponse(res, "data harus diisi", null, 400);
    }
    const existLecture = await prisma.lecture.findUnique({
      where: {
        id,
      },
    })
    if (!existLecture) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }
   
    const lecture = await prisma.lecture.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        lectureNumber: Number(lectureNumber),
        position,
        majorId,
      },
    });
    return successResponse(res, "berhasil memperbarui data", lecture);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", null, 500);
  }
};

export const deleteLecture = async (req, res) => {
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
    const lecture = await prisma.lecture.delete({    
      where: {
        id,
      },
    });
    return successResponse(res, "berhasil menghapus data", lecture);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", null, 500);
  }
};
