---
title: When a running Patternflow misbehaves
summary: Problems after the panel is lit — Wi-Fi and the device's pages, installing patterns, storage that will not mount, a pattern that looks wrong on hardware, and audio or MIDI that will not connect.
---
# When a running Patternflow misbehaves

Patternflow is an open-source LED synthesizer whose patterns and firmware both arrive over Wi-Fi. This piece collects what goes wrong once the panel is lit and on the network. Failures during the build itself are in <{{sign}}/trouble>.

Several of these are fixed by a firmware update, which leaves your patterns, Wi-Fi networks and storage untouched: <https://patternflow.work/update>.

## Network and installing patterns

**"Send over Wi-Fi" does nothing, or the device's Patterns page will not open.** Almost always one thing: the device is off, or it is on a different Wi-Fi network than your computer. On Android, `.local` addresses do not resolve — use the IP from the device's network screen, which you reach by holding encoder 2. On Windows the panel also answers at `http://patternflow/`.

**How do I move the device to a different Wi-Fi network?** The network set during flashing is saved and reused on every boot until it is overwritten. Re-flash from the browser and set the new one during provisioning, or in Arduino IDE enable "Erase All Flash Before Sketch Upload" and re-upload. A plain re-upload does not clear stored credentials.

**I uploaded modules and they do not appear in the list.** The firmware is older than v3.2.0, which is where wireless module install landed. Update it.

**Storage will not mount, and pressing Format does not help.** Update the firmware. Before v3.10.2 a format never read back what it wrote, so on a board whose flash silently drops writes every step reported success and the next mount failed the same way. Since v3.10.2 the mount after a format decides the result and says why.

**My Wi-Fi is unreliable.** In this order, cheapest first: confirm it is actually the display, by comparing the connection while the panel is driven against while it is not. Clip ferrite rings onto both HUB75 ribbons at the PCB end. Shorten the ribbons and route them away from the module's antenna corner. Re-flow the ground joints — the most likely difference between a board with no loss and one with almost total loss. Only then consider lowering the panel clock, which costs brightness. Do not raise the Wi-Fi transmit power: that is a conformance setting.

## Patterns

**My pattern looks right in the browser but wrong on the device.** The device runs C++ and patterns are written in JavaScript, so the code is translated into a C++ header, and that translation does not always succeed. Ask for the conversion again — a plain retry often fixes it — or simplify the pattern code, or try a different model.

**A pattern card has no button to add it to a deck.** Not a bug: the author shared it without a verified hardware header, so it cannot be built into a module.

**The build button asks me to sign in.** Building a module happens on a server. Browsing, turning knobs and assembling a deck need no account.

More on all three is in <{{sign}}/patterns>.

## Audio and MIDI

**The microphone is on but nothing reacts, or the knobs feel stuck.** Silence while everything looks healthy is almost always the SEL pin not being grounded: tied high, the microphone reads silence while looking perfectly fine. Separately, a firmware bug fixed in v3.10.1 let a panel with the microphone enabled but nothing wired claim all four knobs and pin them, so a hand on a knob sprang back.

**Ableton or rtpMIDI cannot see the panel, or sees it and nothing moves.** Missing from the rtpMIDI directory means it is not on the same Wi-Fi, or Bonjour is blocked — add it by address instead. Connected but nothing moving in Live means Remote is not ticked on the input port. Every note arriving twice means two sessions to the same panel. A knob that barely moves or jumps means the panel is in relative mode while Live guessed the encoder type wrong.

## Where to ask

Discord's hardware-help channel is the place for getting unstuck: <https://discord.gg/Vr9QtsxeTk>. A bug, or a wrong or missing document, goes to <https://github.com/engmung/Patternflow/issues/new/choose>. There is no support email.
