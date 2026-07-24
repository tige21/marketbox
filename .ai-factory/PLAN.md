# Fix: uploaded video covers not shown on course lessons (Kinescope poster override)

**Branch:** main (fast plan, no branch)
**Created:** 2026-07-24
**Type:** Bugfix (UI / rendering)

## Settings

- **Testing:** No (components have no existing coverage; verify via `tsc -b` + `build` + manual check in Telegram)
- **Logging:** Standard — no new runtime logging needed (pure render change)
- **Docs:** Warn-only, no mandatory checkpoint

## Problem

Uploaded video covers do not appear on course lessons (whole Wildberries course affected). The lesson player shows Kinescope's default poster (grey grid-paper frame + purple play button) instead of the uploaded cover.

## Root Cause (verified)

Every Wildberries lesson has a Kinescope `video_url`. When a Kinescope URL is present, both lesson renderers mount the Kinescope `<iframe>` **directly**, so Kinescope paints its own default poster and the uploaded cover is never used.

- `src/components/LessonCard/LessonCard.tsx:176-184` — `embedSrc ? <iframe> : …`. The card reads only `pickLocale(lesson.image)` (line 116) and renders it only in the `locked` / no-video branches. It has no `video_preview` awareness; `LessonCardLesson` (line 15-21) doesn't declare it.
- `src/features/courses/LessonDetailPage.tsx:134-142` — computes `posterImg = video_preview ?? image` (line 110) but only uses it in the "Видео скоро" fallback; the embed branch still mounts the iframe directly.
- `src/api/types.ts:185` — `BackendCourseLesson` (module lessons) omits `video_preview`, so even when the backend sends it for course lessons, TS callers can't read it.

**Cover source:** backend stores the cover in the dedicated `video_preview` field, with the localized `image` field as a secondary source. Using `video_preview ?? pickLocale(image)` covers both.

## Fix Approach

Replace "mount iframe directly" with a **click-to-play facade** (already proven in `MoneyPage.tsx:196-236`):

1. If a cover exists → render the uploaded cover (`video_preview ?? image`) as a poster button with a centered play icon.
2. On tap → mount the Kinescope iframe with `?autoplay=1` so it starts in one tap (best-effort autoplay in iOS TG WebView; falls back to Kinescope's own play control if the WebView blocks it).
3. If **no** cover exists → keep mounting the iframe directly (current behavior) so Kinescope's own poster shows instead of an empty box. No regression.

The required SCSS already exists: `lesson-card__poster/__play/__thumb/__iframe` (LessonCard.scss) and `lesson-preview__poster/__poster-img/__poster-play/__player/__iframe` (LessonPreviewPage.scss). Minimal or no SCSS additions expected.

## Tasks

### Task 1 — Extend types so `video_preview` reaches course-lesson renderers
- **File:** `src/api/types.ts`
- Add `video_preview?: string | null` to `BackendCourseLesson` (near line 195, mirroring `BackendLesson.video_preview` at line 167).
- Deliverable: module lessons can carry a poster the UI can read.

### Task 2 — Click-to-play facade in `LessonCard`
- **File:** `src/components/LessonCard/LessonCard.tsx` (+ `LessonCard.scss` only if needed)
- Add `video_preview?: string | null` to the `LessonCardLesson` interface.
- Compute `const poster = lesson.video_preview ?? pickLocale(lesson.image, lang)`.
- Add local `const [playing, setPlaying] = useState(false)` (per-card; component is memoised).
- Add a `PlayIcon` SVG (copy from `MoneyPage.tsx:40-46`).
- Rework the `!locked` video branch:
  - `embedSrc && !playing && poster` → `<button class="lesson-card__poster">` with `<BackendImage src={poster} class="lesson-card__thumb"/>` + `<span class="lesson-card__play"><PlayIcon/></span>`; `onClick` fires `triggerHaptic('tap')` then `setPlaying(true)`.
  - `embedSrc && (playing || !poster)` → `<iframe>` using `https://kinescope.io/embed/${kinescopeId}${playing ? '?autoplay=1' : ''}` (autoplay only after tap; direct-embed fallback keeps no-autoplay).
  - Keep `embed_html` and the final `poster`/"Видео скоро" branches unchanged.
- Keep the `locked` branch using the same `poster` value for its thumbnail.
- Deliverable: lesson-list cards show the uploaded cover; one tap plays.

### Task 3 — Same facade in `LessonDetailPage`
- **File:** `src/features/courses/LessonDetailPage.tsx` (styles via `LessonPreviewPage.scss`, block `lesson-preview`)
- Add `const [playing, setPlaying] = useState(false)`.
- Rework the player branch (line 134):
  - `embedSrc && !playing && posterImg` → `<button class="lesson-preview__poster">` with `<BackendImage src={posterImg} class="lesson-preview__poster-img"/>`, `__poster-shade`, and a `__poster-play` play icon; `onClick` → haptic + `setPlaying(true)`.
  - `embedSrc && (playing || !posterImg)` → iframe with `?autoplay=1` appended only when `playing`.
  - Keep `embed_html` and the "Видео скоро" fallback unchanged.
- Reuse existing `__poster-play` SCSS (LessonPreviewPage.scss:133); add a `PlayIcon` SVG if one isn't already defined in the file.
- Deliverable: single-lesson page shows the cover; one tap plays.

### Task 4 — Verify & ship
- `npm run build` (runs `tsc -b` strict + vite build) must pass clean.
- Manual check in Telegram / dev: a Wildberries lesson with a cover shows the uploaded cover + play button; tapping plays; a lesson without a cover still falls back to the Kinescope iframe (no empty box).
- Rebuild graph not required (no new routes/exports; render-logic + one type field).
- Commit + push per project rules (see below).

## Commit Plan

Single commit after Task 4 passes:

```
fix(no-ref): show uploaded video covers as lesson poster (click-to-play facade over Kinescope embed)
```

Then push to `origin/main`.
