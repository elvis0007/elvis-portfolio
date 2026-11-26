"use client";
import { useSyncExternalStore } from "react";

export type DeviceTier = "low" | "mid" | "high";

function detect(): DeviceTier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const small = window.matchMedia("(max-width: 767px)").matches;
  if (cores <= 4 || memory <= 2) return "low";
  if (small || cores <= 6) return "mid";
  return "high";
}

/** Nivel aproximado del dispositivo para escalar partículas, DPR y efectos 3D. */
export function useDeviceTier(): DeviceTier {
  return useSyncExternalStore(
    () => () => {},
    detect,
    () => "mid",
  );
}
