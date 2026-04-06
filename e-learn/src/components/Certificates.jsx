export default function Certificates() {
  return (
    <div className="sd-page">
      <h1 className="sd-h1">My Certificates</h1>
      <div className="sd-cert-grid">
        {STUDENT.courses.filter((c) => c.progress >= 90).map((c) => (
          <div className="sd-cert-card" key={c.id}>
            <div className="sd-cert-banner" style={{ background: `linear-gradient(135deg, ${c.color}55, ${c.color}22)` }}>
              <span style={{ fontSize: 40 }}>🎓</span>
            </div>
            <div className="sd-cert-body">
              <p className="sd-prog-name">{c.name}</p>
              <span className="sd-prog-inst">Issued · {STUDENT.joinDate}</span>
              <button className="sd-dl-btn" style={{ borderColor: c.color, color: c.color }}>Download PDF</button>
            </div>
          </div>
        ))}
        {STUDENT.courses.filter((c) => c.progress < 90).map((c) => (
          <div className="sd-cert-card locked" key={c.id}>
            <div className="sd-cert-banner" style={{ background: "#ffffff08" }}>
              <span style={{ fontSize: 40 }}>🔒</span>
            </div>
            <div className="sd-cert-body">
              <p className="sd-prog-name">{c.name}</p>
              <span className="sd-prog-inst">Complete course to unlock</span>
              <div className="sd-pbar" style={{ marginTop: 10 }}>
                <div className="sd-pbar-fill" style={{ width: c.progress + "%", background: c.color }} />
              </div>
              <span style={{ fontSize: 12, color: "#666" }}>{c.progress}% complete</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}