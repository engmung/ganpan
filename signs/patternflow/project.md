---
title: Patternflow licences, contributing and the state of the project
summary: What the licences allow, the trademark, how contributions and patterns are handled differently, where each kind of question goes, and what is not settled.
---
# Patternflow licences, contributing and the state of the project

Patternflow is an open-source LED synthesizer whose hardware files, firmware and pattern workflow are published. This piece covers the terms around the project rather than the instrument. What it is and how to build one are in <{{sign}}/what> and <{{sign}}/build>; the starting questions are in <{{sign}}/faq>.

## What licence is it under, and can I sell what I make?

Firmware and web code are MIT. Hardware, designs, documentation and the bundled patterns are CC BY-SA 4.0. A file's own licence header is the authority where one exists; folders are not licence boundaries.

Patterns published to the community are licensed by their author, either CC BY-SA 4.0 (the default) or CC BY 4.0. Both permit commercial use with credit, including putting a pattern on a club wall or a shop display. CC BY-SA additionally requires adaptations to stay under the same licence, and a fork can never be looser than what it came from.

"Patternflow" is a trademark of Seunghun Lee. The open-source licences grant rights to the code and the designs; they do not grant permission to use the name or the branding for your own commercial product.

## How do contributions work?

Builds, documentation fixes, sourcing tips, enclosure remixes, firmware features and host-software bridges are all welcome, and the contributing guide has one table of where each kind goes. Contributions are inbound equals outbound with no contributor agreement: sending something as a pull request, issue or Discord post licenses it CC BY-SA 4.0, with attribution kept in the code header.

Patterns are the exception. They do not come to the repository; they are published to the community wall, which is a different act under different terms.

## Where do I show a build I finished?

Fill in the "Share your build" form at <https://github.com/engmung/Patternflow/issues/new?template=share_build.yml>, or post it in Discord. It goes on the build map at <https://patternflow.work/inside>, where every pin is someone who built one from these files.

## Where do I ask a question?

Discord is the place for getting unstuck and for talking about where the project should go: <https://discord.gg/Vr9QtsxeTk>. GitHub issues are for things that change the repository — bugs, wrong or missing documentation, feature proposals. There is no support email for build help; replies come from the maintainer and from other builders, usually within a day or two. If Discord is blocked where you live, an issue is the documented fallback even for a plain question.

Exhibitions, installations, distribution and other commercial enquiries are a different route, at <https://patternflow.work/contact>.

## What is not settled

- A total-pixel-power clamp for near-full-white patterns is described as going into the firmware, and was not there when this page was written.
- Changing the panel resolution — a 64 x 64, or two panels chained for a bigger picture — is an open question, separate from driver-chip compatibility. It is not a documented capability.
- A discussion venue that works in places where Discord is blocked is planned and does not exist yet.
- Terms of use for publishing to the community are marked as not yet written.

Some things the published files simply do not answer: how bright the panel is in daylight, whether it runs hot or makes noise, boot time beyond "a second or two", and what the support position is for an assembled unit. Where this sign and the linked documents are silent, nothing has been published.

## Elsewhere

- The project site: <https://patternflow.work>
- The repository: <https://github.com/engmung/Patternflow>
- Everything a panel can do, one feature at a time: <https://patternflow.work/features>
- The journal, the whole process written up at least weekly: <https://patternflow.work/journal>
