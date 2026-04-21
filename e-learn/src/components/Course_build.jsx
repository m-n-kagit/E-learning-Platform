import { useRef, useState } from "react";
import axios from "axios";

const LEVELS = [
  { value: "beginner", label: "Beginner", icon: "B" },
  { value: "intermediate", label: "Intermediate", icon: "I" },
  { value: "advanced", label: "Advanced", icon: "A" },
];

const UPLOAD_HINTS = {
  video: "MP4, MOV - Max 2GB",
  article: "HTML, MD - Max 10MB",
  document: "PDF, DOCX - Max 50MB",
};

const createEmptyLessonForm = () => ({
  title: "",
  module: "",
  description: "",
  lessonVideo: null,
});

function Stepper({ current }) {
  const steps = ["Course Details", "Add Lessons"];

  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < current;
        const isActive = stepNumber === current;

        return (
          <div key={stepNumber} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  flexShrink: 0,
                  transition: ".3s",
                  background: isDone ? "rgba(31, 92, 16, 0.14)" : isActive ? "#1f5c10" : "transparent",
                  border: `1.5px solid ${isDone || isActive ? "#1f5c10" : "rgba(0, 0, 0, 0.16)"}`,
                  color: isDone ? "#1f5c10" : isActive ? "#fff" : "#4a6830",
                }}
              >
                {isDone ? "OK" : stepNumber}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: isActive ? "#1a2e0f" : "#4a6830" }}>
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  margin: "0 10px",
                  background: isDone ? "rgba(31, 92, 16, 0.35)" : "rgba(0, 0, 0, 0.16)",
                  transition: ".3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CourseDetailsForm({ onNext }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    level: "beginner",
    thumbnail: null,
  });
  const [errors, setErrors] = useState({});
  const [thumbPreview, setThumbPreview] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef(null);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleThumb = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setField("thumbnail", file);
    const reader = new FileReader();
    reader.onload = (loadEvent) => setThumbPreview(loadEvent.target?.result || null);
    reader.readAsDataURL(file);
  };

  const removeThumb = (event) => {
    event.stopPropagation(); //stopPropagation here is used to 
    setField("thumbnail", null);
    setThumbPreview(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Course name is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (form.price === "" || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      nextErrors.price = "Please enter a valid price.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    try {
      setIsSaving(true);
      setSubmitError("");

      const formData = new FormData();
      formData.append("title", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", String(form.price));
      formData.append("level", form.level);
      formData.append("isPublished", "true");

      if (form.thumbnail) {
        formData.append("thumbnail", form.thumbnail);
      }

      const response = await axios.post("/api/courses/upload-content", formData, {
        withCredentials: true,
      });

      onNext({
        ...form,
        savedCourse: response?.data?.data || null,
      });
    } catch (error) {
      console.error("Failed to save course:", error);
      setSubmitError(error?.response?.data?.message || "Unable to save course right now.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Create a New Course</div>
      <div style={styles.cardSubtitle}>Fill in the details to set up your course before adding lessons.</div>

      <div style={styles.formGrid}>
        <div style={{ ...styles.fgroup, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Course Name</label>
          <input
            style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
            placeholder="e.g. Full-Stack Web Development Bootcamp"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
          />
          {errors.name && <span style={styles.errMsg}>{errors.name}</span>}
        </div>

        <div style={{ ...styles.fgroup, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Description</label>
          <textarea
            style={{ ...styles.input, ...(errors.description ? styles.inputError : {}), minHeight: 90, resize: "vertical" }}
            placeholder="Describe what students will learn, prerequisites, outcomes..."
            value={form.description}
            onChange={(event) => setField("description", event.target.value)}
          />
          {errors.description && <span style={styles.errMsg}>{errors.description}</span>}
        </div>

        <div style={styles.fgroup}>
          <label style={styles.label}>Price (USD)</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#4a6830", fontSize: 14 }}>$</span>
            <input
              type="number"
              min="0"
              style={{ ...styles.input, paddingLeft: 28, ...(errors.price ? styles.inputError : {}) }}
              placeholder="49.99"
              value={form.price}
              onChange={(event) => setField("price", event.target.value)}
            />
          </div>
          {errors.price && <span style={styles.errMsg}>{errors.price}</span>}
        </div>

        <div style={styles.fgroup}>
          <label style={styles.label}>Level</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {LEVELS.map(({ value, label, icon }) => (
              <div
                key={value}
                onClick={() => setField("level", value)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "12px 8px",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: ".2s",
                  border: `1.5px solid ${form.level === value ? "#1f5c10" : "rgba(0, 0, 0, 0.16)"}`,
                  background: form.level === value ? "rgba(31, 92, 16, 0.14)" : "transparent",
                  color: form.level === value ? "#1f5c10" : "#4a6830",
                  fontSize: 12,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 20, background: "rgba(255, 255, 255, 0.55)", padding: 6, borderRadius: 8 }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...styles.fgroup, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Thumbnail</label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `1.5px dashed ${thumbPreview ? "rgba(31, 92, 16, 0.35)" : "rgba(0, 0, 0, 0.16)"}`,
              borderStyle: thumbPreview ? "solid" : "dashed",
              borderRadius: 14,
              padding: thumbPreview ? 0 : "28px 20px",
              textAlign: "center",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              transition: ".2s",
              background: thumbPreview ? "transparent" : "rgba(255, 255, 255, 0.3)",
            }}
          >
            {thumbPreview ? (
              <>
                <img src={thumbPreview} alt="thumbnail" style={{ width: "100%", height: 140, objectFit: "cover", display: "block", borderRadius: 12 }} />
                <button
                  onClick={removeThumb}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "#dc262688",
                    border: "none",
                    color: "#fff",
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  X
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#4a6830" }}>
                <div style={{ width: 40, height: 40, background: "rgba(255, 255, 255, 0.55)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  IMG
                </div>
                <span style={{ fontSize: 13 }}>Upload Thumbnail</span>
                <span style={{ fontSize: 11, color: "#2e4a1a" }}>PNG, JPG or WEBP - recommended 1280x720</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleThumb} />
        </div>
      </div>

      <div style={styles.footer}>
        {submitError && <span style={styles.errMsg}>{submitError}</span>}
        <button
          style={{ ...styles.btnNext, opacity: isSaving ? 0.7 : 1, cursor: isSaving ? "not-allowed" : "pointer" }}
          onClick={handleNext}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Course"}
        </button>
      </div>
    </div>
  );
}

function LessonBuilder({ courseData, onBack }) {
  const [tab, setTab] = useState("video");
  const [lessonForm, setLessonForm] = useState(createEmptyLessonForm());
  const [queuedLessons, setQueuedLessons] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const lessonFileRef = useRef(null);

  const updateLessonField = (key, value) => {
    setLessonForm((current) => ({ ...current, [key]: value }));
  };

  const resetLessonForm = () => {
    setLessonForm(createEmptyLessonForm());
    if (lessonFileRef.current) {
      lessonFileRef.current.value = "";
    }
  };

  const handleLessonVideo = (event) => {
    const file = event.target.files?.[0] || null;
    updateLessonField("lessonVideo", file);
  };

  const hasDraftLesson = Boolean(
    lessonForm.title.trim() ||
    lessonForm.module.trim() ||
    lessonForm.description.trim() ||
    lessonForm.lessonVideo
  );

  const buildLessonEntry = () => {
    const resolvedTitle = lessonForm.title.trim() || lessonForm.module.trim();
    if (!resolvedTitle) {
      setSubmitError("Add a lesson title before publishing.");
      return null;
    }

    return {
      title: resolvedTitle,
      module: lessonForm.module.trim(),
      description: lessonForm.description.trim(),
      lessonVideo: lessonForm.lessonVideo,
      type: tab,
    };
  };

  const handleAddAnother = () => {
    setSubmitError("");
    setSuccessMessage("");
    const lessonEntry = buildLessonEntry();
    if (!lessonEntry) return;

    setQueuedLessons((current) => [...current, lessonEntry]);
    resetLessonForm();
  };

  const persistLesson = async (lesson, order) => {
    const formData = new FormData();
    formData.append("courseId", courseData.savedCourse?._id || "");
    formData.append("title", lesson.title);
    formData.append("lessonName", lesson.module || lesson.title);
    formData.append("description", lesson.description || "");
    formData.append("order", String(order));

    if (lesson.lessonVideo) {
      formData.append("lessonVideo", lesson.lessonVideo);
    }

    await axios.post("/api/courses/add-lesson", formData, {
      withCredentials: true,
    });
  };

  const handlePublishCourse = async () => {
    if (!courseData.savedCourse?._id) {
      setSubmitError("Save the course details first before publishing lessons.");
      return;
    }

    setSubmitError("");
    setSuccessMessage("");

    const lessonsToPublish = [...queuedLessons];
    if (hasDraftLesson) {
      const draftLesson = buildLessonEntry();
      if (!draftLesson) return;
      lessonsToPublish.push(draftLesson);
    }

    if (lessonsToPublish.length === 0) {
      setSuccessMessage("Course published successfully without lessons.");
      return;
    }

    try {
      setIsPublishing(true);
      const existingLessonsCount = Array.isArray(courseData.savedCourse?.lessons)
        ? courseData.savedCourse.lessons.length
        : 0;

      for (const [index, lesson] of lessonsToPublish.entries()) {
        await persistLesson(lesson, existingLessonsCount + index + 1);
      }

      setQueuedLessons([]);
      resetLessonForm();
      setSuccessMessage(`Course published successfully with ${lessonsToPublish.length} lesson${lessonsToPublish.length > 1 ? "s" : ""}.`);
    } catch (error) {
      console.error("Failed to publish course lessons:", error);
      setSubmitError(error?.response?.data?.message || "Unable to publish course right now.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <div style={{ ...styles.card, marginBottom: 20 }}>
        <div style={styles.cardTitle}>Add Lessons</div>
        <div style={styles.cardSubtitle}>
          Adding lessons to: <strong style={{ color: "#1f5c10" }}>{courseData.savedCourse?.title || courseData.name}</strong>
        </div>

        <div style={{ display: "flex", gap: 4, background: "rgba(255, 255, 255, 0.55)", borderRadius: 10, padding: 4, width: "fit-content", marginBottom: 24 }}>
          {["video", "article", "document"].map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              style={{
                padding: "8px 18px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                transition: ".2s",
                background: tab === value ? "#aedc9f" : "transparent",
                color: tab === value ? "#1a2e0f" : "#4a6830",
                fontFamily: "inherit",
              }}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={styles.fgroup}>
            <label style={styles.label}>Content Title</label>
            <input
              style={styles.input}
              placeholder={`Enter ${tab} title`}
              value={lessonForm.title}
              onChange={(event) => updateLessonField("title", event.target.value)}
            />
          </div>
          <div style={styles.fgroup}>
            <label style={styles.label}>Module / Week</label>
            <input
              style={styles.input}
              placeholder="e.g. Module 1 - Introduction"
              value={lessonForm.module}
              onChange={(event) => updateLessonField("module", event.target.value)}
            />
          </div>
        </div>

        <div style={{ ...styles.fgroup, marginBottom: 16 }}>
          <label style={styles.label}>Description</label>
          <textarea
            style={{ ...styles.input, minHeight: 80, resize: "vertical" }}
            placeholder="Brief description of this lesson..."
            value={lessonForm.description}
            onChange={(event) => updateLessonField("description", event.target.value)}
          />
        </div>

        <div
          onClick={() => lessonFileRef.current?.click()}
          style={{
            border: "1.5px dashed rgba(0, 0, 0, 0.16)",
            borderRadius: 14,
            padding: "32px 20px",
            textAlign: "center",
            cursor: "pointer",
            color: "#4a6830",
            fontSize: 13,
            background: "rgba(255, 255, 255, 0.3)",
          }}
        >
          <div style={{ width: 44, height: 44, background: "rgba(255, 255, 255, 0.55)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            UP
          </div>
          <p>Drag and drop or <span style={{ color: "#1f5c10", fontWeight: 600 }}>browse files</span></p>
          <span style={{ fontSize: 11, color: "#2e4a1a", marginTop: 4, display: "block" }}>{UPLOAD_HINTS[tab]}</span>
          {lessonForm.lessonVideo && (
            <span style={{ fontSize: 12, color: "#1f5c10", marginTop: 8, display: "block", fontWeight: 600 }}>
              {lessonForm.lessonVideo.name}
            </span>
          )}
        </div>
        <input
          ref={lessonFileRef}
          type="file"
          accept={tab === "video" ? "video/*" : ".pdf,.doc,.docx,.md,.html,.txt"}
          style={{ display: "none" }}
          onChange={handleLessonVideo}
        />

        <div style={{ ...styles.footer, marginTop: 16, justifyContent: "flex-start" }}>
          <button style={{ ...styles.btnBack, padding: "9px 18px", fontSize: 13 }} onClick={handleAddAnother}>
            + Add Another
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 18, fontFamily: "inherit", fontWeight: 700, color: "#1a2e0f" }}>Queued Lessons</span>
        </div>

        <div style={{ border: "1px solid rgba(0, 0, 0, 0.16)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.55)" }}>
                {["Lesson Title", "Module", "Description", "Type"].map((header) => (
                  <th key={header} style={{ padding: "11px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".6px", color: "#4a6830", textAlign: "left" }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queuedLessons.length === 0 ? (
                <tr style={{ borderTop: "1px solid rgba(0, 0, 0, 0.16)" }}>
                  <td colSpan="4" style={{ padding: "16px", fontSize: 13, color: "#4a6830" }}>
                    No queued lessons yet. Add a lesson above or publish the course directly.
                  </td>
                </tr>
              ) : (
                queuedLessons.map((lesson, index) => (
                  <tr key={`${lesson.title}-${index}`} style={{ borderTop: "1px solid rgba(0, 0, 0, 0.16)" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#1a2e0f" }}>{lesson.title}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a2e0f" }}>{lesson.module || "Untitled module"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a2e0f" }}>{lesson.description || "-"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={styles.tagBlue}>{lesson.lessonVideo ? "Video" : lesson.type}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.footer}>
          {submitError && <span style={styles.errMsg}>{submitError}</span>}
          {successMessage && <span style={styles.successMsg}>{successMessage}</span>}
          <button style={styles.btnBack} onClick={onBack}>Back</button>
          <button
            style={{ ...styles.btnNext, opacity: isPublishing ? 0.7 : 1, cursor: isPublishing ? "not-allowed" : "pointer" }}
            onClick={handlePublishCourse}
            disabled={isPublishing}
          >
            {isPublishing ? "Publishing..." : "Publish Course"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function CourseUpload() {
  const [step, setStep] = useState(1);
  const [courseData, setCourseData] = useState(null);

  const handleNext = (data) => {
    setCourseData(data);
    setStep(2);
  };

  const handleBack = () => setStep(1);

  return (
    <div style={{ background: "#e9efdc", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#1a2e0f" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 48px" }}>
        <Stepper current={step} />
        {step === 1 && <CourseDetailsForm onNext={handleNext} />}
        {step === 2 && <LessonBuilder courseData={courseData} onBack={handleBack} />}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#aedc9f",
    border: "1px solid rgba(0, 0, 0, 0.16)",
    borderRadius: 14,
    padding: "28px 28px 24px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
  },
  cardTitle: { fontSize: 22, fontFamily: "inherit", fontWeight: 700, color: "#1a2e0f", marginBottom: 6 },
  cardSubtitle: { fontSize: 13, color: "#4a6830", marginBottom: 28 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fgroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: "#4a6830", textTransform: "uppercase", letterSpacing: ".7px" },
  input: {
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(0, 0, 0, 0.16)",
    borderRadius: 10,
    color: "#1a2e0f",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    padding: "10px 14px",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputError: { borderColor: "#dc2626" },
  errMsg: { fontSize: 12, color: "#dc2626" },
  successMsg: { fontSize: 12, color: "#1f5c10", fontWeight: 600 },
  footer: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, alignItems: "center", flexWrap: "wrap" },
  btnNext: {
    background: "#1f5c10",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 28px",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.2s",
    boxShadow: "0 2px 12px rgba(31,92,16,0.3)",
  },
  btnBack: {
    background: "transparent",
    color: "#4a6830",
    border: "1px solid rgba(0, 0, 0, 0.16)",
    borderRadius: 10,
    padding: "11px 20px",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tagBlue: {
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: "rgba(31, 92, 16, 0.14)",
    color: "#1f5c10",
  },
};

export { Stepper, CourseDetailsForm, LessonBuilder };
