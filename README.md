# Alphabet Adventure

A gentle, touch-first alphabet tracing game for young children. Built as a static website for GitHub Pages: no application server, API keys, accounts, database, or build step.

## Play

Open the published site in a modern browser and tap **Let’s play**. Choose a big or little letter. Follow the glowing numbered dot through each stroke, lift your finger, and start the next stroke. **Show me** demonstrates the complete letter; **Try again** restarts it. Completed letters earn animal stickers.

Includes 26 uppercase and 26 lowercase print forms, speech prompts (where supported), synthesized reward sounds, animated celebrations, randomized stroke praise, local progress, gentle/focused tolerance, and reduced-motion support. Small a and g use single-storey forms. Letter formations are a simple print style; schools may teach different stroke sequences.

## Enable GitHub Pages

1. Open this repository’s **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select **main** and **/ (root)**, then **Save**.
4. Wait for the Pages deployment. GitHub will show the live website link on that screen.

The expected address for this repository is `https://ramansohi1.github.io/alphabet-adventure/` (available only after successful deployment).

## Privacy and storage

Progress and preferences use localStorage on the current browser/device; no child names or accounts are collected. Progress does not sync across devices and can disappear when browser data is cleared. If storage is unavailable the game still runs. No analytics or ads. Google Fonts supplies the typefaces; system fonts are used if unavailable. Speech synthesis depends on browser/OS voices. Sounds require a user gesture on iOS.

## Files

- `index.html` — responsive interface and dialogs
- `style.css` — design, responsive layouts, and animations
- `letters.js` — hand-authored SVG stroke paths for all 52 letter forms
- `app.js` — ordered tracing, multi-touch handling, sound, rewards, and storage
- `tests/tracing.test.cjs` — dependency-free behavioral test harness

The app uses Pointer Events and an SVG coordinate system so finger, stylus, and mouse input work at different sizes. Only the active finger is accepted. Ordered checkpoints, maximum movement distance, and a required finger lift between strokes prevent endpoint taps and large shortcuts from completing a letter. It is guided practice, not handwriting recognition or a developmental assessment.

## Development and checks

Serve the repository with any static HTTP server. Run `node tests/tracing.test.cjs` for the tracing tests and `node --check app.js` for syntax validation. Tests exercise all 52 letters at both tolerance levels, incorrect starts, endpoint jumps, canceled touches, dot strokes, repeated rewards, multiple pointers, demo cancellation, and unavailable storage. Browser interaction was checked in desktop Chrome; physical iPad/Safari finger input and audio need device testing.

## iPad

Open the live link in Safari, tap **Let’s play**, then use a finger on the tracing board. Safari’s Share menu → **Add to Home Screen** can provide a home-screen shortcut. An internet connection is required to load the site. There is no service worker/offline cache guarantee.

## Playful letter worlds update

Letter prompts say the letter once (for example, “C is for cat”). All letters have themed backgrounds with tappable scene objects. Completed letters trigger full-screen confetti and dancing stickers, respecting animation settings and reduced motion. Animal calls are synthesized cartoon imitations; quieter animals use movement/habitat effects instead of invented calls. A three-letter L–T–I adventure provides short practice with star progress. Speech and effects are canceled when switching letters or muting.

## Handwriting and learning update

Four labeled guides: sky (80), plane (180), grass (360), worm (425). Settings support left/right-handed layouts without reversing letters, English voice selection, a test phrase, and American zee/British zed. Letter names use explicit spoken spellings to reduce browser misreadings. Speech still depends on device/browser voices; Dessa is not integrated.

Wide-trail and dots practice modes, current-stroke Help me, support after repeated incorrect starts, less-practiced letter suggestions, local practice counts, optional breaks after three completions, and paused background animations while tracing. Practice records use a separate localStorage key and do not indicate mastery.

### Guided practice and local observations
Letter speech now uses a slower 0.70 speech rate. Pencil mode labels the sky,
plane, grass and worm lines and offers tap-to-hear guidance for each stroke.
Every second completion earns named praise; repeated difficulties can trigger
encouragement, at most once every 25 seconds.

The parent settings show up to 150 recent attempts, grouped by letter case,
guide mode and difficulty. Near-guide percentage uses raw movement samples
spaced at least 4 SVG units apart, within 12 SVG units of the current stroke.
Active time counts pointer movement intervals capped at 120 ms, excluding idle
pauses; speed is guide-coordinate travel per active second, not paper-writing
speed. Missed starts, off-trail episodes, jumps, help requests and per-stroke
errors are recorded, including abandoned attempts. Raw coordinates are not
persisted. Observations remain in localStorage and Reset clears them.

Dice practice defaults to using recent observations: two review selections for
one shuffled selection when eligible letters need support. Review uses the last
five attempts in the current guide mode and difficulty, excludes the current
letter, and never uses speed as a target. Parents can disable this in settings.
These observations guide practice, not assess independent handwriting skill.
