---
title: Where Ganpan stands
summary: What has been confirmed about Ganpan, what has not, and how the idea came about.
---
# Where Ganpan stands

Ganpan is a convention in which an owner puts up pages for a guest's AI to read (a sign) at the owner's own address. This piece describes the state of the convention as of 20 September 2026.

## Summary

There is a concept, prototype experiments, and one round of app tests by the author. There has been no field validation with a real venue and real guests.

## What has been confirmed

- In March 2026, an exhibition prototype confirmed the reading behavior across several AIs: given an address, the AI reads the page and answers from its content.
- In Proxy_AIArt, an experiment from the same period, a page tried to have visiting AIs leave a review. Each AI allowed different things, and in some cases having the AI carry data out in a URL was refused or blocked. The principle "the AI writes, the person sends" comes from this.
- On 20 September 2026 this sign was tested in the ChatGPT, Claude and Gemini apps. None of them opened an address that arrived only inside a photo, even a full link, and they tended to treat text in an image as a possible injection and become guarded. All three opened the address once the user typed it, and the tone became friendly. Claude and Gemini then opened the pieces by themselves. ChatGPT opened a piece only after the user sent that piece's full address. The apps trust an address the user gave with their own hands.
- The entrance of this sign lists all piece addresses in one code block and has one sentence marked as the owner's request about showing addresses in a code block. When the author checked, copying the block and sending it once opened the pieces, and the apps did not become guarded at the request. This was one check by one person.
- One experiment failed because of a one-character difference in a domain name. The rule to keep addresses short and unambiguous comes from this.

## What has not been confirmed

- Whether a person who sees the placard takes out their own AI at all. This is the biggest unknown.
- Whether guests are willing to type an address into their AI chat, which is what the placard asks of them.
- Whether an entrance plus pieces gives more accurate answers than one long page. The comparison test is still being planned.
- There is no per-app compatibility table yet.

A planned use at an exhibition did not happen because the exhibition was cancelled.

## On prior cases

Within the range surveyed, no earlier deployed case was found in which a venue owner puts up only AI-readable pages and guests bring their own AI. That is the result of a handful of mostly English-language searches and does not prove that none exists. In the museum AI-guide cases that were found, the institution built and provided the AI. Work on making the web readable for AIs (llms.txt, MCP, WebMCP, NLWeb, Markdown content negotiation) is already under way in many places, and Ganpan builds on it.

## How it came about

- Barai was an AI drink-recommendation agent for bars. Through it the author found that building an AI for a venue puts all the cost and setup on the builder.
- Proxy_AIArt (March 2026) was an exhibition work that tried having visitors' AIs leave reviews at the exhibition.
- BYOA (March 2026) is a public record of the idea that exhibition visitors give an address to their own AI and use it as a docent: <https://github.com/engmung/BYOA>
- Ganpan (September 2026) restates the idea as a convention that covers shops and projects as well as exhibitions. "BYOA" was already a general industry term, so it was not used as the name.

## Next

The next sign is planned for Patternflow, an open-source LED synthesizer project, followed by a bar and then a temporary exhibition. When this piece was written, none of those signs was up.
