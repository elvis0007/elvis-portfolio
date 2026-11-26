"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Mood } from "@/guide/GuideProvider";
import { Cat } from "./Cat3D";
import { BRAND } from "./palette";

/**
 * Escena 3D de "BLUE's Neon Catch". Los objetos caen desde el fondo de la escena hacia el plano
 * de juego (eje Z), BLUE se desplaza sobre una pista de neón y la cámara acompaña su movimiento.
 * Toda la simulación vive en refs dentro de useFrame: React solo se entera de puntos y vidas.
 */

export type Phase = "menu" | "playing" | "paused" | "over";
export type ItemKind = "spark" | "star" | "glitch";

export interface ArcadeControls {
  /** Posición deseada de BLUE en [-1, 1] (ratón/táctil) o null si se usa teclado. */
  pointerX: number | null;
  keys: Set<string>;
}

export interface ArcadeEvents {
  onScore: (score: number, combo: number) => void;
  onLives: (lives: number) => void;
  onOver: (score: number) => void;
}

const POOL = 28;
const BURST = 90;
const RED = "#FF2E63";
const CYAN = "#00E5FF";

interface Item {
  active: boolean;
  kind: ItemKind;
  x: number;
  y: number;
  z: number;
  vy: number;
  vz: number;
  spin: number;
}

interface Particle {
  life: number;
  p: THREE.Vector3;
  v: THREE.Vector3;
  c: THREE.Color;
}

const TMP = new THREE.Object3D();

