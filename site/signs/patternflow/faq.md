---
title: Patternflow, frequently asked questions
summary: Buying versus building, what it costs, soldering experience, licences and reselling, accounts, the community, and what is not settled yet.
---
# Patternflow, frequently asked questions

Patternflow is an open-source LED synthesizer played with four knobs, with its hardware files, firmware, enclosure and pattern workflow published. These are the questions that come up before and during a build. Licences, contributing and what is not settled are in <{{sign}}/project>; failures during a build are in <{{sign}}/trouble>.

## Do I have to build one, or can I buy it?

Both exist. Assembled units, DIY kits and custom enclosures have been offered through Crowd Supply; what is on offer now is on that page: <https://www.crowdsupply.com/engmung/patternflow>. Building it from the published files is the other route: <{{sign}}/build>.

## What does it cost to build?

US$100 to 200 in parts as of September 2026, plus about an hour of hands-on work and about ten hours of 3D printing. The breakdown and the full list are in <{{sign}}/parts>. A breadboard build at <https://patternflow.work/build/breadboard> is the cheaper way in, and the project treats it as a real Patternflow rather than a prototype.

## Do I need to know how to solder?

The build guide states no prior soldering experience is needed. Every joint is large through-hole, there are no surface-mount passives on the current revision, and the module plugs into sockets rather than being soldered. The breadboard route needs no soldering iron at all.

## Do I need a 3D printer?

For the standard enclosure, yes, or access to one. It prints on a 256 mm bed in about ten hours, and a larger bed prints the case in one piece with no bonding step. The enclosure and the electronics are separate choices, so other enclosures are possible; community variants live in the repository.

## Can I run it without hardware?

Yes, and a lot of people start there. The Live Editor at <https://patternflow.work/pattern> is a full simulator, the community wall plays every shared pattern under your cursor, and Pattern Lab generates, colours and exports in the browser. None of that needs a device.

## Do I need an account?

Browsing patterns, turning their knobs and assembling a deck need no account. Sending a pattern to your device, sharing, liking and forking need one, because building a module happens on a server. The account asks for a username and a password; no email is asked. Downloading a published deck as a zip needs no account either.

## Do I have to write code?

No. The Live Editor copies a prompt carrying every rule of a Patternflow pattern; you paste it into an AI assistant with a description of the look you want, and paste the code back. There is no GLSL and no rendering pipeline to touch. Writing one by hand is also supported and documented.

## How long does a pattern take to reach the panel?

Seconds. A pattern is compiled into a module of a few kilobytes and installed over Wi-Fi, with no cable, no reflash and no IDE. The firmware is rebuilt only for firmware development or for a panel of a different resolution.

## How is it powered, and how long does it run?

Through the `J4` screw terminal, from any 5 V supply that can give a couple of amps — usually a USB power bank, which is what the case compartment is sized for. About four hours per 10,000 mAh at maximum brightness with a typical pattern, and lowering the brightness extends that well beyond.

A pattern that fills the screen with white is a different case: it draws more current than a typical USB-A port is rated for, enough to make the connector warm. The repository's own measurement of that figure is marked as over-stated and awaiting a re-measurement, so no number is quoted here. Until a power clamp lands in the firmware, near-full-white patterns on a power bank are best avoided.

Power is never taken over USB-C. The reason is in <{{sign}}/build>.

## The venue has no Wi-Fi. Does it still work?

The patterns already on it play with no network at all: the knobs, the pattern list and the brightness are all on the device. What needs a network is putting new patterns on, and that needs the device and your computer on the same Wi-Fi. The network is set during flashing and reused on every boot, and there is no fallback hotspot or setup portal. Going somewhere without internet, download a deck as a zip beforehand and drop it on the board's Patterns page over a local network or a phone hotspot.

## Can I leave one running in a shop or a gallery? Is it certified?

Electrically it runs from any 5 V supply that can give a couple of amps, through `J4`; the published rating is 5 V DC, max 2.4 A. No mains-powered installation setup is documented in the repository, so there is no published guidance beyond that.

On certification: the compliance page lists the EU legislation that applies and states that the EU Declaration of Conformity is pending completion of testing. The radio module itself carries an FCC ID. That page is the authority: <https://patternflow.work/compliance>. It is a statement of scope, not a claim of conformity.

## Is it safe for everyone to look at?

Patternflow displays rapidly changing light patterns that may trigger seizures in people with photosensitive epilepsy. Anyone who feels discomfort should stop using it immediately. This warning belongs anywhere the device is shown in motion.

## Where do I ask a question?

Discord is the place for getting unstuck and for talking about where the project should go: <https://discord.gg/Vr9QtsxeTk>. GitHub issues are for things that change the repository. There is no support email for build help; replies come from the maintainer and from other builders, usually within a day or two. More on where each kind of question goes is in <{{sign}}/project>.
