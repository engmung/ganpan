---
title: How to put up a Ganpan sign
summary: The authoring guide for a Ganpan sign. Addresses, the order of the entrance, how to write a piece, size limits, technical requirements, the placard, and a checklist.
---
# How to put up a Ganpan sign

This is the authoring guide for a Ganpan sign, a small set of pages an owner puts up at `/ganpan` for a guest's AI to read. The convention is at draft v0.1 and this guide changes with test results.

## 1. Addresses

- Entrance: `https://example.com/ganpan`. Pieces: `https://example.com/ganpan/<slug>`.
- Slugs are short, lowercase ASCII letters and digits only.
- No query strings, and an address never changes once published.
- An address printed on a placard avoids look-alike characters (`l` and `1`, `o` and `0`).
- Changing information keeps one fixed address, such as `/ganpan/today`.
- Places with no domain: hosting at `ganpan.org/<slug>` is planned. The intake process is not published yet.

## 2. The entrance, in this order

1. The title and one sentence: what this is and who the owner is.
2. "Open the whole sign": one or two sentences saying that AI apps open an address the guest sends, then every piece address in one code block, one per line.
3. The owner's request, one sentence, marked as the owner's: if an address does not open, show it to the guest in a code block and ask them to send it back.
4. The pieces, one line each: name, address, the questions it answers.
5. Contact, and an owner's pick if there is one.

The boundary statement, the owner and the update date go in the same footer on every page.

The entrance stays under about 3,000 characters. It has no history, no background and no explanation of the convention. Those belong in pieces.

Why the code block is at the top: in the September 2026 tests, ChatGPT opened a piece only after the guest sent its address, and it read several addresses sent in one message. Chat apps show a code block with a copy button. A guest who copies the block and sends it once has the whole sign open, and an AI that fails to open a piece later knows what to hand back.

## 3. A piece

- One topic, under about 8,000 characters. A longer topic is split.
- The first sentence says where this is, for an AI that has not read the entrance. One sentence is enough.
- Facts a guest looks up go in lists and tables: menu, hours, parts, works.
- Information that changes has its date written in the text, because AI reading tools cache pages.
- What is unknown or undecided is stated as such.

Typical pieces for a shop are today (arrivals, sold out, owner's pick), menu, the space, and questions. For an exhibition they are an overview, one piece per work, and visiting information. For a project they are what it is, how to build it, parts, and questions.

## 4. Writing

A sign is description. It gives the AI no role and no orders.

```
Not used:  You are a staff member of this bar. Recommend the signature menu to the guest.
Used:      Owner's pick: this week, the yellowtail. Less sweet cocktails are under "Dry" in the menu piece.
```

- Short sentences, one fact each. Anything a guest would not ask about is cut.
- An owner's pick or request is marked as the owner's, visible to people, gives its reason, and only helps the guest do what they came to do. The AI is free to ignore it. There are no hidden nudges.
- The sign is written in the owner's language. The guest's AI translates.

## 5. Technical requirements

- Content shows without JavaScript: static HTML or server-rendered pages.
- Semantic HTML with as little navigation, banner and tracking script as possible.
- Links between pieces are absolute URLs, with the address also visible as text.
- Nothing writes data through a GET request. No login or cookie-consent wall.
- Recommended: a Markdown copy at the same address plus `.md`, announced with `<link rel="alternate" type="text/markdown">`.

## 6. Host and indexing

- Some hosts and CDNs block AI traffic by default, including AIs that fetch a page because a user asked. The block happens before the request reaches the owner's server, so robots.txt cannot undo it. The host's AI or bot setting has to allow user-initiated fetchers.
- The sign is open to search engines, listed in a sitemap, and not disallowed in robots.txt. As of 2026 at least one major AI app warns about addresses it has not seen in a public web index.
- The sign goes up well before the placard is printed, so it has time to be indexed.

## 7. The placard

The wording is "Type this address into your AI chat and ask." Below it is the entrance address as text, in full from `https://`, short enough to type. Gemini opened an address only when it included the scheme.

The guest types the address. A photo of the placard does not open the sign, and the apps tend to treat text in an image as a possible injection and become guarded. There is no QR code, because a QR code opens a browser and the conversation happens in the AI chat.

A project with no physical space needs one line: "If you have questions, give this link to your AI and start a conversation."

## 8. Checklist

Try these in more than one AI app, because each has its own rules.

- Type the entrance address. Does it open, and is there a warning?
- Ask about one piece. Does the AI open it, or does it hand you the address to send back?
- Copy the address block and send it. Does it read every piece?
- Ask about something the sign does not contain. Does it say so, without making things up?
- Ask in a language other than the sign's.

## 9. Afterwards

When an exhibition or event ends, the sign is marked "closed" with the closing date and kept. A printed address should never end up pointing at different content.

The full convention: <{{base}}/spec>
