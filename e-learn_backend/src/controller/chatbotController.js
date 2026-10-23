import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.models.js";
import Lesson from "../models/Lesson.models.js";

const chatbotApi = (path) => `${(process.env.CHATBOT_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "")}${path}`;
const courseCollection = (courseId) => `course_${String(courseId).replace(/[^a-zA-Z0-9_-]/g, "_")}`;
const isPdfUrl = (url) => /\.pdf(?:$|[?#])/i.test(url || "");

const callChatbot = async (path, body) => {
  let response;
  try {
    response = await fetch(chatbotApi(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    const error = new Error("The chatbot service is unavailable. Start the FastAPI server and try again.");
    error.statusCode = 503;
    throw error;
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.detail || "The chatbot service could not process this request.");
    error.statusCode = response.status >= 500 ? 502 : response.status;
    throw error;
  }
  return payload;
};

export const prepareChatbot = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id }).populate("course", "title");
    
    const courses = [];
    for (const enrollment of enrollments) {
      const course = enrollment.course;
      if (!course) continue;
      const lessons = await Lesson.find({ course: course._id }).select("resources");
      const urls = [...new Set(lessons.flatMap((lesson) => lesson.resources || [])
        .map((resource) => resource?.fileUrl)
        .filter((url) => isPdfUrl(url)))];
      const collectionName = courseCollection(course._id);
      let indexed = 0;
      let alreadyIndexed = 0;
      for (const sourceUrl of urls) {
        const result = await callChatbot("/chatbot/document_fetch", {
          source_url: sourceUrl,
          collection_name: collectionName,
        });
        if (result.already_indexed) alreadyIndexed += 1;
        else indexed += 1;
      }
      courses.push({
        id: String(course._id),
        title: course.title,
        collectionName,
        documentsFound: urls.length,
        indexed,
        alreadyIndexed,
      });
    }
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const askChatbot = async (req, res, next) => {
  try {
    const { courseId, question } = req.body;
    if (!mongoose.isValidObjectId(courseId)) {
      res.status(400);
      throw new Error("Select a valid enrolled course.");
    }
    if (typeof question !== "string" || !question.trim()) {
      res.status(400);
      throw new Error("Enter a question.");
    }
    const enrollment = await Enrollment.exists({ user: req.user._id, course: courseId });
    if (!enrollment) {
      res.status(403);
      throw new Error("You can only ask questions about courses you are enrolled in.");
    }
    const result = await callChatbot("/chatbot/ask", {
      question: question.trim(),
      collection_name: courseCollection(courseId),
    });
    res.status(200).json({ success: true, answer: result.answer });
  } catch (error) {
    next(error);
  }
};
