import express from "express";
import * as courseController from "../controller/cadminCourseController.js";
import * as studentCourseController from "../controller/studentCourseController.js";
import protect from "../middlewares/authMiddleware.js";
import { courseMediaUpload } from "../middlewares/multer.js";
const router = express.Router();

const courseUploadFields = courseMediaUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lessonVideos", maxCount: 50 }
]);

const singleLessonUpload = courseMediaUpload.fields([
    { name: "lessonVideo", maxCount: 1 }
]);

const thumbnailUploadOnly = courseMediaUpload.fields([
    { name: "thumbnail", maxCount: 1 }
]);

router.get("/available", studentCourseController.getAllCourses);
router.get("/available/:courseId", studentCourseController.getCourseById);
router.get(
    "/my-courses",
    protect.protect,
    protect.restrictTo("user", "course_admin", "admin"),
    studentCourseController.getMyCourses
);
router.post(
    "/enroll",
    protect.protect,
    protect.restrictTo("user", "course_admin", "admin"),
    studentCourseController.enrollCourse
);

// The real use of RBAC
router.get(
    "/get-all-courses",
    protect.protect,
    protect.restrictTo("course_admin", "admin"),
    courseController.getAllCourses
);
router.patch(
    "/update-course",
    protect.protect,
    protect.restrictTo("course_admin", "admin"),
    thumbnailUploadOnly,
    courseController.updateCourse
);
router.post(
    "/add-lesson",
    protect.protect,
    protect.restrictTo("course_admin", "admin"),
    singleLessonUpload,
    courseController.addLesson
);
router.delete(
    "/remove-lesson",
    protect.protect,
    protect.restrictTo("course_admin", "admin"),
    courseController.removeLesson
);
router.post(
    "/upload-content",
    protect.protect,
    protect.restrictTo("course_admin", "admin"),
    courseUploadFields,
    courseController.uploadContent
);

export default router;
