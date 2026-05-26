import prisma from "../config/Prisma";
import { successResponse, errorResponse } from "../utils/response.js";

//    getAllTuitionFees,
export const getAllTuitionFees = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const tuitionFees = await prisma.tuitionFee.findMany({
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return successResponse(
      res,
      "berhasil mendapatkan data biaya kuliah",
      tuitionFees,
    );
  } catch (error) {
    return errorResponse(res, "gagal mendapatkan data biaya kuliah", null, 500);
  }
};
//     getTuitionFeesById,
export const getTuitionFeesById = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const tuitionFees = await prisma.tuitionFee.findUnique({
      where: {
        id,
      },
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
    });
    if (!tuitionFees) {
      return errorResponse(res, "data tidak ditemukan di data base", null, 404);
    }
    return successResponse(res, "berhasil mendapatkan data", tuitionFees);
  } catch (error) {
    return errorResponse(res, "gagal mendapatkan data", null, 500);
  }
};
//     createTuitionFees,
export const createTuitionFees = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { studentId, status } = req.params;
    const tuitionFees = await prisma.tuitionFee.create({
      data: {
        studentId,
        status,
      },
    });
    return successResponse(res, "berhasil mebuat data tuition fees", tuitionFees);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     updateTuitionFees,
//     deleteTuitionFees,
