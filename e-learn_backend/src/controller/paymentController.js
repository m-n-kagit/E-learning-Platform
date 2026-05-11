import Payment from "../models/Payment.models.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import uploadCloudinary from "../utils/cloudinery.js";
import Enrollment from "../models/Enrollment.models.js";
import Course from "../models/Course.models.js";
import Instructor from "../models/Instructor.models.js";
import { ensureCourseEnrollment } from "./courseEnrollController.js";
import logger from "../config/logger.js";

const ensureInvoiceDir = (invoiceDir) => {
  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, { recursive: true });
  }
};

const generateInvoicePdf = (invoicePath, payment) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48 });
    const stream = fs.createWriteStream(invoicePath);

    doc.pipe(stream);

    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Payment ID: ${payment._id}`);
    doc.text(`Course ID: ${payment.course?._id || payment.course}`);
    doc.text(`Payment Amount: ${payment.amount}`);

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.on("error", reject);
  });

const ensureInvoiceUploaded = async (paymentId, payment) => {
  if (payment.invoiceUrl) {
    return payment.invoiceUrl;
  }

  const invoiceDir = path.join(process.cwd(), "invoices");
  const invoicePath = path.join(invoiceDir, `invoice_${paymentId}.pdf`);
  ensureInvoiceDir(invoiceDir);

  await generateInvoicePdf(invoicePath, payment);

  const uploadResult = await uploadCloudinary(invoicePath, {
    resource_type: "raw",
    folder: "invoices",
    public_id: `invoice_${paymentId}`,
  });

  if (!uploadResult?.secure_url) {
    const error = new Error("Failed to upload invoice");
    error.statusCode = 500;
    throw error;
  }

  payment.invoiceUrl = uploadResult.secure_url;
  if ("invoicePublicId" in payment) {
    payment.invoicePublicId = uploadResult.public_id || "";
  }
  await payment.save();

  return payment.invoiceUrl;
};

const createPayment= async (req, res, next) => {
  try {
    const { courseId, amount, paymentMethod, instructorId } = req.body;
    const studentId = req.user._id;
    const existingEnrollment = await Enrollment.findOne({
      user: studentId,
      course: courseId,
    });

    if (existingEnrollment) {
      res.status(400);
      throw new Error("You are already enrolled in this course");
    }

    const course = await Course.findById(courseId).select("instructor price");
    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }

     const transactionId =
      "TXN" +
      Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const payment = new Payment({
      user: studentId,
      course: courseId,
      amount,
      paymentMethod,
      paymentStatus: "completed",
      transactionId,
    });
    await payment.save();
    await ensureCourseEnrollment(studentId, courseId);

    const resolvedInstructorId = String(instructorId || course.instructor || "").trim();
    if (resolvedInstructorId) {
      const instructor = await Instructor.findOne({ user: resolvedInstructorId });
      if (instructor) {
        instructor.revenue = Number(instructor.revenue || 0) + Number(amount || 0);
        await instructor.save();
      } else {
        await Instructor.create({ user: resolvedInstructorId, revenue: Number(amount || 0) });
      }
    }

    logger.info("payment_created", {
      paymentId: payment._id,
      userId: studentId,
      courseId,
      amount,
      paymentMethod,
      status: payment.paymentStatus,
      ip: req.ip,
    });
    res.status(201).json({
      success: true,
      data: payment,
    });
  }
    catch (error) {
    next(error);
  }
};

const getPaymentHistory = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const payments = await Payment.find({ user: studentId }).populate("course", "title price");

    logger.info("payment_history_viewed", {
      userId: studentId,
      count: payments.length,
      ip: req.ip,
    });
    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

const downloadInvoice = async (req, res, next) => {
  try {
    const paymentId = req.params.paymentId;
    const payment = await Payment.findById(paymentId).populate("course", "title price");
    if (!payment) {
      res.status(404);
      throw new Error("Payment not found");
    }

    if (String(payment.user) !== String(req.user._id)) {
      res.status(403);
      throw new Error("You are not allowed to access this invoice");
    }

    const invoiceUrl = await ensureInvoiceUploaded(paymentId, payment);
    return res.status(200).json({
      success: true,
      data: {
        invoiceUrl,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

export { createPayment, getPaymentHistory, downloadInvoice };
