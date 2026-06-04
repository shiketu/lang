// A scheduling record that makes any produced artifact resurface for review
// on a spaced-repetition (SM-2) cadence.
export type ReviewKind =
  | "entry" // recall an accumulated expression/sentence (refId = entry id)
  | "practice" // re-produce an expression, LLM-graded (refId = entry id)
  | "video" // re-watch / re-record a past self-output (refId = recording id)
  | "shadowing"; // re-practice a shadowing clip segment (refId = shadowing target id)

export interface Reviewable {
  kind: ReviewKind;
  refId: string;
  ease: number;
  intervalDays: number;
  repetitions: number;
  due: string; // YYYY-MM-DD
  lastReviewed?: string;
  created: string;
}
