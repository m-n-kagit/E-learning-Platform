import mongoose from "mongoose";
import Instructor from "../models/Instructor.models.js";
import Course from "../models/Course.models.js";
import Lesson from "../models/Lesson.models.js";
import uploadCloudinary from "../utils/cloudinery.js";

const parseLessonsInput = (lessonsInput) => {
    if (Array.isArray(lessonsInput)) {
        return lessonsInput;
    }

    if (typeof lessonsInput === "string" && lessonsInput.trim()) {
        try {
            const parsedLessons = JSON.parse(lessonsInput);
            return Array.isArray(parsedLessons) ? parsedLessons : [];
        } catch (error) {
            error.statusCode = 400;
            error.message = "Lessons must be a valid JSON array";
            throw error;
        }
    }

    return [];
};

const getUploadedFiles = (req, fieldName) => {
    const files = req.files?.[fieldName];
    return Array.isArray(files) ? files : [];
};

const uploadThumbnailIfPresent = async (req) => {
    const [thumbnailFile] = getUploadedFiles(req, "thumbnail");
    if (!thumbnailFile?.path) {
        return { thumbnail: "", thumbnailPublicId: "" };
    }

    const uploadedThumbnail = await uploadCloudinary(thumbnailFile.path, {
        resource_type: "image",
        folder: "course-thumbnails"
    });

    if (!uploadedThumbnail?.secure_url) {
        throw new Error("Unable to upload course thumbnail right now");
    }

    return {
        thumbnail: uploadedThumbnail.secure_url,
        thumbnailPublicId: uploadedThumbnail.public_id || ""
    };
};

const buildLessonPayload = async (courseId, lessons, lessonVideoFiles = []) => {
    const lessonPayload = [];

    for (const [index, lesson] of lessons.entries()) {
        const resolvedTitle = String(lesson.title || lesson.lessonName || "").trim();
        if (!resolvedTitle) {
            continue;
        }

        let uploadedVideo = null;
        const lessonVideoFile = lessonVideoFiles[index];

        if (lessonVideoFile?.path) {
            uploadedVideo = await uploadCloudinary(lessonVideoFile.path, {
                resource_type: "video",
                folder: "course-lessons"
            });

            if (!uploadedVideo?.secure_url) {
                throw new Error(`Unable to upload video for lesson ${resolvedTitle}`);
            }
        }

        lessonPayload.push({
            title: resolvedTitle,
            description: lesson.description || "",
            course: courseId,
            videoUrl: uploadedVideo?.secure_url || lesson.videoUrl || "pending",
            videoPublicId: uploadedVideo?.public_id || "",
            duration: Number(lesson.duration) || 0,
            order: Number.isFinite(Number(lesson.order)) ? Number(lesson.order) : index + 1,
            isPreview: Boolean(lesson.isPreview),
            resources: Array.isArray(lesson.resources) ? lesson.resources : []
        });
    }

    return lessonPayload;
};

const uploadContent  = async (req,res,next)=>{
    const {
        lessons: lessonsInput = [],
        isPublished,
        name,
        ...courseData
    } = req.body;
     // spread operator is used to separate lessons and isPublished from the rest of the course data

    try {
        const instructorId = req.user?._id;
        if (!instructorId) {
            res.status(401);
            throw new Error("Unauthorized user");
        }

        const normalizedLessons = parseLessonsInput(lessonsInput);
        const thumbnailUpload = await uploadThumbnailIfPresent(req);
        const resolvedTitle = String(courseData.title || name || "").trim();
        const resolvedDescription = String(courseData.description || "").trim();
        const normalizedLevel = String(courseData.level || "beginner").trim().toLowerCase();

        if (!resolvedTitle) {
            res.status(400);
            throw new Error("Course title is required");
        }

        if (!resolvedDescription) {
            res.status(400);
            throw new Error("Course description is required");
        }

        if (!["beginner", "intermediate", "advanced"].includes(normalizedLevel)) {
            res.status(400);
            throw new Error("Course level must be beginner, intermediate, or advanced");
        }

        const createdCourse = await Course.create({
            ...courseData,
            title: resolvedTitle,
            description: resolvedDescription,
            instructor: instructorId,
            ...thumbnailUpload,
            price: Number(courseData.price) || 0,
            level: normalizedLevel,
            isPublished:
                typeof isPublished === "boolean"
                    ? isPublished
                    : String(isPublished).trim().toLowerCase() === "false"
                        ? false
                        : true
        });

        if (normalizedLessons.length > 0) {
            const lessonPayload = await buildLessonPayload(
                createdCourse._id,
                normalizedLessons,
                getUploadedFiles(req, "lessonVideos")
            );

            if (lessonPayload.length > 0) {
                const createdLessons = await Lesson.insertMany(lessonPayload);
                createdCourse.lessons = createdLessons.map((lesson) => lesson._id);
                await createdCourse.save();
            }
        }

        await Instructor.findOneAndUpdate(
            { user: instructorId },
            { $addToSet: { courses: createdCourse._id } },
            { new: true, upsert: true }
        );

        const populatedCourse = await Course.findById(createdCourse._id)
            .populate("instructor", "name email")
            .populate("lessons");

        res.status(201).json({
            success: true,
            data: populatedCourse
        });
    } catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode);
        }
        next(error);
    }
}

