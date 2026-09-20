---
title: Patternflow features and editions
summary: What an edition is, what the web console does, and how network MIDI, OSC, MQTT and audio-react work, each with the page to read next.
---
# Patternflow features and editions

Patternflow is an open-source LED synthesizer whose firmware is split into **editions**: one core, plus a chosen set of features, published as a card you install in one click over Wi-Fi. This piece describes what each feature does and where to read the detail. The instrument itself is <{{sign}}/what>.

The catalogue of features, each with what it needs and a reel of it working, is at <https://patternflow.work/features>. Entries can be linked directly: <https://patternflow.work/features#midi>, and the same with `#osc`, `#mqtt`, `#audio_in`, `#audio`, `#show`, `#clock` or `#weather`.

## Editions

One image ships on the board; the others are a click away at <https://patternflow.work/editions>. Three are on the shelf. Clock used to be a fourth and left it, and a couple of things that are not on the shelf — Clock, and the panel as a USB MIDI device — have a frozen try-out image you install through the panel's own update page. Frozen means nobody moves them when the core moves; the way back is one click on the shelf.

| Edition | Carries |
| --- | --- |
| Patternflow | Nothing beyond the device itself. This is what ships on a new board, and it gives a pattern the largest memory block |
| Audio | OSC, network MIDI, browser or phone audio, and the on-board microphone |
| Performance | Sequences, MQTT in every role, the Director's show player, and weather |

Switching is one click and keeps your patterns, your Wi-Fi networks and your settings. Every edition is required to keep the update route working in both directions — a firmware you cannot leave is a fork, not an edition.

Editions cost pattern memory: the default build leaves a single pattern the largest block, Performance less, Audio least. Audio is kept separate because its microphone needs soldering and its radio setting is not the conformance-tested one.

## The web console

The panel serves plain HTML pages over your local network. Hold encoder 2 to put its IP address on the panel and type that into a browser; on a Mac or PC `patternflow.local` also works. Android cannot resolve `.local` addresses, so use the IP there.

The console carries every feature the device has and works from a phone. Its pages are the pattern list, status, Wi-Fi, knobs and update, plus one page per installed feature. A page for a feature that is not in your edition does not exist at all.

These addresses resolve only on the same network as the panel, and the device has no authentication of any kind by design, so a panel is not something to expose to the internet. The console also takes one connection at a time, so it is read by a person rather than polled by a program.

The **knobs page** sets which way each encoder counts and how many edges make one click, per knob, with no rebuild. Its own test: turn a knob clockwise and its position should go up by one per click.

## Network MIDI

The panel is a MIDI port on your network — RTP-MIDI, which macOS and iOS speak natively. Windows needs one free driver, rtpMIDI; Linux uses rtpmidid. Once the session is up the panel appears by name in any DAW.

Knobs one to four are CC 20 to 23 as absolute values and CC 24 to 27 as relative ones, the four buttons are notes 60 to 63, and a program change picks a pattern by its position in the list. The panel sends its own knobs out as CC 24 to 27. Sensitivity is a slider per knob on the console's MIDI page, from a quarter turn end to end through 1:1 to ten turns, remembered across reboots.

In Ableton Live you tick Remote on the session's input row to map knobs with Ctrl-M, and Track to play the buttons as notes. Pressing "Use this computer" on the panel's MIDI page makes the panel remember the host and reopen the session itself on every boot, so the driver never needs reopening.

- Step by step with screenshots: <https://github.com/engmung/Patternflow/blob/main/docs/midi-ableton.md>
- The protocol: <https://github.com/engmung/Patternflow/blob/main/docs/midi-spec.md>

## OSC

Plain OSC over UDP, in both directions. Send a ping once and the device learns the address it came from, after which knob turns, button presses and pattern changes stream out to you, and incoming messages drive the device exactly like a hand on an encoder. OSC is what Max, TouchDesigner, Resolume, VCV Rack and Processing speak, and it carries things MIDI cannot. OSC knob messages are relative deltas; absolute values travel over MIDI.

For Ableton Live Suite there is a ready-made Max for Live bridge in the repository; it needs the Audio edition on the panel and the same Wi-Fi. Anything that can send a UDP OSC message can do what the bridge does.

- The protocol: <https://github.com/engmung/Patternflow/blob/main/docs/osc-spec.md>
- The Ableton bridge: <https://github.com/engmung/Patternflow/tree/main/integrations/ableton>

## MQTT

The panel speaks MQTT both ways on any 3.1.1 broker you already run, configured on its own MQTT page. Knob turns and pattern changes publish as they happen, and messages coming the other way move the knobs and switch patterns as a hand would.

Two panels pointed at the same broker with the same prefix follow each other, one set to Publisher and the other to Subscriber. It also puts the device on the same bus as the rest of a home or venue setup, so Home Assistant, Node-RED or a lighting desk can drive it with nothing Patternflow-specific in between. Publishing `1` to the `sleep` topic puts the panel to sleep and `0` wakes it, with the state mirrored back — the one command a panel obeys in either role.

The topic prefix is the channel. For one panel driven by one external controller, the broadcast prefix with the panel set to Subscriber is the combination that behaves; on the numbered channels a Publisher's retained snapshot will overwrite an outside writer a moment later, and the symptom is a control that will not stay where it is put.

MQTT and the browser-side zip unpacking that makes pattern packs install in one click were contributed by Simone Majocchi.

- The protocol, with Home Assistant examples: <https://github.com/engmung/Patternflow/blob/main/docs/mqtt-spec.md>

## Audio-react

Two ways in.

**From a browser.** A Chrome or Edge extension captures the current tab's audio, splits it into four bands you shape on the live spectrum, and streams the levels to the panel over a WebSocket. A pattern reads them as ordinary knob parameters, so every encoder-driven pattern reacts with no audio code of its own. The extension is not on the Web Store; you load it unpacked from the repository.

**From the panel itself.** A PDM microphone soldered to the module runs the same analysis on the device, with no browser involved. It must be PDM: an I2S mic needs three signal pins and only two are free, and an analogue electret needs an ADC pin that is not free either.

When several sources are live, a hand on an encoder beats everything, a browser or phone stream beats the microphone on any lane it drives, and the microphone takes what is left. A knob you grab returns to the music a few seconds after you let go, and both paths share one editor.

- Setting both up: <https://github.com/engmung/Patternflow/blob/main/AUDIO_GUIDE.md>

## Writing your own feature

A feature is a directory that never edits a core file, so adding one is a pure addition and taking a core update has nothing to merge. The intended way to build one is to point an AI coding agent at the feature guide: its second half is written for the agent, and the boundary it must not cross is enforced by scripts. Most features are expected to stay in their author's own repository, which is the design rather than a rejection.

- Feature Guide: <https://github.com/engmung/Patternflow/blob/main/FEATURE_GUIDE.md>
- How editions are put together: <https://github.com/engmung/Patternflow/blob/main/docs/EDITIONS.md>
- The device's HTTP API: <https://github.com/engmung/Patternflow/blob/main/docs/rest-api.md>
