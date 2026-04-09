import { useState, useRef } from "react";

const LEVELS = [
  { value: "beginner", label: "Beginner", icon: "🌱" },
  { value: "intermediate", label: "Intermediate", icon: "🚀" },
  { value: "advanced", label: "Advanced", icon: "🔥" },
];

const QUIZZES = [
  { id: 1, title: "Week 1 — HTML & CSS Basics", course: "Full-Stack Web Dev", questions: 15, submissions: 420, avgScore: 78 },
  { id: 2, title: "Module 3 — REST APIs", course: "Node.js Masterclass", questions: 12, submissions: 300, avgScore: 72 },
  { id: 3, title: "React Hooks Deep Dive", course: "React Advanced Patterns", questions: 20, submissions: 180, avgScore: 85 },
];

const UPLOAD_HINTS = {
  video: "MP4, MOV — Max 2GB",
  article: "HTML, MD — Max 10MB",
  document: "PDF, DOCX — Max 50MB",
};

/* ─── Stepper ─────────────────────────────────────────────── */
function Stepper({ current }) {
  const steps = ["Course Details", "Add Lessons"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const isDone = idx < current;
        const isActive = idx === current;
        return (
          <div key={idx} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600,
                flexShrink: 0, transition: ".3s",
                background: isDone ? "rgba(31, 92, 16, 0.14)" : isActive ? "#1f5c10" : "transparent",
                border: `1.5px solid ${isDone ? "#1f5c10" : isActive ? "#1f5c10" : "rgba(0, 0, 0, 0.16)"}`,
                color: isDone ? "#1f5c10" : isActive ? "#fff" : "#4a6830",
              }}>
                {isDone ? "✓" : idx}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: isActive ? "#1a2e0f" : "#4a6830" }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 1, margin: "0 10px",
                background: isDone ? "rgba(31, 92, 16, 0.35)" : "rgba(0, 0, 0, 0.16)", transition: ".3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Step 1 — Course Details ─────────────────────────────── */
