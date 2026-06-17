import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

//     getAllCourses,

export const getAllCourses = async (req, res) => {
  try {
    //validate the role must be admin to access this route
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const courses = await prisma.course.findMany({
      include: {
        lecture: {
          include: {
            major: {
              include: {
                faculty: true,
              },
            },
          },
        },
      },
    });
    return successResponse(res, "berhasil mendapatkan data", courses);
  } catch (error) {
    console.log("=== ERROR ASLI ===", error);
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     getCourseById,
export const getCourseById = async (req, res) => {
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
    const existCourse = await prisma.course.findUnique({
      where: {
        id,
      },
    });
    if (!existCourse) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }
    const course = await prisma.course.findUnique({
      where: {
        id,
      },
      include: {
        lecture: {
          include: {
            major: {
              include: {
                faculty: true,
              },
            },
          },
        },
      },
    });
    return successResponse(res, "berhasil mendapatkan data", course);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     createCourse,
export const createCourse = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { name, code, lectureId, credits } = req.body;
    if (!name || !code || !lectureId || !credits) {
      return errorResponse(res, "data harus diisi", null, 400);
    }

    const course = await prisma.course.create({
      data: {
        name,
        code,
        lectureId,
        credits: Number(credits),
      },
    });
    return successResponse(res, "berhasil membuat data", course, 201);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};

//updateCourse
export const updateCourse = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const existCourse = await prisma.course.findUnique({
      where: {
        id,
      },
    });
    if (!existCourse) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }
    const { name, code, lectureId, credits } = req.body;
    if (!name || !code || !lectureId || !credits) {
      return errorResponse(res, "data harus diisi", null, 400);
    }
    const course = await prisma.course.update({
      where: {
        id,
      },
      data: {
        name,
        code,
        lectureId,
        credits: Number(credits),
      },
    });

    return successResponse(res, "berhasil mengubah data", course);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     deleteCourse

export const deleteCourse = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const course = await prisma.course.delete({
      where: {
        id,
      },
    });
    if (!course) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }
    return successResponse(res, "berhasil menghapus data", course);
  } catch (error) {
    // Jika error berasal dari Prisma Foreign Key
    if (error.code === "P2003") {
      return res.status(400).json({
        code: "P2003",
        message: "Foreign key constraint failed on the database.",
      });
    }
    res.status(500).json({ message: error.message });
  }
};
