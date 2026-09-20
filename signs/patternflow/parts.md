---
title: Patternflow parts list
summary: The bill of materials with manufacturer part numbers, the parts not on it, what must not be bought, and how to choose an LED panel that will actually light up.
---
# Patternflow parts list

Patternflow is an open-source LED synthesizer built from through-hole parts on a custom PCB. This piece is the shopping list for the current board revision, v3.9. Building with them is <{{sign}}/build>. The authoritative file is `hardware/bom/bom_v3.9.csv` in the repository, and the build guide's table is derived from it.

Budget US$100 to 200 as of September 2026. Every part except the LED panel is given by manufacturer part number and is meant to be looked up at Mouser, DigiKey or wherever sells the same part. The repository lists no prices on purpose.

## On the board

Seven line items, all through-hole. Nothing you solder is surface-mount.

| Ref | Qty | Part | Manufacturer part number |
| --- | --- | --- | --- |
| U1 | 1 | ESP32-S3 DevKit, N16R8, 44-pin, 25.4 mm row spacing. Socketed, never soldered | ESP32-S3-DevKitC-1-N16R8 (Espressif) |
| U1 sockets | 2 | Female pin socket header, 1x22, 2.54 mm | PPPC221LFBN-RC (Sullins) |
| SW1–SW4 | 4 | Rotary encoder with push switch, EC11, 5-pin, 20 mm shaft | PEC11R-4220F-S0024 (Bourns) |
| J1 | 1 | Box header, 2x8, 2.54 mm, vertical. Takes the HUB75 ribbon | 61201621621 (Würth Elektronik) |
| J3 | 1 | Screw terminal, 2-pin, 5.0 mm. +5 V out to the LED panel | TB002-500-02BE (CUI Devices) |
| J4 | 1 | Screw terminal, 2-pin, 5.0 mm, on the back. The power input | TB002-500-02BE (CUI Devices) |
| C11 | 1 | Electrolytic capacitor, 1000 uF 16 V, radial, 5.0 mm lead pitch. Observe polarity | 16PX1000MEFC10X12.5 (Rubycon) |

`J3` and `J4` are the same part, so order two of that screw terminal.

The encoders are inserted from the **back** of the board: bodies on the back, leads soldered on the front. The shaft length decides which knob file you print — 20 mm shafts use `knobs_20mm.stl`, 15 mm shafts use `knobs_15mm.stl`.

## Off the board

| Qty | Part |
| --- | --- |
| 1 | LED matrix panel: HUB75, 128 x 64, P2.5, 320 x 160 mm, full colour. See the section below before buying |
| 6–12 | M4 screws, about 10 mm. The linked panel has 12 mounting holes; all 12 is the exact fit, 6 across corners and middle holds it firmly |
| 1 | A sacrificial USB cable — any cable, it gets cut and clamped into `J4` |
| 1 | A 5 V supply that can give a couple of amps. A USB power bank is what the case compartment is sized for, and what keeps it portable |

Also the PCB itself, ordered from the PCBWay shared project or from any fab using the v3.9 Gerber zip, and filament for the enclosure.

## Not on the BOM, still needed

A 3D printer with a bed of at least 256 mm, white and black PLA, a soldering iron, solder, flux, tweezers, wire cutters, a Phillips screwdriver, a small flathead for the screw terminals, and CA glue for bonding the printed halves. Optionally putty, or baking soda and CA glue, for filling a seam.

## Do not buy

- **The USB-C receptacle `USB1` and the two CC pull-down resistors `R1` and `R2`.** They appear in the v3.0 BOM at quantity zero and the v3.9 board has no footprint for them at all. Power is `J4`. The reason is in <{{sign}}/build>.
- **The v2.1 board.** A different size; it will not fit the v3 cases. v2.x and v3 parts are not interchangeable in either direction.
- **Anything from `hardware/pcb/gerber/experiment/`.** Unverified work in progress.

## Substitutions

- **ESP32-S3 module:** Espressif is the reference part, and modules from other sellers generally work. If one needs a RESET press on every cold boot, a single 10k resistor from GPIO0 to 3.3 V on the module fixes it.
- **Encoders:** any 5-pin EC11 with a push switch works, as long as it fits the board and the enclosure. The cheapest packs fail more often. The firmware assumes the reference part's rotation direction, and direction is adjustable per knob on the device's own `/knobs` page afterwards.

## Choosing the LED panel

The panel is the one part that can silently kill the build. Patternflow scans it directly from the ESP32-S3, with no sending card and no receiving card, so the driver chips on the back of the panel decide whether it lights up at all. "HUB75E" on a listing promises a 16-pin ribbon, a pin order and 5 V, and says nothing about those chips. A panel that matches the specification line for line can sit completely black.

| Driver chips | Result |
| --- | --- |
| Plain shift-register: 74HC595, FM6124, ICN2037, DP5125D and similar | Works with no init sequence |
| Needs an init sequence the firmware sends: FM6126/FM6126A, ICN2038S, DP3246, MBI5124 and similar | Works, after building once with the matching profile |
| S-PWM "smart" or receiving-card chips: ICN2053, FM6353, FM6363, FM6373, DP3264, DP3265, ICND2055, MBI5051–5053 and similar | Cannot work. No firmware setting rescues them |

Three panels are recorded as actually run on Patternflow, all with no init sequence: FM6124 (the reference panel linked from the BOM), ICN2037 and DP5125D.

Before buying an off-script panel, read the **buyer reviews**, not the specification table. Search them for ESP32, Arduino, Raspberry Pi, HUB75, DMA, WLED or Pixelblaze, and open the review photos — buyers routinely photograph the back of the panel, where the driver chip is readable. The chip is almost never in the title, the spec table, a marketplace summary or the attached PDF manual, and that manual is generic factory boilerplate which, read literally, would reject a known-good panel.

Where you buy changes the odds. Maker retailers are usually fine. General marketplace "HUB75 P2.5 module" listings are mixed. Anything sold for Novastar, Huidu or Colorlight, or as rental-wall hardware, should not be bought — and a listing that leads with a refresh rate figure or names a sending-card brand is the bad kind.

To read the chip off a panel you already own: whichever part number repeats in a regular grid across the whole board, a dozen or more of the same part, is the LED driver. The one or two chips beside the HUB75 connector are buffers, almost always 74HC245 — mistaking that for the compatible 74HC595 is the common trap.

If you buy a panel other than the linked one, print the adjustable mount from `bed_256mm/for_other_panels/` instead. It adapts to varying bolt-hole positions, though a very different hole layout may still not fit, so check the mount before committing.

## Files

- The BOM: <https://github.com/engmung/Patternflow/blob/main/hardware/bom/bom_v3.9.csv>
- Which board revision is current: <https://github.com/engmung/Patternflow/blob/main/hardware/README.md>
- Panel compatibility in full: <https://github.com/engmung/Patternflow/blob/main/docs/panel-compatibility.md>
- Enclosure files and print settings: <https://github.com/engmung/Patternflow/blob/main/hardware/case/README.md>
