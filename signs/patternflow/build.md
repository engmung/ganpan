---
title: How to build a Patternflow
summary: The routes to owning one, what each costs in money and hours, the build in order from printing to first power-up, and the one power rule that must not be broken.
---
# How to build a Patternflow

Patternflow is an open-source LED synthesizer played with four knobs. This piece is the route from nothing to a working panel. The parts to order are in <{{sign}}/parts>, and what to do when a step fails is in <{{sign}}/trouble>. The full written guide is the Build Guide in the repository, linked at the end.

## Power: the one rule

**On the PCB build, power the board through `J4`, the two-pin screw terminal on the back.** Strip a USB cable, clamp the two wires in, tighten. On a v3.9 board it is the only power connector there is. A breadboard build has no `J4`; there the 5 V lands on the breadboard rail. The rule that holds on every route is the same one: 5 V never goes into the ESP32-S3 module's own USB ports.

Do not power the board over USB-C, in any arrangement. A v3.0 board powered through USB-C ran completely normally for 20 to 30 minutes, with no heat and no symptoms, and then began smoking at one of the connector pins, destroying the receptacle and the power path around it (issue #221). Whether that was a soldering defect on the tight-pitch pins or a structural limit of the part under the matrix's peak current was never settled, so v3.9 removed the footprint entirely. The failure is delayed, which is why passing a multimeter check and running for half an hour proves nothing.

On a v3.0 board, leave `USB1`, `R1` and `R2` unpopulated and do not buy those parts. The module's USB-C ports are for data only: flashing, and wired MIDI. So is the USB pass-through in the larger enclosure.

## Which route

| Route | What it involves |
| --- | --- |
| Custom PCB and 3D-printed case | The documented main route: order the board, print the enclosure, hand-solder, flash from the browser |
| Breadboard | The same electronics on jumper wires, no custom PCB and no soldering iron. Treated as a real Patternflow, not a prototype: <https://patternflow.work/build/breadboard> |
| Other combinations | Enclosure and electronics are separate choices. The assembly map lists them: <https://github.com/engmung/Patternflow/blob/main/docs/assembly/README.md> |
| Buy one assembled | Assembled units, DIY kits and custom enclosures have been offered through Crowd Supply. What is on offer now is on that page: <https://www.crowdsupply.com/engmung/patternflow> |

Laser-cut and other enclosures are not an official path; community variants live in the repository under `hardware/case/remixes/`.

## What it costs, as of September 2026

- **Parts:** US$100 to 200. At the low end, filament about $30, LED panel about $20, ESP32-S3 about $13, PCB and the remaining parts about $35. The guide calls $100 the floor rather than the estimate, because shipping, minimum order quantities and a reprint or two push it up.
- **Hands-on time:** about 1 hour — roughly 30 minutes soldering and 30 minutes assembly. The guide states no prior soldering experience is needed: every joint on the board is large through-hole, and v3 has no surface-mount passives at all.
- **Printing:** about 10 hours.
- **Waiting:** parts shipping takes about two weeks, so order first and build later.

## The build, in order

1. **Order the PCB.** The PCBWay shared project needs no Gerber upload; any fab works if you upload the v3.9 Gerber zip instead. Do not order the v2.1 board — it is a different size and will not fit the v3 cases — and do not order anything from the `experiment` folder.
2. **Print the enclosure.** A 256 mm bed prints `bed_256mm/encloser.stl` — body frame, back panels and panel mount in one file. A 330 mm or larger bed prints `bed_330mm/encloser.stl` as one piece with no bonding. Every build also prints the knob plate as its own job, black PLA against the body's white. Settings: 0.4 mm nozzle, 0.2 mm layer height, standard supports rather than tree supports, brim off. The Bambu P1S default profile works as it is.
3. **Bond the printed halves, right after printing.** On the 256 mm print the frame and back panel each come in two halves, glued with CA glue straight off the bed, with masking tape holding them while they cure. A hairline gap at a seam is normal and fills with putty, or baking soda and CA glue. Let the glue cure while you solder.
4. **Solder the board.** There is no written step list: the whole soldering process is one video, <https://youtu.be/NZCjMBCsDAc>. It was filmed on a v3.0 board, so the USB-C segment from 11:00 to 15:18 does not exist on a v3.9 board and is skipped. The module is never soldered; it plugs into two female sockets. The encoders insert from the back of the board, bodies on the back and leads soldered on the front. `C11` has a polarity. Go over the joints with a multimeter, and leave the module unplugged until after the power check in step 6.
5. **Assemble the case.** Seat the LED panel with its HUB75 IN connector toward the top; the fit is very tight, with near-zero clearance, so work it in slowly. Fit the panel mount and tighten its screws, then set the board into its bay and secure it by tightening the encoder nuts from the front. The power bank slides into a compartment behind the board bay. Video for this half, plus wiring and first power-on: <https://youtu.be/J9C9bZgkNKs>. It too was filmed on a v3.0 board.
6. **Wire it and power up.** HUB75 ribbon from `J1` to the panel's IN connector. `J3` to the panel's power cable, polarity checked twice. The stripped USB cable into `J4`, red to +5 V and black to GND — thread it through the enclosure's cable hole first, clamp the wires, tug each one, and only then fit the board. Then, with power disconnected, continuity-check +5 V against GND at `J3` (open is good), power up once and confirm about 5 V across `J3`, power off, seat the module per the silkscreen, and power on.
7. **Flash the firmware.** The module is flashed on its own, off the board — if it is already seated, pop it gently out, flash it, and put it back. From the browser, at <https://patternflow.work/pattern>: desktop Chrome or Edge only, because it uses Web Serial, and nothing needs installing. Use the **left** USB-C port on the module, its native USB port, with a data cable. Wi-Fi is set up in the same flow. One firmware image serves every board generation, so there is no board selection to get wrong. Arduino IDE is the other route and uses the **right** port.
8. **Final checks.** The panel shows Origin within a second or two. All four knobs visibly change it. A long press on encoder 4 opens the pattern list, encoder 1 brightness, encoder 2 the network screen. Power-cycle and confirm it boots with no RESET press. Then close the back panel, hooking the right edge in first and pressing along the snap-fit until it clicks, and press the knobs on last.

Both build videos show a lit panel. Patternflow displays rapidly changing light patterns that may trigger seizures in people with photosensitive epilepsy; anyone who feels discomfort should stop immediately.

## Then fill it

The flashed image ships with Origin alone. The Basics pack on the community decks shelf installs 33 patterns in one click with no account: your browser fetches the pack and hands it to the board over your own Wi-Fi, so the board never talks to the internet itself. Making your own is <{{sign}}/patterns>.

## The full guide

- Build Guide, start to finish: <https://github.com/engmung/Patternflow/blob/main/BUILD_GUIDE.md>
- Breadboard build: <https://patternflow.work/build/breadboard>
- Build page on the site: <https://patternflow.work/build>
- Getting unstuck: Discord <https://discord.gg/Vr9QtsxeTk>, hardware-help channel
