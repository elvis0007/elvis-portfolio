"use client";
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-1 bg-surface">
      <motion.div className="h-full origin-left bg-pink" style={{ scaleX }} />
    </div>
  );
}
