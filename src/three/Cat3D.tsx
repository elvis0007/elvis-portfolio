"use client";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Mood } from "@/guide/GuideProvider";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { BRAND } from "./palette";

/**
 * BLUE: gato blanco modelado con primitivas y material toon.
 * Anima respiración, cola, parpadeo, orejas, mirada hacia el cursor y estados de ánimo
 * (saltar al recoger un ovillo, botar de alegría, hablar, mirar hacia la pista).
 */

const WHITE = "#F6F3F4";
const PINK = BRAND.pink;
const DARK = "#141414";
const RED = "#FF2E63"; // collar rojo (diseño Neon Noir)
const BLUE = "#00E5FF"; // ojos azules brillantes

function useToonGradient() {
  const tex = useMemo(() => {
    const data = new Uint8Array([90, 170, 255]);
    const t = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

export interface CatProps {
  mood: Mood;
  /** -1 mira hacia arriba (pista arriba), 1 hacia abajo, 0 sigue al cursor */
  look: -1 | 0 | 1;
  animate: boolean;
}

export function Cat({ mood, look, animate }: CatProps) {
  const gradientMap = useToonGradient();
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const earL = useRef<THREE.Group>(null);
  const earR = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const tail = useRef<(THREE.Mesh | null)[]>([]);
  // Mirada: dirección del cursor relativa a la posición del gato en pantalla (no al canvas pequeño).
  const gaze = useRef({ x: 0, y: 0 });
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.35;
      gaze.current.x = THREE.MathUtils.clamp((e.clientX - cx) / (window.innerWidth * 0.5), -1, 1);
      gaze.current.y = THREE.MathUtils.clamp(-(e.clientY - cy) / (window.innerHeight * 0.5), -1, 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl]);
  const state = useRef({ blinkAt: 2, blinkEnd: 0, twitchAt: 3, twitchEnd: 0, moodStart: 0, lastMood: mood as Mood });

  const white = <meshToonMaterial color={WHITE} gradientMap={gradientMap} />;
  const pink = <meshToonMaterial color={PINK} gradientMap={gradientMap} />;
  const dark = <meshToonMaterial color={DARK} gradientMap={gradientMap} />;

  const TAIL_SEGMENTS = 16;
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const pointer = gaze.current;
    const t = clock.elapsedTime;
    const s = state.current;
    if (s.lastMood !== mood) {
      s.lastMood = mood;
      s.moodStart = t;
    }
    const sinceMood = t - s.moodStart;

    // Mirada: sigue al cursor o apunta hacia la pista.
    if (head.current) {
      const targetY = look === 0 ? pointer.x * 0.6 : 0;
      const targetX = look === -1 ? -0.45 : look === 1 ? 0.4 : -pointer.y * 0.3;
      const talkBob = mood === "talk" && animate ? Math.sin(t * 14) * 0.05 : 0;
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, targetY, 0.08);
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, targetX + talkBob, 0.08);
      head.current.rotation.z = THREE.MathUtils.lerp(head.current.rotation.z, mood === "happy" ? Math.sin(t * 6) * 0.12 : 0, 0.1);
    }
    if (!animate) return;

    // Respiración
    if (body.current) body.current.scale.y = 1 + Math.sin(t * 2.2) * 0.018;

    // Saltos y botes según el ánimo
    if (root.current) {
      let y = 0;
      let spin = 0;
      if (mood === "jump" && sinceMood < 1) {
        const p = sinceMood / 1;
        y = Math.sin(p * Math.PI) * 0.55;
        spin = p * Math.PI * 2;
      } else if (mood === "happy") {
        y = Math.abs(Math.sin(t * 6)) * 0.18;
      }
      root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, y, 0.35);
      root.current.rotation.y = mood === "jump" && sinceMood < 1 ? spin : THREE.MathUtils.lerp(root.current.rotation.y, 0, 0.1);
    }

    // Cola: onda que se propaga de la base a la punta
    const wagSpeed = mood === "happy" || mood === "jump" ? 7 : 2.4;
    tail.current.forEach((seg, i) => {
      if (!seg) return;
      const k = i / (TAIL_SEGMENTS - 1);
      // Curva en "S": sale de la base trasera y sube con la punta curvada
      tmp.set(0.5 + Math.sin(k * 1.6) * 0.45, -0.95 + k * 1.35, -0.5 - Math.sin(k * Math.PI) * 0.12);
      tmp.x += Math.sin(t * wagSpeed - i * 0.35) * 0.18 * k;
      tmp.z += Math.cos(t * wagSpeed - i * 0.35) * 0.06 * k;
      seg.position.copy(tmp);
    });

    // Parpadeo
    if (t > s.blinkAt) {
      s.blinkEnd = t + 0.13;
      s.blinkAt = t + 2.5 + Math.random() * 3;
    }
    if (eyes.current) {
      const closed = t < s.blinkEnd || mood === "sleep";
      const happyEyes = mood === "jump";
      eyes.current.scale.y = THREE.MathUtils.lerp(eyes.current.scale.y, closed ? 0.1 : happyEyes ? 0.45 : 1, 0.5);
    }

    // Orejas que se mueven de vez en cuando
    if (t > s.twitchAt) {
      s.twitchEnd = t + 0.25;
      s.twitchAt = t + 3 + Math.random() * 4;
    }
    const tw = t < s.twitchEnd ? Math.sin((s.twitchEnd - t) * 40) * 0.25 : 0;
    if (earL.current) earL.current.rotation.z = 0.32 + tw;
    if (earR.current) earR.current.rotation.z = -0.32 + (mood === "happy" ? Math.sin(t * 6) * 0.1 : 0);
  });

  return (
    <group ref={root}>
      {/* Sombra */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.24, 0]}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} />
      </mesh>

      <group ref={body}>
        {/* Cuerpo sentado (forma de pera) */}
        <mesh position={[0, -0.55, 0]} scale={[1, 0.85, 0.9]}>
          <sphereGeometry args={[0.85, 48, 48]} />
          {white}
        </mesh>
        <mesh position={[0, 0.05, 0.05]} scale={[0.8, 0.9, 0.8]}>
          <sphereGeometry args={[0.6, 40, 40]} />
          {white}
        </mesh>
        {/* Panza rosada */}
        <mesh position={[0, -0.45, 0.6]} scale={[0.55, 0.65, 0.25]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshToonMaterial color="#FCE9F0" gradientMap={gradientMap} />
        </mesh>
        {/* Patas delanteras */}
        {[-0.28, 0.28].map((x) => (
          <mesh key={x} position={[x, -1.12, 0.55]} scale={[1, 0.55, 1.35]}>
            <sphereGeometry args={[0.2, 24, 24]} />
            {white}
          </mesh>
        ))}
        {/* Collar rojo con cascabel dorado */}
        <mesh position={[0, 0.42, 0.02]} rotation-x={Math.PI / 2 - 0.15}>
          <torusGeometry args={[0.43, 0.06, 16, 48]} />
          <meshToonMaterial color={RED} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 0.3, 0.46]}>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshBasicMaterial color={BLUE} />
        </mesh>
        {/* Cola */}
        {Array.from({ length: TAIL_SEGMENTS }).map((_, i) => (
          <mesh key={i} ref={(m) => void (tail.current[i] = m)} position={[0.6, -0.8, -0.55]}>
            <sphereGeometry args={[0.15 - i * 0.004, 16, 16]} />
            {i >= TAIL_SEGMENTS - 2 ? pink : white}
          </mesh>
        ))}
      </group>

      {/* Cabeza */}
      <group ref={head} position={[0, 0.95, 0.05]}>
        <mesh scale={[1.12, 0.95, 0.95]}>
          <sphereGeometry args={[0.6, 48, 48]} />
          {white}
        </mesh>
        {/* Mejillas */}
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, -0.16, 0.42]} scale={[1, 0.8, 0.7]}>
            <sphereGeometry args={[0.2, 24, 24]} />
            {white}
          </mesh>
        ))}
        {/* Orejas */}
        <group ref={earL} position={[-0.36, 0.42, 0]} rotation-z={0.32}>
          <mesh>
            <coneGeometry args={[0.2, 0.42, 24]} />
            {white}
          </mesh>
          <mesh position={[0, -0.03, 0.08]} scale={[0.6, 0.7, 0.4]}>
            <coneGeometry args={[0.2, 0.42, 24]} />
            {pink}
          </mesh>
        </group>
        <group ref={earR} position={[0.36, 0.42, 0]} rotation-z={-0.32}>
          <mesh>
            <coneGeometry args={[0.2, 0.42, 24]} />
            {white}
          </mesh>
          <mesh position={[0, -0.03, 0.08]} scale={[0.6, 0.7, 0.4]}>
            <coneGeometry args={[0.2, 0.42, 24]} />
            {pink}
          </mesh>
        </group>
        {/* Ojos */}
        <group ref={eyes} position={[0, 0.04, 0]}>
          {[-0.21, 0.21].map((x) => (
            <group key={x} position={[x, 0, 0.53]}>
              {/* Iris azul */}
              <mesh scale={[0.85, 1.15, 0.6]}>
                <sphereGeometry args={[0.1, 24, 24]} />
                <meshBasicMaterial color={BLUE} />
              </mesh>
              {/* Pupila rasgada de gato */}
              <mesh position={[0, 0, 0.045]} scale={[0.32, 1, 0.4]}>
                <sphereGeometry args={[0.075, 20, 20]} />
                {dark}
              </mesh>
              <mesh position={[0.03, 0.045, 0.065]}>
                <sphereGeometry args={[0.03, 12, 12]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>
        {/* Nariz y rubor */}
        <mesh position={[0, -0.1, 0.585]} scale={[1.3, 0.9, 0.8]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          {pink}
        </mesh>
        {[-0.34, 0.34].map((x) => (
          <mesh key={x} position={[x, -0.12, 0.515]} rotation-y={x > 0 ? 0.55 : -0.55}>
            <circleGeometry args={[0.08, 24]} />
            <meshBasicMaterial color={PINK} transparent opacity={0.55} />
          </mesh>
        ))}
        {/* Boca */}
        {[-1, 1].map((side) => (
          <mesh key={`m${side}`} position={[side * 0.035, -0.17, 0.565]} rotation={[0, 0, side * 0.5]}>
            <torusGeometry args={[0.032, 0.007, 8, 16, Math.PI]} />
            <meshBasicMaterial color="#6b4b55" />
          </mesh>
        ))}
        {/* Bigotes */}
        {[-1, 1].map((side) =>
          [-0.06, 0.02].map((dy, j) => (
            <mesh key={`${side}${j}`} position={[side * 0.46, -0.14 + dy, 0.48]} rotation={[0, 0, side * (j === 0 ? -0.12 : 0.1)]}>
              <boxGeometry args={[0.32, 0.008, 0.008]} />
              <meshBasicMaterial color="#d4d4d8" />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}

export default function Cat3D({ mood, look, framing = "full" }: { mood: Mood; look: -1 | 0 | 1; framing?: "full" | "bust" }) {
  const reduced = usePrefersReducedMotion();
  const bust = framing === "bust";
  return (
    <Canvas
      dpr={[1, 2]}
      camera={bust ? { position: [0, 0.1, 3.1], fov: 34 } : { position: [0, 0.35, 6], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      frameloop={reduced ? "demand" : "always"}
      aria-hidden
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <pointLight position={[-3, 1, -2]} intensity={18} color={BRAND.pinkAccent} />
      <group position={bust ? [0, -0.62, 0] : [0, 0, 0]}>
        <Cat mood={mood} look={look} animate={!reduced} />
      </group>
    </Canvas>
  );
}
