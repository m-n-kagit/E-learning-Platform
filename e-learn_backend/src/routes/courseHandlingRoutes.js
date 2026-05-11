import express from "express";
import * as courseController from "../controller/cadminCourseController.js";
import * as studentCourseController from "../controller/studentCourseController.js";
import protect from "../middlewares/authMiddleware.js";
import { courseMediaUpload } from "../middlewares/multer.js";
import { enrollInCourse, getEnrolledCourses, getAllLessonsForCourse, removeEnrollment } from "../controller/courseEnrollController.js";
const router = express.Router();

const courseUploadFields = courseMediaUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lessonVideos", maxCount: 50 }
]);

const singleLessonUpload = courseMediaUpload.fields([
    { name: "lessonVideo", maxCount: 1 },
    { name: "lessonDocument", maxCount: 1 }
]);

const thumbnailUploadOnly = courseMediaUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "overviewVideo", maxCount: 1 }
]);

router.get("/available", studentCourseController.getAllCourses);
router.get("/available/:courseId", studentCourseController.getCourseById);
router.get("/detail/:courseId", studentCourseController.getCourseById);
router.get( "/my-courses",
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
); // in patch request, we are adding the thumbnailUploadOnly middleware to handle
//  the thumbnail and overview video upload separately from the lesson videos,
//  this way we can update the course details without having to re-upload all the lesson videos
//  if we only want to change the thumbnail or overview video
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
router.patch(
    "/update-lesson",
    protect.protect,
    protect.restrictTo("course_admin", "admin"),
    singleLessonUpload,
    courseController.updateLesson
);
router.post(
    "/upload-content",
    protect.protect,
    protect.restrictTo("course_admin", "admin"),
    courseUploadFields,
    courseController.uploadContent
);
router.delete(
    "/delete-course",
    protect.protect,
    protect.restrictTo("course_admin", "admin"),
    courseController.deleteCourse
);

router.post("/enroll-course",
    protect.protect,
    protect.restrictTo("user", "course_admin", "admin"),
    enrollInCourse
);

router.get("/my-enrollments",
    protect.protect,
    protect.restrictTo("user", "course_admin", "admin"),
    getEnrolledCourses
);

router.delete(
    "/unenroll",
    protect.protect,
    protect.restrictTo("user"),
    removeEnrollment
);

router.get("/course/:courseId/lessons",
    protect.protect,
    protect.restrictTo("user"),
    getAllLessonsForCourse
);


export default router;
