---
title: The seven principles of Ganpan
summary: The seven principles of the Ganpan convention and the reason behind each.
---
# The seven principles of Ganpan

Ganpan is a convention in which an owner puts up pages for a guest's AI to read (a sign) at `/ganpan` on the owner's own address. This piece lists the principles of the convention and the reason for each.

## 1. Inform, do not steer

An owner's recommendation is written so that its source shows, as in "Owner's pick: this week, this one". A sign contains no hidden nudges that only the AI sees, no sentences that push the expensive item, and no sentences that run down a neighbor.

The pages are the owner's voice, and the start prompt that a guest copies into their AI chat is the guest's voice. AI apps trust what the guest sends, so the start prompt holds only what a guest would say for themselves: which addresses hold what, and requests such as "ask me what I want to know". It has no recommendation and no nudge from the owner. Those stay on the pages, marked as the owner's, where the AI can tell who is speaking.

Reason: the guest's AI is on the guest's side. If signs start trying to steer AIs, AIs will start distrusting signs in general, and honestly written signs will be buried with the rest. Web search has already been through this.

## 2. Describe, do not instruct

A sign does not say "You are a docent, do this". It says "This exhibition has five sections, and the details are at this address".

Reason: AI vendors are moving toward ignoring instructions found inside fetched pages, and sentences in which a page tells the AI what to do are exactly what gets blocked. Reading a page the user handed over and answering from its content is a normal function of an AI. If the section layout, the location of details, the frequently asked questions and routes by interest are described as data, an AI will ask follow-up questions, follow links and tailor its explanation with nothing more than that.

## 3. A light entrance, self-contained pieces

The entrance is a short index. Each piece makes sense on its own, and an answer is one or two hops from the entrance.

Reason: an AI does not read everything, and long pages can get cut off. It has to be able to find the piece it needs and read that.

## 4. State the boundary

The sign states, as a fact, that these pages are all the official information and that anything absent has not been published.

Reason: when the boundary is written down, an AI can answer "that has not been stated" and has no gap to fill with invention.

## 5. The AI writes, the person sends

When something goes out, such as a review or an order, the person presses the last button. A sign does not have the AI carry data out in a URL.

Reason: in a March 2026 experiment (Proxy_AIArt), a page asked visiting AIs to leave a review through a GET request. Depending on the AI, the request was treated as an injection and refused, or blocked by the system. If a page can make an AI act, a malicious page can too, so the refusal was correct behavior.

## 6. Guests bring their own AI

The owner builds no AI, and the owner's inference cost is zero.

Reason: this is what makes it possible for a small shop.

## 7. A sign hangs at the owner's address

The address is `/ganpan` on the owner's own domain. A place with no domain is hosted at `ganpan.org/<slug>`, as an exception.

Reason: the address shows that the owner put the sign up. Signs are not collected in one central place.

The full convention: <{{base}}/spec>
