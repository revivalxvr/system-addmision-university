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

export const createTimeLine = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { name, date } = req.body;
    if(!name || !date) {
      return errorResponse(res, "data timeline harus diisi", null, 401);
    }
    const timeLine = await prisma.timeLine.create({
      data: {
        name,
        date: new Date(date), //harus tipe data DateTime
      },
    });
    return successResponse(res, "berhasil membuat timeline", timeLine);
  } catch (error) {
    return errorResponse(res, "gagal mendapatkan data", error.message, 500);
  }
};
