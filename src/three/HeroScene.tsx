"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { heroScroll } from "@/animations/gsap";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { BRAND } from "./palette";

/** Generador determinista (mismas partículas en cada render, sin Math.random en el render). */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Partículas en un cascarón esférico con rotación lenta. */
function ParticleField({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const rnd = seeded(7);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.2 + rnd() * 6;
      const theta = rnd() * Math.PI * 2;
      const phi = Math.acos(2 * rnd() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      positions[i * 3 + 2] = r * Math.cos(phi) - 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.02;
    ref.current.rotation.x += dt * 0.005;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.035} color={BRAND.pinkSoft} transparent opacity={0.75} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/** Núcleo digital: esfera líquida rosa, cáscara geodésica, anillos orbitales y satélites. */
function DigitalCore({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const satellites = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isNarrow = viewport.width < 7;

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const p = heroScroll.progress;
    const { x, y } = state.pointer;

    // Reacción al cursor (suavizada) + desplazamiento ligado al scroll.
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, x * 0.55 + p * 1.6, 0.06);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -y * 0.35 + p * 0.4, 0.06);
    const baseX = isNarrow ? 0 : 1.9;
    g.position.x = THREE.MathUtils.lerp(g.position.x, baseX + p * (isNarrow ? 0 : 1.2), 0.08);
    g.position.y = THREE.MathUtils.lerp(g.position.y, (isNarrow ? 1.55 : 0) - p * 1.6, 0.08);
    const s = (isNarrow ? 0.56 : 1) * (1 - p * 0.35);
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, s, 0.08));

    if (!animate) return;
    if (shell.current) {
      shell.current.rotation.y -= dt * 0.12;
      shell.current.rotation.z += dt * 0.05;
    }
    if (ringA.current) ringA.current.rotation.z = t * 0.35;
    if (ringB.current) {
      ringB.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.4) * 0.15;
      ringB.current.rotation.y = t * 0.25;
    }
    if (satellites.current) satellites.current.rotation.y = t * 0.6;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1, 24]} />
        <MeshDistortMaterial
          color={BRAND.pink}
          emissive={BRAND.pinkAccent}
          emissiveIntensity={0.18}
          roughness={0.18}
          metalness={0.35}
          distort={animate ? 0.38 : 0.2}
          speed={animate ? 1.8 : 0}
        />
      </mesh>

      <mesh ref={shell} scale={1.55}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={BRAND.pinkSoft} wireframe transparent opacity={0.22} />
      </mesh>

      <mesh ref={ringA} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[2.05, 0.012, 16, 160]} />
        <meshStandardMaterial color={BRAND.pinkAccent} emissive={BRAND.pinkAccent} emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={ringB}>
        <torusGeometry args={[2.45, 0.008, 16, 160]} />
        <meshStandardMaterial color={BRAND.snow} emissive={BRAND.pinkSoft} emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>

      <group ref={satellites} rotation={[0.35, 0, 0.2]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 2.05, 0, Math.sin(a) * 2.05]}>
              <sphereGeometry args={[0.07 + i * 0.015, 24, 24]} />
              <meshStandardMaterial color={BRAND.snow} emissive={BRAND.pink} emissiveIntensity={1.4} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

const SHAPES = [
  { pos: [-4.2, 1.8, -2], type: "octa", scale: 0.45, speed: 1.6 },
  { pos: [-3.1, -1.9, -1], type: "torus", scale: 0.35, speed: 1.2 },
  { pos: [4.8, 2.3, -3], type: "box", scale: 0.35, speed: 1.4 },
  { pos: [5.1, -2.1, -1.5], type: "sphere", scale: 0.25, speed: 2 },
  { pos: [-1.2, 2.8, -4], type: "tetra", scale: 0.4, speed: 1.1 },
  { pos: [0.6, -2.9, -2.5], type: "torus", scale: 0.22, speed: 1.8 },
] as const;

/** Geometría flotante negra con brillo rosa: profundidad y parallax. */
function FloatingShapes({ animate }: { animate: boolean }) {
  const parallax = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!parallax.current) return;
    parallax.current.position.x = THREE.MathUtils.lerp(parallax.current.position.x, -state.pointer.x * 0.5, 0.04);
    parallax.current.position.y = THREE.MathUtils.lerp(parallax.current.position.y, -state.pointer.y * 0.3 + heroScroll.progress * 2.2, 0.06);
  });

  return (
    <group ref={parallax}>
      {SHAPES.map((s, i) => (
        <Float key={i} speed={animate ? s.speed : 0} rotationIntensity={animate ? 1.2 : 0} floatIntensity={animate ? 1.4 : 0}>
          <mesh position={s.pos as unknown as THREE.Vector3Tuple} scale={s.scale}>
            {s.type === "octa" && <octahedronGeometry args={[1, 0]} />}
            {s.type === "torus" && <torusGeometry args={[1, 0.36, 24, 64]} />}
            {s.type === "box" && <boxGeometry args={[1.2, 1.2, 1.2]} />}
            {s.type === "sphere" && <sphereGeometry args={[1, 32, 32]} />}
            {s.type === "tetra" && <tetrahedronGeometry args={[1, 0]} />}
            <meshStandardMaterial color={i % 2 ? BRAND.ink2 : BRAND.ink} metalness={0.9} roughness={0.22} emissive={BRAND.pinkAccent} emissiveIntensity={0.06} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/** Luces que siguen suavemente al cursor (iluminación dinámica). */
function Lights() {
  const key = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (!key.current) return;
    key.current.position.x = THREE.MathUtils.lerp(key.current.position.x, state.pointer.x * 5, 0.05);
    key.current.position.y = THREE.MathUtils.lerp(key.current.position.y, state.pointer.y * 4 + 2, 0.05);
  });
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight ref={key} position={[3, 3, 4]} intensity={40} color={BRAND.pinkSoft} distance={20} />
      <pointLight position={[-5, -2, 2]} intensity={25} color={BRAND.pinkAccent} distance={18} />
      <directionalLight position={[0, 5, -5]} intensity={1.2} color={BRAND.snow} />
    </>
  );
}

export default function HeroScene() {
  const tier = useDeviceTier();
  const reduced = usePrefersReducedMotion();
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [dpr, setDpr] = useState(tier === "high" ? 1.75 : 1.25);

  // Detiene el render cuando el hero no está en pantalla (ahorro de GPU/batería).
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const particles = tier === "high" ? 1800 : tier === "mid" ? 900 : 450;

  return (
    <div ref={wrapper} className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={dpr}
        frameloop={visible ? (reduced ? "demand" : "always") : "never"}
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: tier !== "low", alpha: true, powerPreference: "high-performance" }}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(tier === "high" ? 1.75 : 1.25)} />
        <fog attach="fog" args={[BRAND.ink, 7, 16]} />
        <Lights />
        <DigitalCore animate={!reduced} />
        {tier !== "low" && <FloatingShapes animate={!reduced} />}
        <ParticleField count={particles} />
      </Canvas>
    </div>
  );
}
