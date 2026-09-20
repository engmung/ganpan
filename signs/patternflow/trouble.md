---
title: When a Patternflow build goes wrong
summary: Failures while building — the flasher sees no board, the panel is dark or scrambled, the board needs a RESET press, the encoders turn the wrong way — and the fix for each.
---
# When a Patternflow build goes wrong

Patternflow is an open-source LED synthesizer built from a custom PCB, a HUB75 LED panel and an ESP32-S3. This piece collects the failures that come up while building one, with the fix the project gives for each. Building in order is <{{sign}}/build>; problems that start once the panel is lit are in <{{sign}}/running>. If nothing here matches, the place to ask is the hardware-help channel in Discord, <https://discord.gg/Vr9QtsxeTk>, where photos and quick back-and-forth are expected.

Several of these are fixed by a firmware update. Updating leaves your patterns, Wi-Fi networks and storage untouched: <https://patternflow.work/update>.

## Flashing

**The flasher does not see my board — the port list is empty.** Three things, in order. Use the **left** USB-C port on the module, its native USB port; the right one goes through the UART bridge and the flasher will not see the board there. If the picker is still empty, put the module into download mode by hand: hold BOOT, tap and release EN/RST, release BOOT. If still nothing, it is almost always a charge-only cable. There is no driver to install for that port.

**Which browser do I need?** Desktop Chrome or Edge only, because flashing uses Web Serial. Firefox and Safari will not work, and flashing needs a desktop computer rather than a phone. Nothing needs installing. Everything after the first flash, including the device's own console, works from a phone.

**There is only one pattern after flashing. Did it fail?** No, that is correct. The image ships with Origin alone as the failsafe, and every other pattern lives on the device's filesystem so patterns can be added and removed without reflashing. The Basics pack on the decks shelf adds 33 in one click with no account: <https://community.patternflow.work/community/decks>.

## Power and boot

**Can I power the board over USB-C?** No. On the PCB build `J4`, the two-pin screw terminal, is the only power input, and the current board has no USB-C footprint at all. The module's own USB ports are never a power input on any route. A v3.0 board powered that way ran normally for 20 to 30 minutes and then smoked at a connector pin. The failure is delayed, so passing a multimeter check proves nothing. On a v3.0 board leave `USB1`, `R1` and `R2` unpopulated. The USB ports on the module are data only.

**The board needs a RESET press every time I power it on.** That is the floating GPIO0 strap pin, which is left unconnected by design. Most modules boot fine and some do not. The fix is one resistor: a 10k pull-up from GPIO0 to 3.3 V on the module.

## The panel

**The panel is completely dark.** In this order. Flash the stock firmware first — its default profile sends no init sequence and drives most panels, including the reference build's. If it lights up you are done, whatever chip is stamped on it. Only if it stays dark, build once with the profile matching your driver chip. Still dark: check power, and check the ribbon is on the panel's **IN** connector. Then suspect an S-PWM "video wall" driver chip, which cannot work and which no firmware setting rescues. Which chips those are is in <{{sign}}/parts>.

**It lights up but the picture is wrong.** The symptom points at the cause.

| Symptom | Likely cause |
| --- | --- |
| A corrupted first row or column | Clock phase |
| Scrambled blocks, or mirrored quarters | Wrong scan mapping, often an outdoor 1/4-scan panel |
| Dim, flickering, or random sparkling | Power delivery, shared ground, or 3.3 V logic marginal at that cable length |
| Wrong colours, or ghosting | The wrong panel profile |
| Banding across long smooth gradients | Refresh target too high |
| Init failing or crashing on a large panel | DMA memory — confirm the module is an N16R8 with PSRAM enabled |

**Bright edges grow purple and sky-blue fringes, and greys read pink.** A display-driver bug, fixed in firmware v3.10.3. Update; because the fix is in the driver, every installed pattern gets it with no rebuild.

**The panel bands when I film it on a phone.** Since v3.10.4 the panel refreshes at exactly 300 Hz, the one rate that the shutter speeds a phone actually uses all divide, so 1/50, 1/60, 1/100 and 1/30 come out clean. 1/120 and slow motion still band. Lock the shutter at 1/60 or 1/50 in a manual camera app, and switch HDR and night modes off.

## Knobs

**My encoders turn the wrong way, or one click jumps two steps.** Fix it per knob on the device's own `/knobs` page in a browser — no rebuild. Direction and how many edges make one detent are properties of the part you soldered in. The page arrived in firmware v3.10.3, so update first if you do not see it.

## Where to ask

Getting unstuck goes to Discord, in the hardware-help channel. A bug, or a wrong or missing document, goes to <https://github.com/engmung/Patternflow/issues/new/choose>. A security problem goes privately to <https://github.com/engmung/Patternflow/security/advisories/new>, never a public issue. There is no support email, and replies come from the maintainer and from other builders, usually within a day or two.
