import express from "express";
import courseController from "../controller/courseController.js";
import protect from "../middlewares/authMiddleware.js";
const router = express.Router();
//The real use of RBAC 
router.use(protect.protect, protect.restrictTo("course_admin", "admin")); // Only course_admin and admin can access these routes

router.post("/upload-content", courseController.uploadContent);
router.get("/get-all-courses", courseController.getAllCourses);
router.patch("/update-course", courseController.updateCourse);
router.post("/add-lesson", courseController.addLesson);
router.delete("/remove-lesson", courseController.removeLesson);
