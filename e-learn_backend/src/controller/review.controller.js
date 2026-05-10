import Review from "../models/Review.models.js";
import Course from "../models/Course.models.js";
import Student from "../models/Student.models.js";
import logger from "../config/logger.js";

export const createReview = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404);
            throw new Error("Course not found");
        }
        const student = await Student.findOne({ user: userId });
        if (!student) {
            res.status(404);
            throw new Error("Student not found");
        }
        const existingReview = await Review.findOne({ user: userId, course: courseId });
        if (existingReview) {
            res.status(400);
            throw new Error("You have already reviewed this course");
        }
        const parsedRating = Number.parseInt(rating, 10);
        if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            res.status(400);
            throw new Error("Rating must be an integer between 1 and 5");
        }

        const review = await Review.create({
            user: userId,
            course: courseId,
            rating: parsedRating,
            comment: String(comment || "").trim(),
        });
        // course.ratings.push(rating);
        await course.save();
        const populatedReview = await Review.findById(review._id)
            .populate("user", "name")
            .populate("course", "title");

        res.status(201).json({
            success: true,
            data: populatedReview || review,
        });
    } catch (error) {
        logger.error("review_creation_failed", {
            courseId: req.params.courseId,
            userId: req.user._id, 
            ip: req.ip,
            error: error.message
         });
        next(error);
    }};

export const getCourseReviews = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const reviews = await Review.find({ course: courseId })
            .populate("user", "name")
            .populate("course", "title");
        res.status(200).json({
            success: true,
            data: reviews,
        });
    } catch (error) {
        logger.error("failed_to_fetch_course_reviews", {
            courseId: req.params.courseId,
            userId: req.user._id,
            ip: req.ip,
            error: error.message
        });
        next(error);
    }
}
