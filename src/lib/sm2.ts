import { addDays } from "./today";

// SM-2 spaced-repetition scheduling (Anki-style ease factor).
// See https://super-memory.com/english/ol/sm2.htm

export interface SM2State {
  ease: number; // ease factor, >= 1.3
  intervalDays: number; // current interval in days
  repetitions: number; // number of consecutive successful reviews
}

export const SM2_DEFAULT: SM2State = {
  ease: 2.5,
  intervalDays: 0,
  repetitions: 0,
};

/** Quality grades the UI offers, mapped to SM-2's 0..5 scale. */
export const SM2_GRADES = {
  again: 2, // もう一度
  hard: 3, // 難しい
  good: 4, // 普通
  easy: 5, // 簡単
} as const;

export type SM2Grade = keyof typeof SM2_GRADES;

/**
 * Applies one SM-2 review. `quality` is 0..5 (>= 3 counts as a pass).
 * Returns the next state plus the next due date (computed from `today`).
 */
export function applySM2(
  state: SM2State,
  quality: number,
  today: string
): SM2State & { due: string } {
  let { ease, intervalDays, repetitions } = state;

  if (quality < 3) {
    // Lapse: restart the interval but keep refining ease below.
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * ease);
    repetitions += 1;
  }

  // Ease update (clamped at 1.3).
  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease < 1.3) ease = 1.3;

  return { ease, intervalDays, repetitions, due: addDays(today, intervalDays) };
}
