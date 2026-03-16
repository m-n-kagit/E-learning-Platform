import AnimatedCounter from "./AnimatedCounter";

const stats = [
  { icon: "🎓", target: 52000, suffix: "+", label: "Students Enrolled"  },
  { icon: "📚", target: 1200,  suffix: "+", label: "Total Materials"     },
  { icon: "🏆", target: 340,   suffix: "+", label: "Expert Instructors"  },
  { icon: "⭐", target: 98,    suffix: "%",  label: "Satisfaction Rate"  },
];

export default function StatsSection() {
  return (
    <section className="stats-section">
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{s.icon}</div>
            <AnimatedCounter target={s.target} suffix={s.suffix} />
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
