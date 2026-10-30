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

### Swipe shelf, open paper, and parent charts
All 26 letters are in one native horizontal scrolling shelf. Touch swipes,
mouse dragging and keyboard focus work without page arrows. The paper viewBox
adapts to the available area without distorting letters; ruled lines span it.
Pencil marks can start anywhere. Free exploration does not begin a tracing
observation until the child reaches the current guided stroke. Once tracing
begins, observations still include deviations. Letter rewards continue to
require ordered stroke completion. Line names are clickable and keyboard
accessible, and the directional arrow is larger and high contrast.

Watch demonstrates the whole letter; Hint highlights the current stroke and
gives a short cue without running a demonstration or changing practice mode.
Parent charts filter observations by mode and support level, show weighted
near-guide movement, recent attempts, error categories and active time. Empty
charts show an honest first-practice state. Details remain available on demand.

Sandy (en-US) is the only speech voice used. Voice and accent pickers were
removed. If Sandy is not installed/exposed by the browser, speech is silent
rather than substituting another voice; a clear parent notice explains this.
The browser's voiceschanged event updates availability after voices load.

### Narrated Watch lessons
Each uppercase and lowercase letter has hand-written instructions aligned with
its ordered SVG strokes. Sandy names the sky, plane, grass and worm lines as
appropriate, using “near” when a curve does not touch a line. Watch introduces
the letter, then animates and narrates each stroke. It advances only after both
finish, with a brief pause before the next stroke. Captions mirror the spoken
instructions. Muted or Sandy-unavailable devices still get the animation and
captions; speech errors have a timeout recovery. Changing letters, opening
settings, or interrupting Watch cancels its speech, animation and pending work.
Tests cover all 52 scripts and their stroke counts, narration sequencing,
cancellation, muted playback and speech failure recovery.

### Simpler tools and a fresh-page retry loop
ABC/abc now live in the header. Handedness controls are removed. Children have
two explicit tools: Trace (broad guide) and Pencil (their own fine line). Dots
is retained only for viewing older observations, not offered for new practice.
Parent tolerance labels now say More wiggle room and Closer tracing.

Completed work remains visible for 2.5 seconds before a rainbow celebration
with a bouncing picture, confetti and three tappable musical stars. The picture
still advances; rewards never advance automatically.

Pencil retries count drawn gestures with less than 18 guide units of forward
progress, not ordinary tiny taps or canceled touches. Four such consecutive
tries, twelve overall, or drawing longer than eight times the letter path
(minimum 1200 guide units) prompts a fresh page after 1.3 seconds. Completing
a stroke clears the consecutive count. The whole letter resets with its start
highlighted; earned stickers are preserved. Reset attempts are recorded locally.

### Automatic English speech
Sandy is preferred, no longer required. The app selects Sandy US, then a local
US English voice, another US English voice, and other English voices. If the
voice list is initially empty, it requests the browser default with en-US rather
than suppressing speech. Voice lists are checked on every prompt and refreshed
on voiceschanged. Voices reporting synthesis failures are skipped for later
prompts during the visit; interrupted or permission-blocked voices are not
blacklisted. Watch uses the same fallback and retains captions/error recovery.
Parent settings show the chosen voice and offer Hear voice. No manual selection
is needed. Actual speech availability still depends on the browser/device.
