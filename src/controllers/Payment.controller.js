import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { snap, core } from "../config/midtrans.js";

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
            // studyPlan: {
            //   include: {
            //     courses: true,
            //   },
            // },
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
    return successResponse(res, "berhasil membuat payment", payment);
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
    const { status } = req.body;
    if (!status) {
      return errorResponse(res, "data harus diisi", null, 401);
    }
    const payment = await prisma.payment.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
    return successResponse(res, "berhasil mengupdate data", payment);
  } catch (error) {
    return errorResponse(res, "gagal mengupdate data", error.message, 500);
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
    if (!existId) {
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

export const createToken = async (req, res) => {
  try {
    const { id, name, email, studentNumber, major, amount } = req.body;
    const midtransOrderId = `${id}_${Date.now()}`;
    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Number(amount),
      },

      customer_details: {
        first_name: name,
        email: email,
      },
      custom_field1: studentNumber,
      custom_field2: major,
    };
    const token = await snap.createTransaction(parameter);
    return res.json({
      success: true,
      // AMBIL PROPERTI .token NYA SAJA
      token: token.token
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const notification = async (req, res) => {
  try {
    const statusResponse = await core.transaction.notification(req.body);
    const { order_id, transaction_status, fraud_status } = statusResponse;

    const id = order_id.split("_")[0]; //id + waktu, kita potong '_' agar id nya hanya id saja tanpa 'waktu' sebelum cari di databse
    const payment = await prisma.payment.findUnique({
      where: {
        id: id,
      },
    });
    if (!payment) {
      return errorResponse(res, "data tidak ditemukan di database", null, 404);
    }

    let paymentStatus = payment.status;
    switch (transaction_status) {
      case "capture":
        if (fraud_status === "accept") {
          paymentStatus = "PAID";
        }
        break;
      case "settlement":
        paymentStatus = "PAID";
        break;
      case "pending":
        paymentStatus = "PENDING";
        break;
      case "deny":
      case "expire":
      case "cancel":
        paymentStatus = "CANCELLED";
        break;
    }
    await prisma.payment.update({
      where: {
        id: id,
      },
      data: {
        status: paymentStatus,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Notification berhasil diproses",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
