"use client";
import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/** Tarjeta con inclinación 3D y brillo que siguen al cursor. */
export function TiltCard({
  children,
  className,
  intensity = 10,
  glare = true,
  ...rest
}: { children: React.ReactNode; className?: string; intensity?: number; glare?: boolean } & Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart">) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [intensity, -intensity]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-intensity, intensity]), { stiffness: 200, damping: 20 });
  const gx = useTransform(mx, (v) => `${v * 100}%`);
  const gy = useTransform(my, (v) => `${v * 100}%`);
  const background = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, rgb(244 182 204 / 0.16), transparent 45%)`;

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900, transformStyle: "preserve-3d" }}
      className={cn("relative will-change-transform", className)}
      {...rest}
    >
      {children}
      {glare && <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background }} />}
    </motion.div>
  );
}
