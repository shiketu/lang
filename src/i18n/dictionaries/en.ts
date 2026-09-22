import { ja } from "./ja";

// English dictionary — `typeof ja` forces every key to exist (missing key = compile error).
export const en: typeof ja = {
  common: {
    appName: "EnglishPro",
    brandMark: "E",
    searchPlaceholder: "Search words or expressions…",
    confirm: "Confirm",
    cancel: "Cancel",
    deleteAction: "Delete",
    irreversible: "This action cannot be undone.",
    loading: "Loading...",
    close: "Close",
    menu: "Menu",
  },
  nav: {
    menuTitle: "Learning menu",
    dashboard: "Home",
    review: "Today's review",
    study: "Video study",
    practice: "Practice",
    lakehouse: "Library",
  },
  pages: {
    import: {
      title: "Import from notes",
      desc: "Paste your notes (or load a file) and let AI extract expressions into your library.",
    },
    practice: {
      title: "Practice",
      desc: "Look at the meaning of an expression from your library, say it in your own English, then compare with the original to sharpen your skills.",
    },
    study: {
      title: "Video study",
      desc: "Work video by video: cut clips, shadow them, drill them sentence by sentence, then retell it in your own words.",
    },
    review: {
      title: "Today's review",
      desc: "Following the forgetting curve, revisit your accumulated expressions, practice, and recordings at the optimal time.",
    },
  },
  imports: {
    openImport: "Import from notes",
    backToLibrary: "Back to library",
    sourceLabel: "Note content",
    placeholder: "Paste your study notes here (expressions, meanings, observations…)",
    uploadFile: "Load a file (.txt / .md)",
    clear: "Clear",
    charCount: "{n} characters",
    extract: "Extract with AI",
    extracting: "Extracting...",
    extractFailed: "Extraction failed.",
    modalTitle: "Extracted ({n} selected)",
    noCandidates: "No expressions found.",
    import: "Import selected",
    importing: "Importing...",
    importedAlert: "Imported {count} entries into your library.",
    fieldJapanese: "Expression",
    fieldReading: "Reading",
    fieldMeaning: "Meaning",
  },
  home: {
    streakActive: "{n}-day streak",
    startToday: "Start today",
    title: "Let's train your language circuits again today",
    subtitle: "Repetition and consistency are the fastest path. Start today's routine.",
    routineHeading: "Today's routine",
    completed: "Done: {done}/{total}",
    start: "Start",
    begin: "Begin",
    doneBadge: "Done",
    reviewCount: "{n} to review",
    reviewNone: "Nothing due",
    shadowingMetric: "Compare with a model",
    recorded: "Recorded",
    unrecorded: "Not recorded",
  },
  routine: {
    review: {
      title: "Forgetting-curve review",
      desc: "Review your accumulated knowledge at the optimal time, before it fades.",
      time: "~10 min",
    },
    study: {
      title: "Study a video",
      desc: "Drill your clips, then close the loop by retelling the video in your own words on camera.",
      time: "~20 min",
    },
    capture: {
      title: "Import today's insights",
      desc: "Paste the notes you took and let AI extract expressions into your library.",
      time: "~5 min",
    },
  },
  stats: {
    title: "What you've built",
    entries: "Expressions",
    videos: "Videos",
    clips: "Clips",
    recordings: "Recordings",
    reviews: "Reviews done",
    captureCurve: "Expressions over time",
    reviewCurve: "Reviews over time",
    empty: "Start studying and your progress will build up here.",
  },
  entryMeta: {
    type: { vocabulary: "Word", expression: "Expression", sentence: "Sentence" },
    purpose: {
      memorize: "Just memorize",
      ready: "Use as-is",
      pattern: "Pattern / logic",
      frequent: "Frequently used",
    },
    register: {
      business: "Business",
      "casual-business": "Casual business",
      casual: "Casual",
      daily: "Everyday",
    },
  },
  entries: {
    pageTitle: "Library",
    add: "+ Add",
    close: "Close",
    search: "Search…",
    allTags: "All tags",
    count: "{n} items",
    loading: "Loading…",
    empty: "No entries match your filters.",
    addFirst: "Add your first entry",
    jpPlaceholder: "Expression * (e.g. binge-watch)",
    readingPlaceholder: "Reading (optional)",
    meaningPlaceholder: "Meaning *",
    typeLabel: "Type",
    purposeLabel: "Purpose",
    registerLabel: "Register",
    tagPlaceholder: "Tag (scene, topic…) → Enter",
    addTag: "Add",
    addMemo: "+ Add a memo",
    memoPlaceholder: "Memo (Markdown): examples, usage…",
    saving: "Saving...",
    update: "Update",
    create: "Add",
    cancel: "Cancel",
    editTitle: "Edit entry",
    notFound: "Entry not found.",
    edit: "Edit",
    deleteAction: "Delete",
    deleteConfirm: "Delete this entry?",
    created: "Created: {d}",
    updated: "Updated: {d}",
  },
  review: {
    kindEntry: "Expression review",
    kindPractice: "Production review",
    kindVideo: "Recording review",
    kindShadowing: "Shadowing review",
    gradeAgain: "Again",
    gradeHard: "Hard",
    gradeGood: "Good",
    gradeEasy: "Easy",
    emptyTitle: "Nothing to review today",
    doneTitle: "Today's review is done!",
    emptyDesc: "As you accumulate expressions and practice, reviews will appear here.",
    doneDesc: "Nice work. Consistency is the fastest path.",
    backHome: "Back to home",
    recallPrompt: "Say this meaning in English?",
    reveal: "Show answer",
    producePrompt: "Express this meaning in your own words",
    inputPlaceholder: "Type your English expression...",
    aiAnalyze: "AI analysis",
    analyzing: "Analyzing...",
    modelExpr: "Model expression",
    videoPrompt: "Re-watch your past recording and see how you do now",
    untitledVideo: "Untitled recording",
    recordedOn: "Recorded on {date}",
    recordAgain: "Record again",
    shadowingPrompt: "Shadow the model once more",
    practiceAgain: "Practice again",
  },
  practice: {
    filterType: "Filter by type",
    filterTag: "Filter by tag",
    all: "All",
    start: "Start practice",
    loading: "Loading...",
    noEntries: "Your library has no entries yet.",
    addFirst: "Add an entry first",
    prompt: "Express the following meaning in English:",
    hintWord: "Hint: word",
    hintExpr: "Hint: expression",
    inputPlaceholder: "Type your English expression...",
    check: "Check",
    reveal: "Show answer",
    meaning: "Meaning:",
    yourExpr: "Your expression:",
    requestLLM: "Request LLM analysis",
    revealNoAnalysis: "Reveal without analysis",
    analyzing: "Analyzing...",
    original: "Original:",
    next: "Next",
  },
  study: {
    // --- video library ---
    addVideo: "Add a video",
    urlPlaceholder: "Paste a YouTube URL",
    load: "Load",
    invalidUrl: "Please enter a valid YouTube URL.",
    titlePlaceholder: "Title",
    categoryPlaceholder: "Category (optional)",
    saveVideo: "Save video",
    cancel: "Cancel",
    saving: "Saving...",
    saveFailed: "Failed to save.",
    noVideos: "No videos yet. Add a model video to study.",
    clipCount: "{n} clips",
    untitledVideo: "Untitled video",
    deleteVideoTitle: "Delete this video?",
    deleteVideoMsg: "Its clips, captions and recordings will all be deleted.",
    backToVideos: "All videos",
    // --- video page tabs ---
    tabClips: "Clips",
    tabTranscript: "Captions",
    tabRetell: "Retell",
    // --- clips ---
    newClip: "New clip",
    noClips: "No clips yet. Cut out a segment you want to practice.",
    clipTitlePlaceholder: "Clip name (e.g. how to make a request)",
    saveClip: "Save clip",
    segment: "Practice segment",
    setIn: "Set start to current time",
    setOut: "Set end to current time",
    startLabel: "Start {t}",
    endLabel: "End {t}",
    playFromStart: "Play from segment start",
    endAfterStart: "Set the end after the start.",
    deleteClipTitle: "Delete this clip?",
    deleteClipMsg: "The segment and all of its practice recordings will be deleted.",
    backToClips: "All clips",
    // --- clip practice ---
    tabShadow: "Shadowing",
    tabRepeat: "Repeat practice",
    cameraDenied: "Camera access was denied.",
    model: "Model",
    you: "You",
    cameraOff: "Camera off",
    startCamera: "Start camera",
    startRecording: "Start recording (plays the model too)",
    stop: "Stop",
    save: "Save",
    playBoth: "Play both",
    discard: "Discard",
    history: "Practice history",
    noHistory: "No practice yet.",
    deleteAttemptTitle: "Delete this practice recording?",
    // --- repeat practice ---
    watchHint: "Play, then press \"Mark here\" at the end of a sentence",
    playFromHere: "Play from here",
    markHere: "Mark here",
    finishSession: "Finish",
    sentenceLabel: "Current sentence",
    listenAgain: "Listen again",
    speed: "Speed",
    recordSentence: "Record this sentence",
    saveNext: "Save & next",
    retake: "Retake",
    skip: "Skip",
    sessionList: "Sentences this session",
    doneTitle: "You reached the end of the clip!",
    doneCount: "Practiced {n} sentences",
    again: "Start over",
    // --- captions ---
    transcriptHint:
      "Copy from YouTube's \"Show transcript\" panel and paste here. Timestamped lines are picked up automatically.",
    transcriptPlaceholder: "[00:12] text  — or  0:12 with the text on the next line",
    transcriptSave: "Save captions",
    transcriptSaved: "Captions saved",
    transcriptParseFailed: "No timestamped lines found. Check the format.",
    transcriptClear: "Remove captions",
    transcriptCount: "{n} lines",
    noTranscript: "No captions yet.",
    editTranscript: "Paste again",
    selectedLines: "{n} lines selected",
    createClipFromSelection: "Create a clip from selection",
    clearSelection: "Clear selection",
    selectHint: "Click a line to play it; shift-click to select a range.",
    // --- retell ---
    retellHint: "Say what the video was about in your own words, and record it.",
    startRetell: "Record a retell",
    retellHistory: "Retell history",
    noRetells: "No retells yet.",
    topicPlaceholder: "Theme / note (optional)",
  },
  // === LLM prompts (placeholders: {content} / {original} {userInput} {meaning} {context}) ===
  // NOTE: edit these freely — the JSON key must stay "japanese" (it holds the English term),
  // because the parser reads that field.
  prompts: {
    extract: `You are an English learning assistant. Below is a learner's English study note (Markdown).
Extract the English "words / expressions / sentences" that are worth learning.

Output MUST be a JSON array only (no prose). Each element has this shape:
{
  "type": "vocabulary" | "expression" | "sentence",
  "japanese": "the English word or phrase",
  "reading": "pronunciation / IPA (optional)",
  "meaning": "the meaning in Chinese (Simplified)",
  "tags": ["related tags"]
}

Rules:
- type: a single word → vocabulary, an idiom/phrase → expression, a full sentence → sentence
- meaning: concise, in Chinese (Simplified)
- reading: only if helpful, otherwise empty string
- if there is nothing to extract, return []
- output nothing but the JSON

--- Note ---
{content}
--- End ---`,
    compare: `You are an English language teacher. Compare the user's English expression with the native/original expression. Analyze in Chinese (Simplified).

Original (native): {original}
User's attempt: {userInput}
Meaning: {meaning}{context}

Provide analysis in the following format:

## Grammar differences
(Grammar differences between the two expressions)

## Naturalness
(Which sounds more natural and why)

## Nuance
(Nuance differences)

## How to improve
(Specific suggestions to improve the user's expression)

Use a mix of English terms and Chinese explanations to help the learner think in English.`,
  },
};
