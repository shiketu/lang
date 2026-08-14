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
    shadowing: "Shadowing",
    video: "Recording",
    lakehouse: "Library",
    practice: "Practice",
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
    video: {
      title: "Recording",
      desc: "Record yourself speaking English to check your pronunciation and delivery.",
    },
    review: {
      title: "Today's review",
      desc: "Following the forgetting curve, revisit your accumulated expressions, practice, and recordings at the optimal time.",
    },
    shadowing: {
      title: "Shadowing",
      desc: "Clip a segment from a model video, practice it repeatedly, and compare your recording side by side to polish your pronunciation.",
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
    theme: "Topic: {t}",
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
    shadowing: {
      title: "Shadowing comparison",
      desc: "Practice a model segment repeatedly and compare it side by side with your own speech.",
      time: "~15 min",
    },
    selftalk: {
      title: "Solo output",
      desc: "Keep talking on a topic, record it, and reflect on your own words.",
      time: "~5 min",
    },
    notes: {
      title: "Import today's insights",
      desc: "Paste the notes you took and let AI extract expressions into your library.",
      time: "~5 min",
    },
    themes: [
      "Recent worries",
      "Weekend plans",
      "Favorite food",
      "Today's news",
      "Future dreams",
      "Something you watched recently",
      "Work / study",
      "Your hobbies",
    ],
  },
  heatmap: {
    title: "Activity",
    less: "Less",
    more: "More",
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
  video: {
    recordHeading: "Record",
    cameraOff: "Camera off",
    recording: "Recording",
    startCamera: "Start camera",
    startRecording: "Start recording",
    stopRecording: "Stop recording",
    save: "Save",
    discard: "Discard",
    saving: "Saving...",
    topicPlaceholder: "Topic (optional)",
    category: "Category",
    newCategoryPlaceholder: "New category name (optional)",
    listHeading: "Recordings",
    noRecordings: "No recordings yet.",
    all: "All",
    uncategorized: "Uncategorized",
    untitled: "Untitled",
    cameraDenied: "Camera access was denied.",
    saveFailed: "Failed to save.",
    deleteTitle: "Delete this recording?",
    deleteMsg: "The video will be permanently deleted and cannot be recovered.",
  },
  shadowing: {
    newClip: "New clip",
    noClips: "No clips yet. Cut a segment out of a model video.",
    deleteClipTitle: "Delete this clip?",
    deleteClipMsg: "The segment and all of its practice recordings will be deleted.",
    // --- video grouping ---
    newVideo: "New video",
    addSegment: "Add a segment",
    videoCount: "{n} segments",
    backToVideos: "All videos",
    segmentsHeading: "Segments",
    untitledVideo: "Untitled video",
    deleteVideoTitle: "Delete this video?",
    deleteVideoMsg: "All segments and practice recordings for this video will be deleted.",
    createTitle: "Create a clip",
    cancel: "Cancel",
    urlPlaceholder: "Paste a YouTube URL",
    load: "Load",
    invalidUrl: "Please enter a valid YouTube URL.",
    endAfterStart: "Set the end after the start.",
    saveFailed: "Failed to save.",
    segment: "Practice segment",
    setIn: "Set start to current time",
    setOut: "Set end to current time",
    startLabel: "Start {t}",
    endLabel: "End {t}",
    playFromStart: "Play from segment start",
    titlePlaceholder: "Title (e.g. business greeting phrases)",
    categoryPlaceholder: "Category (optional)",
    saving: "Saving...",
    saveClip: "Save clip",
    back: "Back to list",
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
    // --- clip workspace tabs ---
    tabShadow: "Shadowing",
    tabRepeat: "Repeat practice",
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