function CourseDetailsForm({ onNext }) {
  const [form, setForm] = useState({
    name: "", description: "", price: "", level: "beginner", thumbnail: null,
  });
  const [errors, setErrors] = useState({});
  const [thumbPreview, setThumbPreview] = useState(null);
  const fileRef = useRef();

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set("thumbnail", file);
    const reader = new FileReader();
    reader.onload = (ev) => setThumbPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeThumb = (e) => {
    e.stopPropagation();
    set("thumbnail", null);
    setThumbPreview(null);
    fileRef.current.value = "";
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Course name is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (form.price === "" || isNaN(form.price) || Number(form.price) < 0)
      e.price = "Please enter a valid price.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(form); };

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Create a New Course</div>
      <div style={styles.cardSubtitle}>Fill in the details to set up your course before adding lessons.</div>

      <div style={styles.formGrid}>
        {/* Name */}
        <div style={{ ...styles.fgroup, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Course Name</label>
          <input
            style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
            placeholder="e.g. Full-Stack Web Development Bootcamp"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          {errors.name && <span style={styles.errMsg}>{errors.name}</span>}
        </div>

        {/* Description */}
        <div style={{ ...styles.fgroup, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Description</label>
          <textarea
            style={{ ...styles.input, ...(errors.description ? styles.inputError : {}), minHeight: 90, resize: "vertical" }}
            placeholder="Describe what students will learn, prerequisites, outcomes..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
          {errors.description && <span style={styles.errMsg}>{errors.description}</span>}
        </div>

        {/* Price */}
        <div style={styles.fgroup}>
          <label style={styles.label}>Price (USD)</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#4a6830", fontSize: 14 }}>$</span>
            <input
              type="number" min="0"
              style={{ ...styles.input, paddingLeft: 28, ...(errors.price ? styles.inputError : {}) }}
              placeholder="49.99"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </div>
          {errors.price && <span style={styles.errMsg}>{errors.price}</span>}
        </div>

        {/* Level */}
        <div style={styles.fgroup}>
          <label style={styles.label}>Level</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {LEVELS.map(({ value, label, icon }) => (
              <div
                key={value}
                onClick={() => set("level", value)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "12px 8px", borderRadius: 10, cursor: "pointer", transition: ".2s",
                  border: `1.5px solid ${form.level === value ? "#1f5c10" : "rgba(0, 0, 0, 0.16)"}`,
                  background: form.level === value ? "rgba(31, 92, 16, 0.14)" : "transparent",
                  color: form.level === value ? "#1f5c10" : "#4a6830",
                  fontSize: 12, fontWeight: 500, textAlign: "center",
                }}
              >
                <span style={{ fontSize: 20, background: "rgba(255, 255, 255, 0.55)", padding: 6, borderRadius: 8 }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Thumbnail */}
        <div style={{ ...styles.fgroup, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Thumbnail</label>
          <div
            onClick={() => fileRef.current.click()}
            style={{
              border: `1.5px dashed ${thumbPreview ? "rgba(31, 92, 16, 0.35)" : "rgba(0, 0, 0, 0.16)"}`,
              borderStyle: thumbPreview ? "solid" : "dashed",
              borderRadius: 14, padding: thumbPreview ? 0 : "28px 20px",
              textAlign: "center", cursor: "pointer", position: "relative", overflow: "hidden",
              transition: ".2s", background: thumbPreview ? "transparent" : "rgba(255, 255, 255, 0.3)",
            }}
          >
            {thumbPreview ? (
              <>
                <img src={thumbPreview} alt="thumbnail" style={{ width: "100%", height: 140, objectFit: "cover", display: "block", borderRadius: 12 }} />
                <button
                  onClick={removeThumb}
                  style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%", background: "#dc262688", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                >✕</button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#4a6830" }}>
                <div style={{ width: 40, height: 40, background: "rgba(255, 255, 255, 0.55)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" fill="none" stroke="#4a6830" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <span style={{ fontSize: 13 }}>Upload Thumbnail</span>
                <span style={{ fontSize: 11, color: "#2e4a1a" }}>PNG, JPG or WEBP — recommended 1280×720</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleThumb} />
        </div>
      </div>

      <div style={styles.footer}>
        <button style={{ ...styles.btnNext, ":hover": { opacity: 0.9 } }} onClick={handleNext}>
          Next: Add Lessons
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}

/* ─── Step 2 — Lesson Builder ─────────────────────────────── */
function LessonBuilder({ courseData, onBack }) {
  const [tab, setTab] = useState("video");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonModule, setLessonModule] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");

  return (
    <>
      {/* Upload Card */}
      <div style={{ ...styles.card, marginBottom: 20 }}>
        <div style={styles.cardTitle}>Add Lessons</div>
        <div style={styles.cardSubtitle}>Adding lessons to: <strong style={{ color: "#1f5c10" }}>{courseData.name}</strong></div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255, 255, 255, 0.55)", borderRadius: 10, padding: 4, width: "fit-content", marginBottom: 24 }}>
          {["video", "article", "document"].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, transition: ".2s",
              background: tab === t ? "#aedc9f" : "transparent",
              color: tab === t ? "#1a2e0f" : "#4a6830",
              fontFamily: "inherit",
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Lesson Fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={styles.fgroup}>
            <label style={styles.label}>Content Title</label>
            <input style={styles.input} placeholder={`Enter ${tab} title`} value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
          </div>
          <div style={styles.fgroup}>
            <label style={styles.label}>Module / Week</label>
            <input style={styles.input} placeholder="e.g. Module 1 – Introduction" value={lessonModule} onChange={(e) => setLessonModule(e.target.value)} />
          </div>
        </div>

        <div style={{ ...styles.fgroup, marginBottom: 16 }}>
          <label style={styles.label}>Description</label>
          <textarea style={{ ...styles.input, minHeight: 80, resize: "vertical" }} placeholder="Brief description of this lesson..." value={lessonDesc} onChange={(e) => setLessonDesc(e.target.value)} />
        </div>

        {/* Upload Zone */}
        <div style={{
          border: "1.5px dashed rgba(0, 0, 0, 0.16)", borderRadius: 14, padding: "32px 20px",
          textAlign: "center", cursor: "pointer", color: "#4a6830", fontSize: 13, background: "rgba(255, 255, 255, 0.3)",
        }}>
          <div style={{ width: 44, height: 44, background: "rgba(255, 255, 255, 0.55)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <svg width="22" height="22" fill="none" stroke="#4a6830" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p>Drag and drop or <span style={{ color: "#1f5c10", cursor: "pointer", fontWeight: 600 }}>browse files</span></p>
          <span style={{ fontSize: 11, color: "#2e4a1a", marginTop: 4, display: "block" }}>{UPLOAD_HINTS[tab]}</span>
        </div>

        <div style={{ ...styles.footer, marginTop: 16, justifyContent: "flex-start" }}>
          <button style={{ ...styles.btnBack, padding: "9px 18px", fontSize: 13 }}>+ Add Another</button>
        </div>
      </div>

      {/* Quiz Builder Card */}
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 18, fontFamily: "inherit", fontWeight: 700, color: "#1a2e0f" }}>Quiz Builder</span>
          <button style={styles.btnAdd}>+ New Quiz</button>
        </div>

        <div style={{ border: "1px solid rgba(0, 0, 0, 0.16)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.55)" }}>
                {["Quiz Title", "Course", "Questions", "Submissions", "Avg Score", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "11px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".6px", color: "#4a6830", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {QUIZZES.map((q) => (
                <tr key={q.id} style={{ borderTop: "1px solid rgba(0, 0, 0, 0.16)" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#1a2e0f" }}>{q.title}</td>
                  <td style={{ padding: "12px 16px" }}><span style={styles.tagBlue}>{q.course}</span></td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a2e0f" }}>{q.questions}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a2e0f" }}>{q.submissions}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={q.avgScore >= 80 ? styles.tagGreen : styles.tagOrange}>{q.avgScore}%</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={styles.actionBtn}>Edit</button>
                      <button style={{ ...styles.actionBtn, borderColor: "rgba(220, 38, 38, 0.35)", color: "#dc2626" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.footer}>
          <button style={styles.btnBack} onClick={onBack}>← Back</button>
          <button style={styles.btnNext} onClick={() => alert("Course published!")}>
            Publish Course
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Root Component ──────────────────────────────────────── */
export default function CourseUpload() {
  const [step, setStep] = useState(1);
  const [courseData, setCourseData] = useState(null);

  const handleNext = (data) => { setCourseData(data); setStep(2); };
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

/* ─── Shared Styles ───────────────────────────────────────── */
const styles = {
  card: { background: "#aedc9f", border: "1px solid rgba(0, 0, 0, 0.16)", borderRadius: 14, padding: "28px 28px 24px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: 22, fontFamily: "inherit", fontWeight: 700, color: "#1a2e0f", marginBottom: 6 },
  cardSubtitle: { fontSize: 13, color: "#4a6830", marginBottom: 28 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fgroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: "#4a6830", textTransform: "uppercase", letterSpacing: ".7px" },
  input: {
    background: "rgba(255,255,255,0.55)", border: "1px solid rgba(0, 0, 0, 0.16)", borderRadius: 10,
    color: "#1a2e0f", fontFamily: "'Inter', sans-serif", fontSize: 14,
    padding: "10px 14px", outline: "none", width: "100%", transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputError: { borderColor: "#dc2626" },
  errMsg: { fontSize: 12, color: "#dc2626" },
  footer: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 },
  btnNext: {
    background: "#1f5c10", color: "#fff", border: "none", borderRadius: 10,
    padding: "11px 28px", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 2px 12px rgba(31,92,16,0.3)",
  },
  btnBack: {
    background: "transparent", color: "#4a6830", border: "1px solid rgba(0, 0, 0, 0.16)",
    borderRadius: 10, padding: "11px 20px", fontFamily: "'Inter', sans-serif", fontSize: 14, cursor: "pointer", transition: "all 0.2s",
  },
  btnAdd: {
    background: "#1f5c10", color: "#fff", border: "none", borderRadius: 10,
    padding: "8px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
  },
  actionBtn: {
    padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(0, 0, 0, 0.16)",
    background: "transparent", color: "#4a6830", fontFamily: "'Inter', sans-serif", fontSize: 12, cursor: "pointer", transition: "all 0.2s",
  },
  tagBlue: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(31, 92, 16, 0.14)", color: "#1f5c10" },
  tagGreen: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(31, 92, 16, 0.14)", color: "#1f5c10" },
  tagOrange: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(31, 92, 16, 0.08)", color: "#2d7a1a" },
};

export  { Stepper, CourseDetailsForm, LessonBuilder };