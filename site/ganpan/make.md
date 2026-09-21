---
title: How to put up a Ganpan sign
summary: The authoring guide for a Ganpan sign. Addresses, the order of the entrance, how to write a piece, the start page and start prompt, size limits, technical requirements, the placard, and a checklist.
---
# How to put up a Ganpan sign

This is the authoring guide for a Ganpan sign, a small set of pages an owner puts up at `/ganpan` for a guest's AI to read. The convention is at draft v0.1 and this guide changes with test results.

## 1. Addresses

- Entrance: `https://example.com/ganpan`. Pieces: `https://example.com/ganpan/<slug>`.
- Slugs are short, lowercase ASCII letters and digits only.
- No query strings, and an address never changes once published.
- An address printed on a placard avoids look-alike characters (`l` and `1`, `o` and `0`).
- Changing information keeps one fixed address, such as `/ganpan/today`.
- `/ganpan/start` is the start page (section 4). It is not used as a piece slug.
- Places with no domain: hosting at `ganpan.org/<slug>` is planned. The intake process is not published yet.

## 2. The entrance, in this order

1. The title and one sentence: what this is and who the owner is.
2. "Open the whole sign": one or two sentences saying that AI apps open an address the guest sends, then every piece address in one code block, one per line.
3. One line telling people where the start page is.
4. The pieces, one line each: name, address, the questions it answers.
5. Contact, and an owner's pick if there is one.

The boundary statement, the owner and the update date go in the same footer on every page.

The entrance stays under about 3,000 characters. It has no history, no background and no explanation of the convention. Those belong in pieces.

Why the code block is at the top: in the September 2026 tests, ChatGPT opened a piece only after the guest sent its address, and it read several addresses sent in one message. Chat apps show a code block with a copy button. A guest who copies the block and sends it once has the whole sign open. This serves guests who typed the entrance address. Guests who come through the start page already send every address in their first message.

## 3. A piece

- One topic, under about 8,000 characters. A longer topic is split.
- The first sentence says where this is, for an AI that has not read the entrance. One sentence is enough.
- Facts a guest looks up go in lists and tables: menu, hours, parts, works.
- Information that changes has its date written in the text, because AI reading tools cache pages.
- What is unknown or undecided is stated as such.

Typical pieces for a shop are today (arrivals, sold out, owner's pick), menu, the space, and questions. For an exhibition they are an overview, one piece per work, and visiting information. For a project they are what it is, how to build it, parts, and questions.

## 4. The start page and the start prompt

The start page, `/ganpan/start`, is for people. It shows a first message to copy into an AI chat, with a copy button. A guest reaches it from the QR code on the placard or from a link. Because the guest sends the message, every address in it counts as one the guest gave, so apps open them all.

The start prompt has three parts:

1. One sentence in the guest's voice, written by the owner for each language: "I am at the OO exhibition." or "I am looking into Patternflow." It says that what follows is what the owner put up for AIs to read.
2. The map: each piece address on a line of its own, followed by one line on what it holds. The one-line descriptions come from the piece list in the entrance. When the whole sign is under about 3,000 characters, the prompt carries the text of the pieces itself. That works in apps that cannot open web pages.
3. The guest's requests: ask me briefly what I want to know, read only what is needed, explain at my level, say so when something is not there. If a page cannot be opened, do not guess: at the end of the reply, show me its address in a code block, ask me to send it back, and tell me that I only need to copy and paste it, not open it.

The pages are the owner's voice and the start prompt is the guest's voice. The prompt holds only what a guest would say for themselves. It has no recommendation and no nudge from the owner. Those stay on the pages, marked as the owner's. What the guest copies is exactly the text the page shows.

The page is short: two steps and one button. Press the button to copy the prompt, then open the AI app you already use and paste it. The prompt is folded away and can be opened to read, and the page shows one language at a time. It does not link into AI apps. Links that open ChatGPT or Claude with a prompt filled in did not hand off to the installed apps on a phone.

In the author's check on 22 September 2026, ChatGPT and Claude asked back and then opened the pieces they needed. Gemini opened only addresses in the guest's latest message, hence the last request. Whether Gemini follows it has not been checked.

## 5. Writing

A sign is description. It gives the AI no role and no orders, and it makes no request of the AI.

```
Not used:  You are a staff member of this bar. Recommend the signature menu to the guest.
Used:      Owner's pick: this week, the yellowtail. Less sweet cocktails are under "Dry" in the menu piece.
```

- Short sentences, one fact each. Anything a guest would not ask about is cut.
- An owner's pick is marked as the owner's, visible to people, and gives its reason. There are no hidden nudges.
- The sign is written in the owner's language. The guest's AI translates.

## 6. Technical requirements

- Content shows without JavaScript: static HTML or server-rendered pages.
- Semantic HTML with as little navigation, banner and tracking script as possible.
- Links between pieces are absolute URLs, with the address also visible as text.
- Nothing writes data through a GET request. No login or cookie-consent wall.
- Recommended: a Markdown copy at the same address plus `.md`, announced with `<link rel="alternate" type="text/markdown">`.

## 7. Host and indexing

- Some hosts and CDNs block AI traffic by default, including AIs that fetch a page because a user asked. The block happens before the request reaches the owner's server, so robots.txt cannot undo it. The host's AI or bot setting has to allow user-initiated fetchers.
- The sign is open to search engines, listed in a sitemap, and not disallowed in robots.txt. As of 2026 at least one major AI app warns about addresses it has not seen in a public web index.
- The sign goes up well before the placard is printed, so it has time to be indexed.

## 8. The placard

The wording is "Scan the code, copy the text, and paste it into your AI chat." The QR code holds the address of the start page. Below it is the fallback, "Or type this address into your AI chat", with the entrance address as text, in full from `https://`, short enough to type. Gemini opened an address only when it included the scheme.

The guest hands the text over themselves because a photo of the placard does not open the sign. In the September 2026 tests the apps read the address in the picture and did not open it, and they tended to treat text in an image as a possible injection and become guarded. When the guest typed the same address, they opened it and the tone was friendly.

A project with no physical space needs one line and a link to the start page: "Ask your AI about this."

## 9. Checklist

Try these in more than one AI app, because each has its own rules.

- Open the start page, copy the prompt, and send it. Does the AI ask what you want to know? Does it open the pieces it needs?
- Type the entrance address. Does it open, and is there a warning?
- Ask about one piece. Does the AI open it, or does it hand you the address to send back?
- Copy the address block and send it. Does it read every piece?
- Ask about something the sign does not contain. Does it say so, without making things up?
- Ask in a language other than the sign's.

## 10. Afterwards

When an exhibition or event ends, the sign is marked "closed" with the closing date and kept. A printed address should never end up pointing at different content.

The full convention: <{{base}}/spec>
