---
title: Making and installing Patternflow patterns
summary: What you can do with no hardware, generating a pattern with an AI assistant, colouring it, verifying it on a device, publishing it, and installing other people's.
---
# Making and installing Patternflow patterns

A Patternflow pattern is a small file. It travels to the device as a `.pfm` module of a few kilobytes, arrives over Wi-Fi in seconds, and the firmware is never rebuilt and nothing is reflashed. This piece is the whole loop, from an idea to a pattern running on a panel and published for everyone else. The instrument itself is <{{sign}}/what>.

A USB cable is used for exactly one moment in a Patternflow's life: the first browser flash. After that every path a pattern takes goes over Wi-Fi.

Patternflow displays rapidly changing light patterns that may trigger seizures in people with photosensitive epilepsy. That applies to the editor and the community wall as much as to the panel; anyone who feels discomfort should stop immediately.

## With no hardware at all

None of this needs a device, and none of it needs an account.

- **The Live Editor**, <https://patternflow.work/pattern>, is a full Patternflow simulator. Turn the virtual knobs and it behaves like the real thing. It opens with its own preset library, each preset loadable and remixable.
- **The community wall**, <https://community.patternflow.work/community>, plays every shared pattern. Hovering a card runs it — the still image is only a preview — and scrolling over it turns its knobs, with the cursor's horizontal position picking which of the four you are holding. Ctrl and scroll resizes the cards.
- **Decks** can be assembled without signing in, and **Pattern Lab** generates, colours and exports patterns in the browser.

Signing in is needed only to send a pattern to a device, to share, to like or to fork. The account asks a username and a password; no email.

## Making one in Pattern Lab

Pattern Lab, <https://patternflow.work/pattern-lab>, is the studio. The Live Editor is where you find out you want to make patterns; Pattern Lab is where you make them.

1. **Pick the resolution first**, from the selector above the preview: 128 x 64 landscape, or 64 x 128 portrait, which is the device's usual standing orientation. The choice is recorded in the code as one `// @matrix` line and travels with the pattern through sharing, forking and conversion.
2. **Generate.** `COPY PROMPT` in the code panel copies a prompt carrying every rule of a Patternflow pattern. Paste it into any AI assistant, then describe what you want. It returns five patterns; you paste them in one at a time and the preview updates instantly. Finding a good one takes real patience — if none of the five work, ask for another five. How specifically you describe what you want matters as much as the model does.
3. **Set the knob ranges.** The number boxes flanking each knob slider are that knob's minimum and maximum. Narrowing a knob to its interesting band makes the physical knob sweep exactly that band, and the ranges travel with the code to your device and to anyone you share it with.
4. **Colour it.** Many generated patterns draw only in brightness, from 0 to 1. The colour ramp maps a gradient across that range: click the bar to add stops and pick a colour for each, choosing among five blend modes. The ramp is recorded as a `// @ramp` line and ships with the pattern.

Two more panels sit under `Panels`. **Director** automates the knobs over time — a lane per knob, double-click to drop a keyframe, hold or ease between them — producing a show the panel can play by itself on the Performance edition, or a MIDI clip for a DAW. **Graphic Export** renders PNG stills and MP4 or WebM clips entirely in your browser, with nothing uploaded. Neither changes what goes to the device.

Writing one by hand is a supported path too: `x` and `y` are pixel coordinates, `t` is time in seconds, and a minimal pattern is a `render(x, y, t)` function returning a colour. The prompt that `COPY PROMPT` copies is the API reference.

## Getting it onto a device

The device runs C++ and patterns are written in JavaScript, so a pattern is translated into a C++ header before it can run on hardware. That translation does not always succeed, which is why verifying on a real device comes before publishing.

1. `To hardware` at the top right of the lab opens the conversion dialog.
2. `COPY THE CONVERSION PROMPT`, paste it into the same AI assistant, and it returns header code beginning with `#pragma once`.
3. Paste that back into the dialog and continue. `APPLY TO MY PATTERNFLOW` builds the module in seconds and `Send over Wi-Fi` uploads it.
4. Look at the panel. It should match the browser preview, and the knobs should respond the same way.

If it comes out wrong, go back to the header and ask for the conversion again — a plain retry often fixes it — or simplify the pattern code, or try a different model.

The browser preview is a strong approximation rather than a perfect match: colours on the physical panel are slightly more saturated and dark values read darker. Tune until close, then finish on the device.

## Keeping it fast

The Live Editor shows a live `ESP32 cost` readout, counting the expensive maths in the pixel loop — the panel is 8,192 pixels, and `atan2` is the most expensive common operation. Scores under 20 are reliably smooth and slowdowns appear well above 50; between those, run it and see. The usual fix is moving expensive maths out of the per-pixel loop into a lookup table built once at setup. You can also put the constraint straight into the prompt, as in "keep cost score under 30, no atan2".

## Publishing

`UPLOAD TO THE COMMUNITY` from the hardware screen publishes with your verified header attached, so the pattern lands on the wall wearing an `.h` badge, meaning it can go straight onto someone else's device. The plain `Share` button publishes the JavaScript only, with no header — those cards have no "add to deck" button, which is not a bug.

The form asks for a title and description, how it was made (using an AI assistant is no mark against anything; it is recorded only because nobody can reconstruct the answer later), a licence, and who can see it. The default licence recommendation is CC BY-SA 4.0; CC BY 4.0 is the other choice.

Patterns are the one thing that does not go to the repository as a pull request. They are published to the community wall.

## Installing someone else's

A **deck** is a setlist the device cycles through, up to 20 patterns, dragged into order. Building it reports something like `4 modules, 32 KB` in seconds, and `SEND OVER WI-FI` opens the device's Patterns page, where the modules upload themselves. A single pattern's detail page has the same button for one.

A published deck also offers `Download pack (.zip)`, which needs no account and no build queue. The zip holds the modules and the running order, so dropping it on a device's Patterns page installs the set as its author left it — which works with no internet in the room.

On the device's Patterns page you can click a pattern's name to switch to it immediately, drag rows and save the order the knob cycles through, and tick and delete what you no longer want. Origin is marked as a preset and cannot be removed. Up to 128 modules can be installed; an empty slot costs the same as a full one, so five and 128 use the same memory.

## Links

- Live Editor: <https://patternflow.work/pattern>
- Pattern Lab: <https://patternflow.work/pattern-lab>
- Community wall: <https://community.patternflow.work/community>
- Decks, including the Basics pack: <https://community.patternflow.work/community/decks>
- Pattern Guide, the whole loop in detail: <https://github.com/engmung/Patternflow/blob/main/PATTERN_GUIDE.md>
- Writing patterns by hand, and the cost score: <https://github.com/engmung/Patternflow/blob/main/firmware/CUSTOM_PATTERNS.md>
