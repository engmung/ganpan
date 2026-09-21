---
title: What Ganpan is
summary: The concept of Ganpan, three scenes of use (exhibition, shop, project), and how it differs from building an AI for a venue.
---
# What Ganpan is

Ganpan (간판, the Korean word for a shop sign) is a convention for putting up signage for AI agents. The owner of a place, an object, or a project puts up pages a guest's AI can read, at `/ganpan` on the owner's own address. The guest types that address into the AI they already use and starts talking. Shops have always had signs for people, and this is a sign for the AIs those people bring with them.

## The structure, turned around

When someone builds an AI for a shop or an exhibition, the builder ends up paying for inference, setting it up for each venue, and asking guests to learn an unfamiliar screen. Small venues cannot afford that. Seunghun Lee, who wrote this convention, says he ran into this while building Barai, an AI drink-recommendation agent for bars.

Ganpan turns that structure around. Guests already have an AI, so the owner builds none and only puts up something for the guest's AI to read. The guest's AI does the inference, and the owner's inference cost is zero.

## Three scenes of use

These scenes are designs. None of them has been validated in a real venue.

### Exhibition

A visitor reads the placard at the door and types its address into their own AI chat. The AI reads the exhibition's entrance page. When the visitor asks something in front of a work, the AI finds that work's piece, reads it and answers in a way that fits how the visitor talks and what they care about. If the visitor asks about something the sign does not contain, such as an intention the artist never stated, the AI can say it has not been published, because the sign states that boundary. At the end the AI can draft the visitor's impressions, and the visitor reads them, edits them and sends them personally.

### Shop

Map apps already handle fixed information such as the menu and the location. What a sign adds is today's information: what came in today, what is sold out, the owner's pick. A foreign guest's AI reads a Korean sign and answers in the guest's language. The owner's recommendation is written so that its source shows ("Owner's pick"), and the guest's AI passes it on as the owner's words while judging on the guest's behalf.

### Project

Someone sees an open-source project and wants to build it. If they tell an AI to search the web, it comes back with old forum posts mixed with information from other projects. If the maker has put up a sign, the AI follows the reading path the maker laid out. No physical placard is needed, only a link. Of the three scenes, this one was built first: the sign for Patternflow is at <https://ganpan.org/patternflow>.

## Two layers

- The reading layer is static pages and costs the owner almost nothing. It is the scope of convention v0.1.
- The action layer covers reviews, orders and reservations. For now these are handled as "the AI writes, the person sends": the AI drafts, and the person presses the button.

## Who it is for

It is for venues that cannot build their own AI: small shops, small exhibitions, solo makers. The situation it addresses is a guest who walked in off the street, with no prior setup, using a chat app on a phone. A first-time guest's AI does not know what this place is, and a sign tells it.
