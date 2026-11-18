# Alphabet Adventure

A static, touch-friendly letter practice site for GitHub Pages. The published site is https://ramansohi1.github.io/alphabet-adventure/.

## Practice

- Trace teaches ordered strokes; Watch animates and narrates all 52 print forms using sky, plane, grass and worm lines.
- Pencil captures real ink anywhere on the paper, allowing different positions, sizes and stroke orders. After three seconds of stillness it compares the shape with all 26 letters in the chosen case, independent of the prompt. A reward needs a clear best candidate plus coverage, precision, component and length checks.
- A likely unfinished letter remains writable. A clearly different letter pauses for New page. Uncertain work receives a gentle suggestion and no success reward. No glowing preset-point corrections in Pencil.
- Sixteen drawn gestures or an excessive path length pauses the page for explicit repair; work is not silently erased. Taps do not earn progress.
- Two or three bundled picture examples per letter can be tapped without resetting writing. Pictures use device emoji, not a live image API.
- Reward appears 900ms after recognition, and the child chooses when to continue.
- Parent charts separate Trace and Pencil observations and show recognition outcomes. Version-4 Pencil summaries exclude incompatible older records from current charts, without deleting saved stickers.

## Recognition limits

This is a geometric exemplar classifier, not trained OCR or a validated assessment of child handwriting. Python independently samples the authored print paths into compact browser data; JavaScript derives six bounded width variants. The candidate ranking ignores stroke order and normalizes position and uniform scale, but does not rotate or mirror. Alternative handwriting styles, interrupted strokes and confusable forms can still produce false rejections or accepts. Synthetic tests are not evidence of accuracy on real children's handwriting. Real-device trials and diverse, consented handwriting examples are needed before claiming school-ready recognition.

## Python and hosting

Python is a development tool, not a hosted server requirement. `tools/build_recognition.py` needs Python 3 and Node; it uses the standard library and regenerates `recognition-data.js` after letter geometry changes. The committed generated file lets GitHub Pages serve the app directly. No API keys or Python runtime are shipped to the child.

From the repository root:

```sh
python tools/build_recognition.py --check
node tests/tracing.test.cjs
```

In this development workspace web files live in `dist`; the published GitHub repository keeps them at its root. Both layouts are supported by the generator and tests.

## Validation

Behavioral tests cover all 52 forms at two support levels, transformed and reversed ink, missing components/dots, mirrored and confusable letters, stationary taps, canceled pointers, speech fallback, narrated Watch sequences, idle timer teardown and delayed rewards. Independent hand-authored E/F fixtures cover wrong-letter detection, partial E continuation, delayed assessment and new-page retry. Browser checks complement this harness; it is not physical iPad/Safari or child usability validation.

## Voice, privacy and storage

Device English speech selects an available voice automatically, at rate .80 and pitch 1.05. There is no custom cartoon narrator, cloned character voice or paid speech API. Available voices and audio behavior depend on the device; tap Start to enable sound. Animal effects are removed; optional music and reward tones remain.

Raw ink stays in memory and is cleared on reset or changing letters. Up to 150 summary observations, stickers and preferences are stored in this browser's localStorage; nothing syncs across devices. No accounts, advertising or third-party analytics. Google Fonts can supply typefaces, with system fallbacks. There is no guaranteed offline cache. Use real paper alongside screen practice.

## Publishing

GitHub Settings → Pages → Deploy from a branch → main → root. Keep private service credentials out of this public repository. A future remote recognizer would require a separate secured backend and a data-handling decision; this version sends no drawings to a service.

## Free reliability update (v19)
Recoverable speech failures replay the same prompt once using another available voice or the browser default. Cancellation and permission failures do not retry. Watch advances once after the eventual result. Original bundled SVG illustrations depict igloo, xylophone and zipper; queen and yarn now use matching pictures. No paid services, API keys or trial-only integrations were added. Device pronunciation and physical iPad audio still need listening checks.

## Pencil and speech repair (v20)
Pencil checks no longer freeze unfinished or uncertain writing. Lowercase partial letters remain drawable; page-length limits and New page still bound scribbling. Stationary taps are retained as dots. Competing templates allow modest tilt and alternate A crossbar heights; tiny remote marks are ignored for scoring while remaining visible. Retracing the same shape is permitted. This remains a geometric practice aid, not a validated child-handwriting model.

Selecting a letter automatically speaks all three pictured examples in a cancellable sequence, with one second of silence after each example finishes. A is spoken as a standalone letter rather than the ambiguous spelling “Ay”. Natural US voices are preferred without pitch alteration, with other English voices and the existing error fallback retained. Actual pronunciation depends on installed voices and needs device listening checks. Watch uses short cues paired with animation.

Run `node tests/tracing.test.cjs` for behavioral, vocabulary, speech sequencing, all-letter geometry and independent child-like regression cases. No API keys, remote recognition, or child-data uploads are introduced.

## Optional numbered Pencil coaching (v22)
Pencil shows a purple 1, gold 2 and direction arrow for one suggested stroke at a time. Help repeats the current short tip; Watch demonstrates each numbered route. Loops return to 1 and dot strokes use one marker. Tips are optional in grown-up practice settings and fade while drawing. They never feed recognition, create ink, or require touching checkpoints. Three-second whole-shape assessment and free drawing remain unchanged.


