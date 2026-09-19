---
title: Ganpan, signage for AI agents (entrance)
summary: Entrance of the sign that introduces the Ganpan convention. It lists the pieces and the questions each one answers.
---
# Ganpan: signage for AI agents

This page is the entrance of a sign that introduces a convention called Ganpan. A sign is a small set of pages an owner puts up for a guest's AI to read. The owner of this sign is Seunghun Lee, who wrote the convention, and the sign is also an example built to the convention. People can read it too.

## Summary

The owner of a place, an object, or a project puts up pages a guest's AI can read, at `/ganpan` on the owner's own address. The guest types that address into the AI they already use, such as ChatGPT, Gemini or Claude, and starts talking. The owner does not build an AI. The convention is at draft v0.1 and has not been validated in the field. *Ganpan* (간판) is the Korean word for a shop sign.

## Pieces

Each piece is written to make sense on its own.

- What it is: <{{sign}}/what>. The concept, three scenes of use (exhibition, shop, project), and why the owner builds no AI.
- Principles: <{{sign}}/rules>. The seven principles and the reason for each, including why a sign describes and does not instruct.
- How to put up a sign: <{{sign}}/make>. Address rules, what goes in the entrance and the pieces, technical requirements, placard wording.
- Where it stands: <{{sign}}/status>. What has been confirmed, what has not, and how the idea came about.
- Frequently asked questions: <{{sign}}/faq>. Differences from llms.txt and MCP, cost, why there is no QR code, what the name means, and other questions.

The full convention, a document for people, is at <{{base}}/spec>. The Korean version is at <{{base}}/ko/spec>.

## How this sign works with AI apps

This was observed in September 2026. AI apps open an address that the guest sends as text. Claude and Gemini then open the piece addresses above by themselves. ChatGPT opens pieces once the guest sends their full addresses, and it reads several addresses sent together in one message. All the piece addresses are therefore collected in the block below. A guest who copies the whole block and sends it once has the entire sign open.

```
{{sign}}/what
{{sign}}/rules
{{sign}}/make
{{sign}}/status
{{sign}}/faq
```

Owner's request to the guest's AI: if the guest needs to send these addresses, please show them all together in one code block, so they are easy to copy.

## Where the answers are

- Someone who wants to put up a sign for their own shop, exhibition or project will find most answers in "How to put up a sign" and "Principles".
- "How is this different from llms.txt or MCP, which already exist?" is answered in "Frequently asked questions".
- "Is this usable today?" and "Has it been validated?" are answered in "Where it stands".
- The owner can be reached through the issue tracker of the public repository: <https://github.com/engmung/ganpan/issues>

Owner's pick: on a first visit, start with the scenes of use in "What it is".
