// localStorage-backed persistence for the calibration state and the
// first-time-completed flag. Mirrors the pattern in
// lib/simulator/sim-prefs.ts.

import { INITIAL_CALIBRATION } from "@/lib/calibration-defaults";
import type { Calibration } from "@/lib/types";

const STATE_KEY = "prepos-calibration-v1";
const COMPLETED_KEY = "prepos-calibration-completed-v1";

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore (storage full / private mode)
  }
}

function remove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function loadCalibration(): Calibration | null {
  const raw = read(STATE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Calibration>;
    return {
      ...INITIAL_CALIBRATION,
      ...parsed,
      // Defensive: weakConcepts must always be an array
      weakConcepts: Array.isArray(parsed.weakConcepts) ? parsed.weakConcepts : []
    };
  } catch {
    return null;
  }
}

export function saveCalibration(calibration: Calibration) {
  write(STATE_KEY, JSON.stringify(calibration));
}

export function isCalibrationCompleted(): boolean {
  return read(COMPLETED_KEY) === "true";
}

export function markCalibrationCompleted() {
  write(COMPLETED_KEY, "true");
}

export function resetCalibration() {
  remove(STATE_KEY);
  remove(COMPLETED_KEY);
}
