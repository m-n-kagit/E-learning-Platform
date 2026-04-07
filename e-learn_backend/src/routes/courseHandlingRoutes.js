import express from "express";
const router = express.Router();

import courseController from "../controller/courseController.js";

router.post("/upload-content", courseController.uploadContent);
router.get("/get-all-courses", courseController.getAllCourses);
router.patch("/update-course", courseController.updateCourse);
router.post("/add-lesson", courseController.addLesson);
router.delete("/remove-lesson", courseController.removeLesson);
