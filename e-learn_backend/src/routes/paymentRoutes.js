import express from "express";
import * as paymentController from "../controller/paymentController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect.protect,
  protect.restrictTo("user"),
  paymentController.createPayment
);

router.get(
  "/history",
  protect.protect,
  protect.restrictTo("user"),
  paymentController.getPaymentHistory
);

router.get(
  "/:paymentId/invoice",
  protect.protect,
  protect.restrictTo("user"),
  paymentController.downloadInvoice
);

export default router;