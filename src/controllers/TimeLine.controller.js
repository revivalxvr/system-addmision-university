import prisma from "../config/Prisma";
import { successResponse, errorResponse } from "../utils/response";

//   getAllTimeLines,
//     createTimeLine,
//     updateTimeLine,
//     deleteTimeLine,

export const getAllTimeLines = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const timeLines = await prisma.timeLine.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return successResponse(res, "berhasil mendapatkan data", timeLines);
  } catch (error) {
    return errorResponse(res, "gagal mendapatkan data", error.message, 500);
  }
};
