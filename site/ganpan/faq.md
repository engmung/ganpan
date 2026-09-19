---
title: Ganpan, frequently asked questions
summary: Differences from llms.txt, MCP and WebMCP, cost, why there is no QR code, language, what the name means, and other questions.
---
# Ganpan: frequently asked questions

Ganpan is a convention in which an owner puts up pages for a guest's AI to read (a sign) at `/ganpan` on the owner's own address, and the guest types that address into the AI they already use and starts talking. Statements about technology trends below reflect a survey done in September 2026.

## Does the owner have to build an AI or a chatbot?

No. The owner only puts up pages. The guest's AI does the inference, and the owner's inference cost is zero.

## How is it different from llms.txt?

llms.txt is a Markdown guide file at a site's root. It is mostly used for developer documentation, and it waits for crawlers to find it. Ganpan deals with the conversation that follows once a guest has deliberately given an address to their own AI. That includes a physical placard, today's information, a boundary statement, and owner's picks whose source shows. llms.txt helps a site get found. Ganpan covers what happens once the guest has arrived.

## There is MCP and WebMCP. Why is this needed?

MCP requires the user to connect a service beforehand. WebMCP is a draft used by an agent inside the browser, on an open tab. Neither reaches a guest who walked in off the street, with no prior setup, using a chat app on a phone. Ganpan addresses that situation. If a standard path for actions such as orders and reservations comes to cover it, Ganpan's action layer is planned to move there.

## Map apps already have shop information, don't they?

Map apps handle fixed information well: location, hours, the basic menu. A sign has finer-grained information, about a single work, a single object or a single day, and it comes first-hand from the owner with no platform processing it in between.

## Why is there no QR code?

A QR code opens a browser, and the conversation happens in the guest's AI chat. The conversation starts when the guest types the address into the chat. Sending a photo of the placard does not work well. In tests on 20 September 2026, ChatGPT, Claude and Gemini read the address in the photo and did not open it, and they tended to treat text in an image as a possible injection and become guarded. When the guest typed the same address, they opened it and the tone was friendly. The placard therefore has a short address printed in full and asks the guest to type it.

## Can a sign say "AI, behave like this"?

A sign does not give the AI a role or tell it what to recommend. AIs treat such sentences as injection and either ignore them or become guarded. A sign is written as description: what is where, and what guests often ask. The one exception in this sign is a single sentence marked as the owner's request, asking the AI to show piece addresses in a code block so the guest can copy them. People can see it, it gives its reason, and the AI is free to ignore it.

## Can an owner not even recommend their own menu?

They can, as long as the source shows, as in "Owner's pick". A sign has no hidden nudges.

## What language is a sign written in?

The owner's own language. The guest's AI translates into the guest's language. This sign is in English because the convention is addressed to readers in many countries.

## How do a guest's review or order reach the owner?

The AI drafts the content, and the guest reads it, edits it and presses send personally. The AI does not send data by itself. The screen for this has not been decided: it could be a pre-filled link, or a form to paste into.

## Which AIs does it work with?

In principle, reading works with any AI app that can open web pages. Each app has its own rules for which addresses it will open. Some open only addresses the user gave or a search returned, and some open without a warning only addresses already in a public web index. Some hosts also block AI traffic by default. The author ran one round of tests in the ChatGPT, Claude and Gemini apps on 20 September 2026, and the results are in "Where it stands". There is no per-app compatibility table yet.

## Is HTML or Markdown better for a sign?

HTML that shows its content without JavaScript is the baseline. A Markdown copy at the same address plus `.md` is recommended as an extra, because some AI reading tools ask for Markdown first. This sign publishes both.

## What if there is no domain?

Hosting at `ganpan.org/<slug>` is planned. It is an exception, and neither the intake process nor the way to confirm the real owner has been decided.

## What does it cost?

The convention is public, and a few static pages are enough. The text of the convention is licensed under CC BY 4.0. Putting up a sign that follows it needs no license and no credit.

## What does the name mean?

It is the Korean word "간판" (看板), the sign put up in front of a shop. It has the same Chinese-character origin as the Japanese word kanban. Shops have signs for people, and this is a sign for AIs.

## How is it related to BYOA?

The March 2026 record of this idea used the name BYOA (Bring Your Own Agent): <https://github.com/engmung/BYOA>. BYOA is already a widely used general term in the industry, so the convention does not use it as its name.

## How can the owner be contacted?

Through the issue tracker of the public repository: <https://github.com/engmung/ganpan/issues>. Questions, corrections and reports of how a sign behaved in a particular AI app all go there. No email address is published.
