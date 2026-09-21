# Ganpan

Signage for AI agents · AI를 위한 간판

Wouldn't it be nice if your project had an expert AI chatbot that explains it accurately?

But building one more chatbot is a chore for you, and using one more chatbot is a chore for everyone else.

So do the simple thing: make their AI the expert. The AI they already use every day becomes the expert on your project.

## How

You put up a few plain pages about your project, your shop or your exhibition, at `/ganpan` on your own address. That set of pages is a sign. A guest types the address into the AI they already use (ChatGPT, Gemini, Claude) and starts talking. Their AI reads your pages and answers from them, in the guest's language and at the guest's level. You build no chatbot and you pay for no inference.

*Ganpan* (간판) is the Korean word for a shop sign.

> Status: draft v0.1. It has not been validated in the field.

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22849147.svg)](https://doi.org/10.5281/zenodo.22849147)

## Try it

Type this address into your AI chat and ask what Ganpan is, in any language:

```
https://ganpan.org/ganpan
```

Type it, or paste it as text. AI apps open an address the user sends as text. They do not open one that arrives inside a photo.

## Read

- The convention: [SPEC.md](SPEC.md) (English, canonical) · [SPEC.ko.md](SPEC.ko.md) (한국어)
- The site: <https://ganpan.org>
- Background, decisions and survey notes with sources (Korean): [docs/CONTEXT.md](docs/CONTEXT.md)
- Test log (Korean): [docs/test-log.md](docs/test-log.md)
- A printable placard sample: [docs/placard.html](docs/placard.html)
- The earlier record of this idea, from March 2026: [engmung/BYOA](https://github.com/engmung/BYOA)

## This repository

This is the source of ganpan.org. The site has its own sign up: `site/ganpan/` is published at `ganpan.org/ganpan`.

```
SPEC.md          the convention (English), SPEC.ko.md in Korean
site/            ganpan.org: pages for people, and the sign for Ganpan itself
signs/<slug>/    hosted signs for places with no domain, published at ganpan.org/<slug>
template/        a starting point for a new sign (Korean)
tools/           the build (Markdown to script-free static HTML, plus convention checks) and a local server
docs/            context, test log, placard sample
```

```bash
npm run build
```

There are no dependencies. Node 20 or later is enough. The output goes to `dist/` and can be put on any static host. Pushing to `main` deploys it to GitHub Pages.

The build fails if a sign breaks the convention: a `<script>` tag, a link that is not an absolute URL, a query string on a sign address, a piece that the entrance does not link to, or a slug with anything other than lowercase ASCII letters and digits.

## Cite

Lee, Seunghun. (2026). *Ganpan: signage for AI agents* (convention, draft v0.1). Zenodo. <https://doi.org/10.5281/zenodo.22849147>

That DOI always resolves to the latest version. Version 0.1 alone is <https://doi.org/10.5281/zenodo.22849148>.

## Contact

Open an issue: <https://github.com/engmung/ganpan/issues>. Reports of how a sign behaved in a particular AI app are especially welcome.

## License

Text (the convention, the site, the docs) is CC BY 4.0. Code in `tools/` is MIT. The starter files in `template/` are CC0. Details are in [LICENSE.md](LICENSE.md). Putting up a sign that follows the convention needs no license and no credit.

Author: Seunghun Lee (이승훈)