/** Lanza `n` partículas libres desde (x, y, z). */
function emitBurst(parts: Particle[], rnd: () => number, x: number, y: number, z: number, color: string, n: number) {
  let left = n;
  for (const p of parts) {
    if (left <= 0) break;
    if (p.life > 0) continue;
    const a = rnd() * Math.PI * 2;
    const b = rnd() * Math.PI - Math.PI / 2;
    const sp = 2 + rnd() * 4;
    p.life = 0.5 + rnd() * 0.5;
    p.p.set(x, y, z);
    p.v.set(Math.cos(a) * Math.cos(b) * sp, Math.abs(Math.sin(b)) * sp + 1.5, Math.sin(a) * Math.cos(b) * sp);
    p.c.set(color);
    left--;
  }
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Game({ phaseRef, controls, events, resetKey }: { phaseRef: React.RefObject<Phase>; controls: React.RefObject<ArcadeControls>; events: ArcadeEvents; resetKey: number }) {
  const viewport = useThree((st) => st.viewport);
  const halfW = viewport.width / 2;
  const floorY = -viewport.height / 2 + 0.55;
  const catchY = floorY + 0.95;

  const cat = useRef<THREE.Group>(null);
  const items = useRef<Item[]>(Array.from({ length: POOL }, () => ({ active: false, kind: "spark", x: 0, y: 0, z: 0, vy: 0, vz: 0, spin: 0 })));
  const meshes = useRef<(THREE.Group | null)[]>([]);
  const burst = useRef<THREE.InstancedMesh>(null);
  const parts = useRef<Particle[]>(Array.from({ length: BURST }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), c: new THREE.Color() })));
  const sim = useRef({ x: 0, vx: 0, time: 0, spawn: 0.6, score: 0, combo: 0, lives: 3, hurt: 0, shake: 0, keyMode: false, lastPointer: null as number | null, rnd: seeded(42) });
  const [mood, setMood] = useState<Mood>("idle");
  const moodTimer = useRef<number | undefined>(undefined);
  const ev = useRef(events);
  useEffect(() => {
    ev.current = events;
  });

  // Reinicio de partida
  useEffect(() => {
    const s = sim.current;
    Object.assign(s, { x: 0, vx: 0, time: 0, spawn: 0.6, score: 0, combo: 0, lives: 3, hurt: 0, shake: 0 });
    items.current.forEach((it) => (it.active = false));
    parts.current.forEach((p) => (p.life = 0));
  }, [resetKey]);

  const flash = (m: Mood, ms: number) => {
    window.clearTimeout(moodTimer.current);
    setMood(m);
    moodTimer.current = window.setTimeout(() => setMood("idle"), ms);
  };
  useEffect(() => () => window.clearTimeout(moodTimer.current), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const s = sim.current;
    const phase = phaseRef.current;
    const t = state.clock.elapsedTime;
    const playing = phase === "playing";
    const ctl = controls.current;

    // --- BLUE ---
    const limit = halfW - 0.8;
    if (playing) {
      let target = s.x;
      const kl = ctl.keys.has("arrowleft") || ctl.keys.has("a");
      const kr = ctl.keys.has("arrowright") || ctl.keys.has("d");
      // El teclado manda hasta que el ratón/dedo se vuelva a mover.
      if (ctl.pointerX !== s.lastPointer) {
        s.lastPointer = ctl.pointerX;
        s.keyMode = false;
      }
      if (kl || kr) {
        target = s.x + (kr ? 1 : -1) * 9 * dt;
        s.keyMode = true;
      } else if (ctl.pointerX !== null && !s.keyMode) {
        target = ctl.pointerX * limit;
      }
      const nx = THREE.MathUtils.clamp(THREE.MathUtils.lerp(s.x, target, kl || kr ? 1 : 0.22), -limit, limit);
      s.vx = (nx - s.x) / Math.max(dt, 1e-4);
      s.x = nx;
    } else if (phase === "menu") {
      // Demostración en el menú: BLUE pasea de un lado a otro.
      const nx = Math.sin(t * 0.9) * limit * 0.55;
      s.vx = (nx - s.x) / Math.max(dt, 1e-4);
      s.x = nx;
    } else {
      s.vx *= 0.9;
    }
    if (cat.current) {
      cat.current.position.x = s.x;
      cat.current.rotation.z = THREE.MathUtils.lerp(cat.current.rotation.z, THREE.MathUtils.clamp(-s.vx * 0.025, -0.35, 0.35), 0.15);
      cat.current.rotation.y = THREE.MathUtils.lerp(cat.current.rotation.y, THREE.MathUtils.clamp(s.vx * 0.06, -0.6, 0.6), 0.1);
      const hurtBlink = s.hurt > 0 && Math.floor(s.hurt * 16) % 2 === 0;
      cat.current.visible = !hurtBlink;
    }

    // --- Cámara: sigue a BLUE con un leve paralaje y tiembla al recibir daño ---
    s.shake = Math.max(0, s.shake - dt * 2.5);
    const sh = s.shake * 0.25;
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, s.x * 0.18 + (s.rnd() - 0.5) * sh, 0.08);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, 1.1 + (s.rnd() - 0.5) * sh, 0.08);
    cam.lookAt(s.x * 0.1, -0.3, 0);

    // --- Partida ---
    if (playing) {
      s.time += dt;
      s.hurt = Math.max(0, s.hurt - dt);
      const k = 1 + Math.min(s.time / 45, 1.6);
      s.spawn -= dt;
      if (s.spawn <= 0) {
        const it = items.current.find((i) => !i.active);
        if (it) {
          const r = s.rnd();
          it.kind = r < Math.min(0.18 + s.time / 200, 0.38) ? "glitch" : r > 0.93 ? "star" : "spark";
          it.x = (s.rnd() * 2 - 1) * (limit - 0.2);
          it.z = -7 - s.rnd() * 3;
          it.y = viewport.height / 2 + 1.5 + s.rnd() * 1.5;
          const fall = (it.y - catchY) / ((2.6 + s.rnd() * 0.8) / k);
          it.vy = -fall;
          it.vz = -it.z / ((it.y - catchY) / fall);
          it.spin = (s.rnd() - 0.5) * 6;
          it.active = true;
        }
        s.spawn = Math.max(0.3, 0.95 / k) * (0.6 + s.rnd() * 0.8);
      }
    }

    items.current.forEach((it, i) => {
      const m = meshes.current[i];
      if (!m) return;
      if (!it.active) {
        m.visible = false;
        return;
      }
      if (playing) {
        it.y += it.vy * dt;
        it.z = Math.min(0, it.z + it.vz * dt);
      }
      m.visible = true;
      m.position.set(it.x, it.y, it.z);
      m.rotation.x += it.spin * dt * (playing ? 1 : 0);
      m.rotation.y += 1.4 * dt * (playing ? 1 : 0);
      for (const child of m.children) child.visible = child.name === it.kind;

      if (!playing) return;
      // Atrapado
      if (it.y <= catchY + 0.35 && it.y >= catchY - 0.45 && Math.abs(it.x - s.x) < 0.85) {
        it.active = false;
        if (it.kind === "glitch") {
          if (s.hurt > 0) return;
          s.lives -= 1;
          s.combo = 0;
          s.hurt = 1.1;
          s.shake = 1;
          emitBurst(parts.current, s.rnd, it.x, it.y, 0, RED, 26);
          flash("sleep", 600);
          ev.current.onLives(s.lives);
          ev.current.onScore(s.score, s.combo);
          if (s.lives <= 0) ev.current.onOver(s.score);
        } else {
          s.combo += 1;
          const mult = 1 + Math.floor(s.combo / 5);
          s.score += (it.kind === "star" ? 30 : 10) * mult;
          emitBurst(parts.current, s.rnd, it.x, it.y, 0, it.kind === "star" ? CYAN : BRAND.pink, it.kind === "star" ? 30 : 16);
          flash(it.kind === "star" ? "jump" : "happy", it.kind === "star" ? 1000 : 500);
          ev.current.onScore(s.score, s.combo);
        }
        return;
      }
      // Perdido
      if (it.y < floorY - 1) {
        it.active = false;
        if (it.kind !== "glitch" && s.combo > 0) {
          s.combo = 0;
          ev.current.onScore(s.score, s.combo);
        }
      }
    });

    // --- Partículas ---
    const im = burst.current;
    if (im) {
      parts.current.forEach((p, i) => {
        if (p.life > 0) {
          p.life -= dt;
          p.v.y -= 9 * dt;
          p.p.addScaledVector(p.v, dt);
          TMP.position.copy(p.p);
          TMP.scale.setScalar(Math.max(0, p.life) * 0.16);
        } else {
          TMP.scale.setScalar(0);
        }
        TMP.updateMatrix();
        im.setMatrixAt(i, TMP.matrix);
        im.setColorAt(i, p.c);
      });
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Pista de neón */}
      <group position={[0, floorY, -4]}>
        <gridHelper args={[60, 60, BRAND.pink, "#3a2a31"]} position={[0, 0, 0]} />
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
          <planeGeometry args={[60, 60]} />
          <meshBasicMaterial color={BRAND.ink} transparent opacity={0.55} />
        </mesh>
      </group>
      <mesh position={[0, floorY + 0.005, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[halfW * 2, 0.06]} />
        <meshBasicMaterial color={BRAND.pink} transparent opacity={0.8} />
      </mesh>

      {/* BLUE */}
      <group ref={cat} position={[0, floorY + 0.68, 0]} scale={0.52}>
        <Cat mood={mood} look={0} animate />
      </group>

      {/* Objetos que caen (pool) */}
      {Array.from({ length: POOL }).map((_, i) => (
        <group key={i} ref={(g) => void (meshes.current[i] = g)} visible={false}>
          <group name="spark">
            <mesh>
              <octahedronGeometry args={[0.32, 0]} />
              <meshStandardMaterial color={BRAND.pink} emissive={BRAND.pinkAccent} emissiveIntensity={1.3} roughness={0.25} metalness={0.2} />
            </mesh>
            <mesh scale={1.5}>
              <octahedronGeometry args={[0.32, 0]} />
              <meshBasicMaterial color={BRAND.pinkSoft} wireframe transparent opacity={0.35} />
            </mesh>
          </group>
          <group name="star">
            <mesh>
              <dodecahedronGeometry args={[0.38, 0]} />
              <meshStandardMaterial color="#E9FDFF" emissive={CYAN} emissiveIntensity={1.4} roughness={0.2} />
            </mesh>
            <mesh rotation-x={Math.PI / 2}>
              <torusGeometry args={[0.62, 0.03, 8, 48]} />
              <meshBasicMaterial color={CYAN} />
            </mesh>
          </group>
          <group name="glitch">
            <mesh>
              <boxGeometry args={[0.55, 0.55, 0.55]} />
              <meshStandardMaterial color="#2a0710" emissive={RED} emissiveIntensity={0.9} roughness={0.4} />
            </mesh>
            <mesh scale={1.08}>
              <boxGeometry args={[0.55, 0.55, 0.55]} />
              <meshBasicMaterial color={RED} wireframe />
            </mesh>
          </group>
        </group>
      ))}

      <instancedMesh ref={burst} args={[undefined, undefined, BURST]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  );
}

export default function ArcadeScene(props: { phaseRef: React.RefObject<Phase>; controls: React.RefObject<ArcadeControls>; events: ArcadeEvents; resetKey: number }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 1.1, 10], fov: 45 }} gl={{ antialias: true, alpha: true }} aria-hidden>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 6, 6]} intensity={2} />
      <pointLight position={[-5, 2, 3]} intensity={30} color={BRAND.pinkAccent} distance={20} />
      <pointLight position={[5, 1, 2]} intensity={20} color={CYAN} distance={16} />
      <fog attach="fog" args={[BRAND.ink, 12, 26]} />
      <Game {...props} />
    </Canvas>
  );
}
