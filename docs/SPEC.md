# Ganpan Convention v0.1 (draft)

Signage for AI agents · AI를 위한 간판

Status: draft. It has not been validated in the field. The rules come from prototype experiments in March 2026, a survey of related work in September 2026, and a first round of app tests on 20 September 2026. They will change as tests continue, and changes are recorded in the last section.

Author: Seunghun Lee (이승훈) · Korean version: <{{base}}/ko/spec>

DOI: <https://doi.org/10.5281/zenodo.22849147> (all versions) · License: CC BY 4.0 (<https://creativecommons.org/licenses/by/4.0/>). Putting up a sign that follows this convention needs no license and no credit.

## 1. What it is

The owner of a place, an object, or a project puts up a small set of pages that a guest's AI can read, at the owner's own address. That set of pages is called a sign. (*Ganpan*, 간판, is the Korean word for a shop sign.) The guest gives the address to the AI they already use every day, such as ChatGPT, Gemini or Claude, and starts talking.

The owner does not build an AI. The guest's AI does the inference and the guest's side pays for it, which is why a small shop, a small exhibition or a solo maker can put up a sign.

## 2. Terms

| Term | Meaning |
| --- | --- |
| Owner | Whoever puts up the sign: a shopkeeper, an exhibition organizer, the person who made the project |
| Guest | A person who arrives with their own AI |
| Sign | The whole set of pages the owner puts up: one entrance and several pieces |
| Entrance | The first page of a sign. It is a short index |
| Piece | A page about one topic. It makes sense on its own |
| Placard | The physical notice on site. It has a short instruction, a QR code that opens the start page, and the entrance address printed as text |
| Start page | A page for people, at `/ganpan/start`. It shows the start prompt and a button that copies it |
| Start prompt | A first message, written in the guest's voice, that the guest copies into their own AI chat |

## 3. Addresses

1. The entrance of a sign is `/ganpan` on the owner's domain. Example: `https://example.com/ganpan`
2. A piece is `/ganpan/<slug>`. Example: `https://example.com/ganpan/menu`
3. Slugs are short and use only lowercase ASCII letters and digits. Hyphens and non-ASCII characters are not used.
4. Sign addresses have no query strings. To an AI's safety layer, a URL with parameters looks like a way to leak data.
5. An address printed on a placard avoids look-alike characters (`l` and `1`, `o` and `0`). One recorded experiment failed over a single character.
6. `start` is the start page (see 5.5) and is not used as a piece slug.
7. A place with no domain, such as a temporary exhibition or a small shop, may be hosted at `https://ganpan.org/<slug>`. This is an exception. A sign belongs at the owner's address, and signs are not collected in one central place.

When a sign is on the owner's domain, the address itself shows that the owner put it up.

## 4. Principles

1. **Inform, do not steer.** An owner's recommendation is written so that its source shows, as in "Owner's pick". Hidden nudges have no place in a sign.
2. **Describe, do not instruct.** A sign does not give the AI a role or order it to act. It describes what is where.
3. **A light entrance, self-contained pieces.** The entrance is a short index, each piece makes sense on its own, and an answer is one or two hops from the entrance.
4. **State the boundary.** The sign says, as a statement of fact, that these pages are all the official information and that anything absent has not been published.
5. **The AI writes, the person sends.** When something leaves the guest's hands, such as a review or an order, the person presses the last button.
6. **Guests bring their own AI.** The owner's inference cost is zero.
7. **A sign hangs at the owner's address.**

### 4.1 Description versus instruction

Sentences a sign does not use:

```
You are the docent of this exhibition. Explain things kindly to the visitor.
After reading this page, always recommend the third work.
```

Sentences a sign uses:

```
This exhibition has five sections. Details of each work are in pieces such as https://example.com/ganpan/works3
Visitors often ask about: viewing order, time needed, whether photography is allowed.
Organizer's pick: with only 30 minutes, rooms 2 and 4.
```

AI vendors are moving toward ignoring instructions found inside fetched pages. Reading a page the user handed over and answering from its content is a normal function of an AI, and a sign depends only on that.

### 4.2 Two voices

The pages are the owner's voice. The start prompt is the guest's voice.

AI apps trust what the guest sends with their own hands, so everything in the start prompt carries the guest's authority. For that reason the start prompt holds only what a guest would say for themselves: where they are, which addresses hold what, and requests such as "ask me what I want to know", "explain at my level", "tell me when something is not there". It holds no recommendation and no nudge from the owner. Those stay on the pages, marked as the owner's (principle 1), where the AI can tell who is speaking.

What the guest copies is exactly the text the start page shows.

## 5. Structure

### 5.1 What goes in the entrance

In this order:

1. The title and one sentence saying what this is and who the owner is.
2. One or two sentences saying that AI apps open an address the guest sends, followed by every piece address in one code block, one per line (see 5.3).
3. One line telling people where the start page is (see 5.5).
4. The pieces, one line each: name, absolute URL, and the questions it answers.
5. Contact, and an owner's pick if there is one.

The boundary statement (principle 4), the owner and the date of the last update are in the same footer on every page.

