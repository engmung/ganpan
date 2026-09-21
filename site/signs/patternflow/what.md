---
title: What Patternflow is
summary: The instrument itself — specifications, what each of the four knobs does, what is on a new board, and where the project came from.
---
# What Patternflow is

Patternflow is an open-source LED synthesizer. You play it with four knobs: 8,192 pixels across a 128 x 64 matrix respond the instant you turn one, nothing is pre-rendered, and every frame is computed live on the device. A pattern is a small file, so every Patternflow plays every pattern anyone makes. This piece describes the instrument; building one, making patterns and getting unstuck are separate pieces of this sign.

**Photosensitivity warning.** Patternflow displays rapidly changing light patterns that may trigger seizures in people with photosensitive epilepsy. Anyone who feels discomfort should stop using it.

## Specifications

| Part | What it is |
| --- | --- |
| Display | 128 x 64 HUB75 RGB LED matrix, P2.5 pitch, 320 x 160 mm |
| Brain | ESP32-S3-WROOM-1 N16R8 (16 MB flash, 8 MB PSRAM), standalone, no sending card |
| Input | Four EC11 rotary encoders with push switch |
| Power | 5 V through the `J4` screw terminal — any supply that can give a couple of amps, usually a USB power bank |
| Runtime | About 4 hours per 10,000 mAh at maximum brightness with a typical pattern |
| Size and weight | 245 x 325 x 36 mm, 933 g |
| Firmware | Arduino-compatible C++, modular patterns, switched while running with no reflash |
| Licence | MIT for firmware and web code, CC BY-SA 4.0 for hardware, designs and docs |

On the PCB build, power reaches the board **only** through `J4`, the two-pin screw terminal on the back. Whatever the route, 5 V never goes into the ESP32-S3 module's own USB ports: those carry data, for flashing and for wired MIDI. The reason is in <{{sign}}/build>.

## What it is not

The project states its own boundaries. It is standalone rather than a Eurorack module. It is not an analogue video synthesizer. It is not a display: nothing is pre-rendered, and every frame is computed as you turn the knob. Sound is not in the default firmware — the microphone, OSC and MIDI arrive with the Audio edition, described in <{{sign}}/features>.

Mounting is designed in: the standard case has two wall-mount holes and a snap-fit back panel, and the one-piece larger case has a hanger hole.

## How you play it

Every encoder does two jobs. Turn it, or give it a short press, and you are moving the pattern that is running. Hold it down and a device function opens instead, and a second long press closes it again.

What a knob does to a running pattern is the pattern's own decision, so the same knob feels different on every one. That is what encoder 3 is for.

| Long press | Opens |
| --- | --- |
| Encoder 1 | Brightness |
| Encoder 2 | The board's IP address and the network screen |
| Encoder 3 | Each knob's own number, shown on the panel |
| Encoder 4 | The pattern list: turn to browse, long-press again to load one |

Typing the IP address from encoder 2 into a browser opens the device's own web console, which carries every feature the device has and works from a phone.

## What is on a new board

A new board boots into **Origin**, concentric sine waves sampled by an emergent grid. Origin is the only pattern compiled into the firmware, kept as the failsafe a board can always boot into. Everything else installs as a `.pfm` module over Wi-Fi, up to 128 of them, with no reflash. Adding a pattern never costs a firmware update, and a firmware update never touches patterns, Wi-Fi networks or storage.

One pattern after the first flash is therefore correct and not a failed install. The **Basics pack** at the top of the community decks shelf adds more in one click, with no account; as of September 2026 it holds 33.

You do not need a device to start. The Live Editor at <https://patternflow.work/pattern> is a full Patternflow simulator in the browser, and the community wall plays every shared pattern under the cursor.

## Where it came from

In January 2026 the author visited the Nam June Paik Art Center and stood in front of *Participation TV* (1963), where a viewer's voice reshapes the picture on the screen. Two months later an LED matrix and a potentiometer were connected for the first time. Where Paik brought the audience into the work, Patternflow hands over the making of it.

After the first pattern was posted online, some people asked how to buy one and far more asked how to build one, so the schematics, firmware, 3D models, build guide and the whole pattern workflow were published. Two capabilities at the centre of the instrument came from contributors rather than the author: the web upload flow, and the `.pfm` pattern modules.

## Where to read more

- The project site: <https://patternflow.work>
- The repository: <https://github.com/engmung/Patternflow>
- How it works inside, and the map of builds around the world: <https://patternflow.work/inside>
- The journal, written up at least weekly since the beginning: <https://patternflow.work/journal>
