# Alphabet Adventure

A static, touch-friendly letter practice site for GitHub Pages. The published site is https://ramansohi1.github.io/alphabet-adventure/.

## Practice

- Trace teaches ordered strokes; Watch animates and narrates all 52 print forms using sky, plane, grass and worm lines.
- Pencil captures real ink anywhere on the paper, allowing different positions, sizes and stroke orders. After three seconds of stillness it compares the shape with all 26 letters in the chosen case, independent of the prompt. A reward needs a clear best candidate plus coverage, precision, component and length checks.
- A likely unfinished letter remains writable. A clearly different letter pauses for Undo or New page. Uncertain work receives a gentle suggestion and no success reward. No glowing preset-point corrections in Pencil.
- Undo removes one drawn gesture. Sixteen drawn gestures or an excessive path length pauses the page for explicit repair; work is not silently erased. Taps do not earn progress.
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

Behavioral tests cover all 52 forms at two support levels, transformed and reversed ink, missing components/dots, mirrored and confusable letters, stationary taps, canceled pointers, speech fallback, narrated Watch sequences, idle timer teardown and delayed rewards. Independent hand-authored E/F fixtures cover wrong-letter detection, partial E continuation, delayed assessment and undo repair. Browser checks complement this harness; it is not physical iPad/Safari or child usability validation.

## Voice, privacy and storage

Device English speech selects an available voice automatically, at rate .80 and pitch 1.05. There is no custom cartoon narrator, cloned character voice or paid speech API. Available voices and audio behavior depend on the device; tap Start to enable sound. Animal effects are removed; optional music and reward tones remain.

Raw ink stays in memory and is cleared on reset or changing letters. Up to 150 summary observations, stickers and preferences are stored in this browser's localStorage; nothing syncs across devices. No accounts, advertising or third-party analytics. Google Fonts can supply typefaces, with system fallbacks. There is no guaranteed offline cache. Use real paper alongside screen practice.

## Publishing

GitHub Settings → Pages → Deploy from a branch → main → root. Keep private service credentials out of this public repository. A future remote recognizer would require a separate secured backend and a data-handling decision; this version sends no drawings to a service.

## Free reliability update (v19)
Recoverable speech failures replay the same prompt once using another available voice or the browser default. Cancellation and permission failures do not retry. Watch advances once after the eventual result. Original bundled SVG illustrations depict igloo, xylophone and zipper; queen and yarn now use matching pictures. No paid services, API keys or trial-only integrations were added. Device pronunciation and physical iPad audio still need listening checks.