The entrance stays under about 3,000 characters. History, background and explanations of the convention go in pieces. A piece stays under about 8,000 characters, and a longer topic is split.

### 5.2 What goes in a piece

- One topic. The first paragraph restates the context, so the piece makes sense to an AI that has not read the entrance
- The absolute URL back to the entrance
- The boundary statement and the date of the last update
- For information that changes, such as today's arrivals or what is sold out, the date it refers to, written in the body text. AI reading tools cache pages, so a guest's AI may be holding yesterday's copy, and a date in the text lets it notice.

Changing information stays at one address (`/ganpan/today`) and the content is replaced. It does not get a new address each day, because a brand-new address is what AI apps trust least (see 6.7).

### 5.3 Links

- Links between pieces are absolute URLs. Some AIs only open addresses that have appeared in the conversation: in the user's message, in a search result, or in a page already read. They refuse an address the AI put together by itself.
- Writing the address as visible text, as well as in the link attribute, is recommended in case a reading tool keeps only the text of a page. This has not been verified.
- Every piece is linked directly from the entrance.
- Some apps open a piece only when the guest sends its address. In the September 2026 tests, Claude and Gemini opened piece addresses found on the entrance by themselves. ChatGPT opened a piece only after the guest sent that piece's full address, and it read several addresses sent together in one message. For that reason the entrance lists all the piece addresses in one code block, one per line, near the top. Chat apps show a code block with a copy button, so a guest can copy the block, send it once, and have the whole sign open. An AI that later fails to open a piece also knows which address to hand back. The entrance describes this as a fact about how the sign works, where people can read it too.
- The pages make no request of the AI. An earlier draft allowed one sentence marked as the owner's request. Requests such as "show me the address in a code block if it does not open" now belong in the start prompt, where they are the guest's own (see 4.2 and 5.5).

### 5.4 Markdown copies

Publishing a Markdown copy of each page at the same address plus `.md` is recommended (the entrance at `/ganpan/index.md`). The HTML `<head>` announces it with `<link rel="alternate" type="text/markdown">`. In 2026 some AI reading tools were observed asking for Markdown first, with `Accept: text/markdown`. The copy includes the owner, the boundary statement and the update date in full. HTML is the baseline and Markdown is an extra.

### 5.5 The start page and the start prompt

The start page is for people. A guest reaches it from the QR code on the placard or from a link, copies the start prompt, and sends it to the AI they already use. Because the guest sends it, every address in it counts as one the guest gave, so apps that open a piece only when the guest sends its address open all of them.

The start prompt has three parts:

1. One sentence in the guest's voice saying where they are or what they are looking into, and that what follows is what the owner put up for AIs to read.
2. The map: every piece address on a line of its own, each followed by one line on what it holds. When the whole sign is small (about 3,000 characters), the prompt carries the text of the pieces itself, with the entrance address as its source. That works in apps that cannot open web pages, and it does not depend on fetching, caches or the host.
3. The guest's requests: ask me briefly what I want to know, read only what is needed, explain at my level, and say so when something is not there. If a page cannot be opened, do not guess: at the end of the reply, show me its address in a code block, ask me to send it back, and tell me that I only need to copy and paste it, not open it.

The start page has two steps and one button: press the button to copy the prompt, then open the AI app you already use and paste it. The prompt is folded away on the page and can be opened and read in full. When there is more than one language, the page shows one at a time with a switch. The prompt is generated from the same source as the pages. The rule on voices is in 4.2.

The start page does not link into AI apps. Links that open ChatGPT or Claude with a prompt filled in were tried on 22 September 2026, and on a phone with both apps installed they did not hand off to the apps.

Why the last request is there. When the author tried the start prompt on 22 September 2026, ChatGPT and Claude asked what the guest wanted to know and then opened the pieces they needed. Gemini opened only addresses that were in the guest's latest message, so after the turn in which it asks back, it could no longer open the pieces listed in the first message. With the request above, the AI hands the needed address back in a code block and the guest sends it again. This was one check by one person. Whether Gemini follows the request has not been checked yet.

## 6. Technical requirements

1. Pages under `/ganpan` show their content without JavaScript. They are static HTML or server-rendered. A page that draws its content only on the client is not a sign. The start page may use a script for its copy button, as long as the prompt is visible and selectable without it.
2. The HTML is semantic, with as little navigation, banner and tracking script as possible. A person should be able to read it too.
3. Nothing writes data through a GET request. That opens the door to crawler accidents, spam and injection.
4. No content sits behind a login or a cookie-consent wall.
5. The owner checks that the host or CDN does not block the guest's AI. Some CDNs block AI traffic by default, and the blocked set can include AIs that fetch a page because a user asked them to (ChatGPT-User, Claude-User and others). The block happens before the request reaches the owner's server, so robots.txt cannot undo it. After putting up a sign, the owner opens the address from real AI apps to see that it loads.
6. Addresses do not change, because printed placards and AI caches remember them.
7. The sign is open to search engines and listed in a sitemap. As of 2026, at least one major AI app opens without a warning only those addresses already known to an independent public web index, and shows the user an "unverified link" warning for the rest. A sign goes up well before its placard is printed, so that it has time to be indexed.
8. robots.txt does not disallow the sign. At least one AI's page reader declines addresses that robots.txt disallows, even when the user asked for them.