## Pencil reliability and child input (v24)
- Numbered routes are optional visual coaching, never recognition checkpoints. Pencil input no longer enters the Trace handler at all.
- Check explicitly assesses the whole drawing. Automatic assessment waits until the finger is lifted, then three seconds. Help, Watch completion, dialog close, and returning to the app resume pending checks.
- Recognition uses a local Web Worker so matching does not block drawing controls. Revision guards discard stale results; unavailable workers fall back to local matching. This remains a geometric practice aid, not validated child OCR.
- Undo has been removed. New page clears the drawing intentionally; re-tapping the selected mode preserves it.
- The welcome screen asks for an optional name, saved locally and used for greetings/praise. Blank names get neutral encouragement. Names do not create separate progress profiles.
- Child play suppresses multi-touch page gestures, selection, drag, and callouts; the decorative logo no longer navigates. Name entry and settings retain normal editing/scrolling. Websites cannot disable OS app switching or browser chrome. Use device-level Guided Access/app pinning for supervised single-app sessions.
- Physical iPad/Safari speech, actual touch, and diverse child handwriting still require validation. No ink or names are uploaded to a backend.

## Automatic Pencil steps (v25)
After a normal finger lift, numbered coaching advances past routes already covered by the child's ink and speaks the next short direction. Small gaps, wobbles, reversed strokes and out-of-order parts are allowed. Help repeats the current part; Watch restores it after demonstrating. New page and letter changes reset coaching.

This spatial check only moves optional hints near the displayed routes. It neither creates ink nor awards progress. Free drawing away from the routes still uses the existing position- and size-independent whole-letter recognition. Endpoint taps alone do not complete a line.

Run `node tests/pencil-coaching.test.cjs` and `node tests/tracing.test.cjs`. The v25 focused geometry/coaching checks passed in an isolated JavaScript runtime; the full Node harness and browser/device checks still need to run for this revision.

## Find the picture (v27)
Letter introductions now say “Let's write” and lead into drawing guidance. The three examples appear as a listening game after writing: one spoken question, friendly naming after another choice, a visual hint, and a short letter/word response for the matching picture. Targets rotate across the three examples per letter and case within the current visit. The next-letter arrow is always available; the game adds no penalties and does not gate earned stickers. Muted play has visual prompts and hints; reduced-motion settings disable the picture wiggle. This replaces the automatic three-example sequence described in v20 and removes the extra picture row while writing.

Run `node tests/picture-game.test.cjs` for 887 focused checks across all 52 forms. These checks passed in the isolated JavaScript runtime. Full browser and physical-device verification remain pending.

## Watch comparison guide (v28)
In Pencil mode, Watch animates a wider translucent purple model beneath the child's dark ink. Completed model strokes stay visible for comparison and continued drawing. Replaying Watch starts a fresh model; New page and letter changes clear it. The model is a separate, non-interactive SVG layer and never enters recognition or earned progress. Watching a completed Pencil page preserves the child's ink and returns to its reward afterward.

`node tests/watch-guide.test.cjs` covers 410 checks for all 52 forms, retained model strokes, cancellation, resets, finished-page preservation and unchanged crayon behavior. The focused checks passed in an isolated JavaScript runtime; physical-device visual and speech checks remain pending.


## Pencil repair coaching (v29)

After an idle or explicit Check, blue dashed segments suggest one missing part; amber overlays identify off-model ink regions to compare. Suggestions use the recognized target variant and inverse size/position alignment, so they follow the child's drawing. Low-confidence and different-letter results use a whole-letter demonstration instead of precise error claims. Recognition and reward thresholds remain unchanged.

Automatic demonstrations run once per ink revision and preserve original ink. A missing part receives a short, captioned demonstration at the child's position; other results use existing Watch. New input, navigation, dialogs, and My turn cancel playback or its pending timer. Speech follows the existing sound setting. Undo last removes one gesture and rechecks the remaining drawing. Hide model hides the model and repair guides, not the child's ink; new pages and demonstrations restore guidance.

The parent Pencil panel shows the current or latest attempt, repair focus and help counts, plus a watch/copy/cover/try-on-paper routine. Stored records contain only bounded summaries, never raw drawings. The display is a practice aid, not a validated handwriting assessment or proof of muscle-memory transfer.

Implementation stays in browser JavaScript and the existing Web Worker because input, animation, and local recognition require no server or upload. Reviewed the University of Washington [$P point-cloud recognizer](https://depts.washington.edu/acelab/proj/dollar/pdollar.html) as background for order-independent matching; no third-party code was copied. The existing classifier is retained.

Validation: existing tracing, picture-game, Watch, and coaching suites, plus missing crossbar, translated/scaled repair marks, preserved ink, one-shot automatic playback, stale-timer cancellation, Undo, repair completion, model visibility, and parent guidance. Browser interaction checks supplement synthetic tests; physical child/stylus testing is still needed.

## Recording-driven coaching update (v30)

Thinking pauses still allow recognition of a finished letter, but never launch a lesson. Tap Check to request repair guidance; the existing parent setting controls automatic playback after that request. Each repair topic plays automatically at most once per page, even if the child adds more ink. Watch remains available on demand.

Pencil instructions now occupy a dedicated strip outside the drawing area. Significant missing parts receive a complete blue route with start/end numbers; isolated small gaps are not presented as missing strokes. Ink and recognition thresholds are unchanged. Regression coverage includes pause-versus-Check behavior, replay suppression after retracing, numbered repairs, and existing 52-letter recognition/coaching checks.
