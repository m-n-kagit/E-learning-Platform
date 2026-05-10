import express from "express";
import * as reviewController from "../controller/review.controller.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
	"/review/:courseId",
	protect.protect,
	protect.restrictTo("user"),
	reviewController.createReview
);
router.get(
	"/reviews/:courseId",
	protect.protect,
	protect.restrictTo("user", "course_admin", "admin"),
	reviewController.getCourseReviews
);

export default router;