const getAllCourses = async (req,res,next)=>{
    try{
    const userId = req.user?._id;
    if(!userId){
        res.status(401);
        throw new Error("Unauthorized user");
    }

    const filter = req.user.role === "admin" ? {} : { instructor: userId };
    const courses = await Course.find(filter)
        .populate("instructor", "name email")
        .populate("lessons")
        .sort({ createdAt: -1 });
    //populate the instructor field with name and email from the Instructor collection
    res.status(200).json({
        success: true,
        data: courses
    })}
    catch(error){
        if (error.statusCode) {
            res.status(error.statusCode);
        }
        next(error);
    }
}

const  updateCourse = async (req,res,next)=>{
    const {_id} = req.body;
    const courseData = { ...req.body };
    try{
        const existingCourse = await Course.findById(_id);
        if(!existingCourse){
            res.status(404);
            throw new Error("Course not found");
        }

        if (req.user.role !== "admin" && existingCourse.instructor.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("You do not have permission to update this course");
        }

        const thumbnailUpload = await uploadThumbnailIfPresent(req);
        if (thumbnailUpload.thumbnail) {
            courseData.thumbnail = thumbnailUpload.thumbnail;
            courseData.thumbnailPublicId = thumbnailUpload.thumbnailPublicId;
        }

        const updatedCourse = await Course.findByIdAndUpdate(_id, courseData, {new: true})
            .populate("instructor", "name email")
            .populate("lessons");
        if(!updatedCourse){
            res.status(404);
            throw new Error("Course not found");
        }
        res.status(200).json({
            success: true,
            data: updatedCourse
        })}
    catch(error){
        next(error);
    }
}

const addLesson = async (req,res,next)=>{
    const {
        courseId,
        title,
        lessonName,
        description = "",
        videoUrl = "pending",
        duration = 0,
        isPreview = false,
        resources = [],
        order
    } = req.body;

    try{
        if (!mongoose.isValidObjectId(courseId)) {
            res.status(400);
            throw new Error("Invalid courseId");
        }

        const resolvedTitle = String(title || lessonName || "").trim();
        if (!resolvedTitle) {
            res.status(400);
            throw new Error("Lesson title is required");
        }

        const course = await Course.findById(courseId);
        if(!course){
            res.status(404);
            throw new Error("Course not found");
        }

        if (req.user.role !== "admin" && course.instructor.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("You do not have permission to add lessons to this course");
        }

        const resolvedOrder = Number.isFinite(Number(order))
            ? Number(order)
            : course.lessons.length + 1;

        let uploadedVideo = null;
        const [lessonVideoFile] = getUploadedFiles(req, "lessonVideo");
        if (lessonVideoFile?.path) {
            uploadedVideo = await uploadCloudinary(lessonVideoFile.path, {
                resource_type: "video",
                folder: "course-lessons"
            });

            if (!uploadedVideo?.secure_url) {
                res.status(500);
                throw new Error("Unable to upload lesson video right now");
            }
        }

        const lesson = await Lesson.create({
            title: resolvedTitle,
            description,
            course: course._id,
            videoUrl: uploadedVideo?.secure_url || videoUrl,
            videoPublicId: uploadedVideo?.public_id || "",
            duration: Number(duration) || 0,
            order: resolvedOrder,
            isPreview: Boolean(isPreview),
            resources: Array.isArray(resources) ? resources : []
        });

        course.lessons.push(lesson._id);

        // Keep instructor-course mapping consistent in Instructor collection.
        if (course.instructor) {
            await Instructor.findOneAndUpdate(
                { user: course.instructor },
                { $addToSet: { courses: course._id } },
                { new: true }
            );
        }
        

        const updatedCourse = await course.save();
        res.status(200).json({
            success: true,
            message: "Lesson created and added to course successfully",
            data: {
                lesson,
                course: updatedCourse
            }
        })}
    catch(error){
        next(error);
    }
}

const removeLesson = async (req,res,next)=>{
    const {courseId, lessonId} = req.body;
    try{
        if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(lessonId)) {
            res.status(400);
            throw new Error("Invalid courseId or lessonId");
        }

        const course = await Course.findById(courseId);
        if(!course){
            res.status(404);
            throw new Error("Course not found");
        }

        if (req.user.role !== "admin" && course.instructor.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("You do not have permission to remove lessons from this course");
        }
        
        const lessonIndex = course.lessons.indexOf(lessonId);
        if (lessonIndex === -1) {
            res.status(404);
            throw new Error("Lesson not found in course");
        }

        course.lessons.splice(lessonIndex, 1);
        await course.save();
        await Lesson.findByIdAndDelete(lessonId);

        res.status(200).json({
            success: true,
            message: "Lesson removed from course successfully"
        });
    } catch (error) {
        next(error);
    }
}


export {uploadContent, getAllCourses, updateCourse, addLesson, removeLesson}
