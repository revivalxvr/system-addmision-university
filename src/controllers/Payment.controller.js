import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

//     getAllPayments,
export const getAllPayments = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const payments = await prisma.payment.findMany({
      include: {
        student: {
          include: {
            tfGroup: true,
            class: {
              include: {
                year: true,
              },
            },
            studyPlan: {
              include: {
                courses: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    return successResponse(res, "berhasil mendapatkan data", payments);
  } catch (error) {
    return errorResponse(res, "gagal mendapatkan data", error.message, 500);
  }
};
//     getPaymentById,
export const getPaymentById = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: {
        id,
      },
      include: {
        student: {
          include: {
            tfGroup: true,
            class: {
              include: {
                year: true,
              },
            },
            studyPlan: {
              include: {
                courses: true,
              },
            },
          },
        },
      },
    });
    if (!payment) {
      return errorResponse(res, "data tidak ditemukan di data base", null, 404);
    }
    return successResponse(res, "berhasil mendapatkan data", payment);
  } catch (error) {
    return errorResponse(res, "gagal mendapatkan data", error.message, 500);
  }
};
//     createPayment,
export const createPayment = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { studentId, code, status } = req.body;
    if (!studentId || !code || !status) {
      return errorResponse(res, "data harus diisi", null, 401);
    }
    const payment = await prisma.payment.create({
      data: {
        studentId,
        code,
        status,
      },
    });
    return successResponse(res, "berhasil mendapatkan data", payment);
  } catch (error) {
    return errorResponse(res, "gagal mendapatkan data", error.message, 500);
  }
};
//     updatePayment,
export const updatePayment = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const existing = await prisma.payment.findUnique({
      where: {
        id,
      },
    });
    if (!existing) {
      return errorResponse(res, "data tidak ditemukan di database", null, 404);
    }
    const { studentId, code, status } = req.body;
    if (!studentId || !code || !status) {
      return errorResponse(res, "data harus diisi", null, 401);
    }
    const payment = await prisma.payment.update({
      where: {
        id,
      },
      data: {
        studentId,
        code,
        status,
      },
    });
    return successResponse(res, "berhasil mendapatkan data", payment);
  } catch (error) {
    return errorResponse(res, "gagal mendapatkan data", error.message, 500);
  }
};
//     deletePayment,
export const deletePayment = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const existId = await prisma.payment.findUnique({
      where: {
        id,
      },
    });
    if(!existId) {
      return errorResponse(res, "data tidak ditemukan di database", null, 404);
    }
    const payment = await prisma.payment.delete({
      where: {
        id,
      },
    });
    return successResponse(res, "berhasil menghapus data", payment);
  } catch (error) {
    return errorResponse(res, "Gagal terjadi kesalahan", error.message, 500);
  }
};
