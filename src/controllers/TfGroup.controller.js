import req from "express/lib/request.js";
import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// getAllTfGroups,
// getTfGroupById,
// createTfGroup,
// updateTfGroup,
// deleteTfGroup,

export const getAllTfGroups = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const tfGroups = await prisma.tfGroup.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return successResponse(res, "berhasil mendapatkan data", tfGroups);
  } catch (error) {
    return errorResponse(res, "gagal mendapatkan data", null, 500);
  }
};

export const getTfGroupById = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const tfGroup = await prisma.tfGroup.findUnique({
      where: {
        id,
      },
    });
    if (!tfGroup) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }
    return successResponse(res, "berhasil mendapatkan data", tfGroup);
  } catch (error) {
    return errorResponse(res, "gagal mendapatkan data", null, 500);
  }
};

export const createTfGroup = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { group, amount } = req.body;
    if (!group || !amount) {
      return errorResponse(res, "data harus diisi", null, 401);
    }
    const tfGroup = await prisma.tfGroup.create({
      data: {
        group,
        amount,
      },
    });
    return successResponse(res, "berhasil membuat data", tfGroup);
  } catch (error) {
    return errorResponse(res, "gagal membuat data", null, 500);
  }
};

export const updateTfGroup = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    const existing = await prisma.tfGroup.findUnique({
      where: {
        id,
      },
    });
    if (!existing) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }
    const { group, amount } = req.body;
    if (!group || !amount) {
      return errorResponse(res, "data harus diisi", null, 401);
    }
    const tfGroup = await prisma.tfGroup.update({
      where: {
        id,
      },
      data: {
        group,
        amount,
      },
    });
    return successResponse(res, "berhasil update data", tfGroup);
  } catch (error) {
      console.log("== data error sebenanrya ==",error);
    return errorResponse(res, "gagal update data", null, 500);
  }
};

export const deleteTfGroup = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const existing = await prisma.tfGroup.findUnique({
      where: {
        id,
      },
    });
    if (!existing) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }
    const tfGroup = await prisma.tfGroup.delete({
      where: {
        id,
      },
    });
    return successResponse(res, "berhasil delete data", tfGroup);
  } catch (error) {
    return errorResponse(res, "gagal delete data", null, 500);
  }
};
