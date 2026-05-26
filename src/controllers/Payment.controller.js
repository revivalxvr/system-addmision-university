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
                    class : {
                        include : {
                            year : true
                        }
                    },
                    studyPlan :{
                        include : {
                            courses : true
                        }
                    }
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
        
    } catch (error) {
         return errorResponse(res, "gagal mendapatkan data", error.message, 500);
    }
}
//     createPayment,
//     updatePayment,
//     deletePayment,
