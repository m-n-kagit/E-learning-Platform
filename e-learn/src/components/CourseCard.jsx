import { useDispatch, useSelector } from "react-redux";

export default function CourseCard({ c, showBtn }) {
  const dispatch = useDispatch();
  const enrolledCourses = useSelector((state) => state.enrolledCourses);

  return (
    <div className="sd-ccard">
      <div className="sd-ccard-thumb" style={{ background: `linear-gradient(135deg, ${c.color}33, ${c.color}11)` }}>
        <span style={{ fontSize: 36 }}>📖</span>
        <span className="sd-ccard-cat" style={{ background: c.color }}>{c.category}</span>
      </div>
      <div className="sd-ccard-body">
        <p className="sd-ccard-name">{c.name}</p>
        <span className="sd-ccard-inst">{c.instructor}</span>
        <div className="sd-pbar" style={{ margin: "10px 0 4px" }}>
          <div className="sd-pbar-fill" style={{ width: c.progress + "%", background: c.color }} />
        </div>
        <div className="sd-ccard-foot">
          <span className="sd-prog-inst">{c.completed}/{c.total} lessons · {c.progress}%</span>
          {showBtn && <button className="sd-cont-btn" style={{ borderColor: c.color, color: c.color }}>Continue</button>}
        </div>
      </div>
    </div>
  );
}