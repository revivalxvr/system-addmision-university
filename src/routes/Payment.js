import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
} from "../controllers/Payment.controller.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.post("/", createPayment);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;