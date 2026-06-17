import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

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

export const updateTimeLine = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const { name, date } = req.body;

    const existing = await prisma.timeLine.findUnique({
      where: {
        id,
      },
    })
    if(!existing) {
      return errorResponse(res, "data tidak ditemukan di database", null, 404);
    }
    const timeLine = await prisma.timeLine.update({
      where: {
        id,
      },
      data: {
        ...(name && { name }),
        ...(date && { date: new Date(date) })
      },
    });
    return successResponse(res, "berhasil mendapatkan data", timeLine);
  } catch (error) {
    return errorResponse(res, "gagal mendapatkan data", error.message, 500);
  }
};

export const deleteTimeLine = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const existing = await prisma.timeLine.findUnique({
      where: {
        id,
      },
    })
    if (!existing) {
      return errorResponse(res, "data tidak ditemukan di database", null, 404);
    }
    const timeLine = await prisma.timeLine.delete({
      where: {
        id,
      },
    });
    return successResponse(res, "berhasil mengahpus data", timeLine);
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
