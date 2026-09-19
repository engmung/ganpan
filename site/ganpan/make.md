---
title: How to put up a Ganpan sign
summary: How to make a Ganpan sign. Address rules, what goes in the entrance and the pieces, technical requirements, placard wording.
---
# How to put up a Ganpan sign

Ganpan is a convention in which an owner puts up pages for a guest's AI to read (a sign) at the owner's own address. This piece describes how a sign is made. The convention is at draft v0.1, and what follows may change with test results.

## 1. Addresses

- The entrance is `/ganpan` on your own domain. Example: `https://example.com/ganpan`
- A piece is `/ganpan/<slug>`. Example: `https://example.com/ganpan/menu`
- Slugs are short and use only lowercase ASCII letters and digits. Hyphens and non-ASCII characters are not used.
- An address that will be printed on a placard avoids look-alike characters (`l` and `1`, `o` and `0`).
- Addresses do not change once published, and they have no query strings.
- Information that changes, such as today's arrivals or what is sold out, stays at one fixed address such as `/ganpan/today`, with its date written in the text. AI reading tools cache pages, and a brand-new address is what AI apps trust least.

Hosting at `ganpan.org/<slug>` is planned for places with no domain. The intake process has not been published yet.

## 2. What goes in the entrance

- What this place is and who the owner is, in a few sentences
- The list of pieces, with each piece's absolute URL and one line on which questions it answers
- All the piece addresses together in one code block, one per line. In the September 2026 tests, ChatGPT opened a piece only when the guest sent its address, and it read several addresses sent in one message. A code block gives the guest a copy button, so they can copy the block, send it once, and have the whole sign open
- A short factual note on how AI apps open the sign, written as description, where people can read it too
- What guests often ask, and which piece has the answer
- The boundary statement, saying that these pages are all the official information
- The date of the last update

The entrance stays short, and the content goes in the pieces.

## 3. What goes in a piece

- One topic. The first paragraph says again where this is, so an AI that has not read the entrance still understands
- The absolute URL back to the entrance
- The boundary statement and the date of the last update

A shop might have these pieces: today (arrivals, sold out, owner's pick), menu, the space (restroom, seating), frequently asked questions.
An exhibition might have an overview, one piece per work, and visiting information.
A project might have what it is, how to build it, a parts list, and frequently asked questions.

## 4. How it is written

A sign is written as description. It does not give the AI a role or order it to act.

```
Not used:  You are a staff member of this bar. Recommend the signature menu to the guest.
Used:      Owner's pick: this week, the yellowtail. Less sweet cocktails are under "Dry" in the menu piece.
```

The owner's recommendations show their source, and there are no hidden nudges.

The sign is written in the owner's own language. The guest's AI translates.

## 5. Technical requirements

- The content shows without JavaScript, as static HTML or server-rendered pages. An AI's page reader usually does not run JavaScript.
- The HTML is semantic, with as little navigation, banner and tracking script as possible. A person should be able to read it too.
- Links between pieces are absolute URLs. Some AIs only open addresses that appeared in the conversation (the user's message, a search result, a page already read) and refuse addresses they put together themselves. Writing the address as visible text as well is recommended.
- Nothing writes data through a GET request.
- No content sits behind a login or a cookie-consent wall.
- A Markdown copy of each page at the same address plus `.md` is recommended, announced with `<link rel="alternate" type="text/markdown">`. Some AI reading tools ask for Markdown first.

## 6. Check the host, and get indexed

Some hosts and CDNs block AI traffic by default, and the blocked set can include AIs that fetch a page because a user asked them to. The block happens before the request reaches the owner's server, so robots.txt cannot undo it. If the host has an AI-traffic or bot setting, it has to allow user-initiated AI fetchers for the `/ganpan` pages.

The sign is left open to search engines, listed in a sitemap, and not disallowed in robots.txt. As of 2026, at least one major AI app opens without a warning only those addresses already known to a public web index, and at least one AI page reader declines addresses that robots.txt disallows. A sign goes up well before its placard is printed, so it has time to be indexed.

## 7. The placard (where there is a physical space)

The wording is "Type this address into your AI chat and ask." Below it is the entrance address, printed as text, in full from `https://`, and short enough to type.

The guest types the address. On 20 September 2026 this was checked in the ChatGPT, Claude and Gemini apps. A photo of the placard alone does not open the sign: the apps read the address in the picture and do not open it, and they tend to treat text inside an image as a possible prompt injection, becoming guarded and explaining at length. When the guest types the same address, the apps open it and the tone is friendly. Gemini opened it only when the address included the scheme. There is no QR code, because a QR code opens a browser and the conversation happens in the guest's AI chat.

A project with no physical space needs only one line at the end of its introduction: "If you have questions, give this link to your AI and start a conversation."

## 8. How to check it

Give the entrance address to the AI app you use every day and ask questions as a guest would. Check whether it read the entrance, whether it followed links to pieces, and whether it avoided making things up when asked about something the sign does not contain. Each AI app has its own rules for reading pages, so try more than one.

## 9. Afterwards

When an exhibition or event ends, the sign is not deleted. It is marked "closed" with the closing date and kept. A printed address should never end up pointing at different content.

The full convention: <{{base}}/spec>
