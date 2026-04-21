export default function CourseCard({ c, showBtn }) {
  const courseName = c?.name || c?.title || "Untitled Course";
  const instructorName =
    c?.instructorName ||
    c?.instructor?.name ||
    c?.instructor?.email ||
    (typeof c?.instructor === "string" ? c.instructor : "Course Admin");
  const category = c?.category || "General";
  const accentColor = c?.color || "#5468ff";
  const progress = Number(c?.progress || 0);
  const completed = Number(c?.completed || 0);
  const total = Number(c?.total || c?.lessons?.length || 0);

  return (
    <div className="sd-ccard">
      <div className="sd-ccard-thumb" style={{ background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)` }}>
        <span style={{ fontSize: 36 }}>Course</span>
        <span className="sd-ccard-cat" style={{ background: accentColor }}>{category}</span>
      </div>
      <div className="sd-ccard-body">
        <p className="sd-ccard-name">{courseName}</p>
        <span className="sd-ccard-inst">{instructorName}</span>
        <div className="sd-pbar" style={{ margin: "10px 0 4px" }}>
          <div className="sd-pbar-fill" style={{ width: `${progress}%`, background: accentColor }} />
        </div>
        <div className="sd-ccard-foot">
          <span className="sd-prog-inst">{completed}/{total} lessons · {progress}%</span>
          {showBtn && <button className="sd-cont-btn" style={{ borderColor: accentColor, color: accentColor }}>Continue</button>}
        </div>
      </div>
    </div>
  );
}
