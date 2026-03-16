import { useState, useEffect, useRef } from "react";

export default function AnimatedCounter({ target, suffix = "" }) {
  const [n, setN] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let cur = 0;
    const step = target / (1800 / 16);
    const timer = setInterval(() => {
      cur += step;
      if (cur >= target) { setN(target); clearInterval(timer); }
      else setN(Math.floor(cur));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <span ref={ref} className="stat-number">
      {n.toLocaleString()}{suffix}
    </span>
  );
}