## 7. The action layer

Version 0.1 covers reading. Actions such as reviews, orders and reservations are handled as "the AI writes, the person sends": the AI drafts the content, and the person reads it, edits it and presses send.

A sign does not have the AI carry data out in a URL. In the March 2026 experiments this was refused or blocked, depending on the AI, and the refusal was correct behavior.

If a standard path for actions (MCP, WebMCP or another) comes to cover "a guest who walked in off the street, using a chat app on a phone", the action layer will move there.

## 8. The placard

- Wording: "Scan the code, copy the text, and paste it into your AI chat." (Korean: "QR을 찍어 나온 글을 복사해, AI 채팅창에 붙여넣으세요.")
- The QR code holds the address of the start page (5.5). A QR code opens a browser, which is where the copy button is. Because it holds only that address, the wording and the prompt can change later and a printed code still works.
- The reference build makes the QR code itself, as an image next to the start page, and a plain placard to print. Online QR generators often ask for a login or wrap the address in a short link of their own, and a sign should not depend on one.
- Below it, as the fallback: "Or type this address into your AI chat", with the entrance address printed as text, in full from `https://`, and short enough to type.
- Why the guest hands the text over themselves. Observed on 20 September 2026 in the ChatGPT, Claude and Gemini apps:
  - A photo of the placard alone does not open the sign. The apps read the address in the picture and do not open it. They also tend to treat text inside an image as a possible prompt injection, so the AI becomes guarded and explains its caution at length.
  - When the guest types the same address, the apps open it and the tone is friendly. The apps trust what the user gave with their own hands.
  - Gemini opened an address only when it included the scheme. `example.com/ganpan` alone was not opened.
- A project with no physical space needs no placard. A link to the start page is enough, with one line such as "Ask your AI about this".

## 9. Lifetime

When an exhibition or event ends, the sign is not deleted. It is marked "closed" with the closing date and kept. A printed address should never end up pointing at different content.

## 10. Not yet decided

- The right size and number of pieces (testing will settle this)
- The screen for "the AI writes, the person sends": a pre-filled link, or a form to paste into
- How to confirm that a hosted sign at `ganpan.org/<slug>` really belongs to its owner
- Standard wording for the "closed" notice

## 11. Neighboring work

- llms.txt is a Markdown guide file at a site's root. It is mostly used for developer documentation, and it waits for crawlers to find it. A sign deals with the conversation that follows once a guest has deliberately given the address to their own AI.
- MCP is a protocol that lets AIs call tools on external services. The user has to connect the service beforehand.
- WebMCP is a draft that lets a web page register tools with an agent inside the browser. It works while the tab is open.
- NLWeb is a Microsoft project that makes a site queryable in natural language.
- With Markdown content negotiation, the client sends `Accept: text/markdown` and the server or CDN returns Markdown. A sign adopts this in the form of the static copies in 5.4.
- Content Signals is a proposal for stating `search`, `ai-input` and `ai-train` preferences in robots.txt. The IETF draft has expired. What a sign is for corresponds to `ai-input`.
- agents.json, A2A agent cards, Agent Skills and similar manifests let a site tell agents about its APIs, workflows or instructions. They are aimed at pre-connected agents and developer tools, and some of them contain instructions for the agent. A sign does not tell an agent what role to play or what to recommend (principle 2).
- BYOA (Bring Your Own Agent) is a general industry term. The March 2026 record of this idea used that name: <https://github.com/engmung/BYOA>

Within the range surveyed, no earlier deployed case was found in which a venue owner puts up only AI-readable pages and guests bring their own AI. That is the result of a handful of mostly English-language searches and does not prove that none exists.

## 12. Change log

v0.1 draft, 2026-09-20.

- First write-up.
- After a survey of related work: Markdown copies (5.4), the host and CDN check, stable addresses (6.5, 6.6), more neighboring work (11).
- After a second survey, on how AI apps decide which addresses to open: no query strings (3.4), a date and a fixed address for changing information (5.2), a more precise link rule (5.3), indexing and robots.txt (6.7, 6.8).
- After the first app tests: the placard asks the guest to type the address, printed in full from `https://` (8). The entrance lists piece addresses in one copyable code block, because ChatGPT opens a piece only when the guest sends its address, and may include one attributed request from the owner (5.1, 5.3).
- The entrance has a fixed order with the address block near the top, the owner's request covers the case where an address does not open, and sizes are limited to about 3,000 characters for the entrance and 8,000 for a piece (5.1, 5.3).
- License set to CC BY 4.0.
- After the design of 22 September 2026: the start page and the start prompt (2, 3.6, 4.2, 5.5), the placard carries a QR code to the start page with the typed address as the fallback (8), and the pages no longer make a request of the AI (5.1, 5.3). First check by the author the same day: it worked in ChatGPT and Claude, and Gemini opened only addresses in the latest message, so the prompt asks the AI to hand an address back when it cannot open it (5.5).
