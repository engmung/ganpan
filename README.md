# Ganpan

Signage for AI agents · AI를 위한 간판

Wouldn't it be nice if your project had an expert AI chatbot that explains it accurately?

But building one more chatbot is a chore for you, and using one more chatbot is a chore for everyone else.

So do the simple thing: make their AI the expert. The AI they already use every day becomes the expert on your project.

## How it works

1. You put up a few plain pages about your project, your shop or your exhibition, at `/ganpan` on your own address. That set of pages is a sign.
2. A guest scans the QR code on your placard, or follows a link, and lands on the sign's start page.
3. They press "Copy prompt" and paste it into the AI app they already use (ChatGPT, Gemini, Claude).
4. Their AI reads your pages and answers from them, in the guest's language and at the guest's level.

You build no chatbot and you pay for no inference. The guest copies and pastes because AI apps open the addresses a person sends with their own hands. In the tests they did not open an address that arrived inside a photo.

*Ganpan* (간판) is the Korean word for a shop sign. 한국어 소개는 <https://ganpan.org/ko>.

> Status: draft v0.1. The author tried it in the ChatGPT, Claude and Gemini apps on a phone in September 2026. It has not been validated in the field.

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22849147.svg)](https://doi.org/10.5281/zenodo.22849147)

## Try it

Open the start page, press "Copy prompt", and paste it into your AI app:

```
https://ganpan.org/ganpan/start
```

Signs that are up:

- Ganpan itself: <https://ganpan.org/ganpan> · [start page](https://ganpan.org/ganpan/start) · [placard](https://ganpan.org/ganpan/placard)
- Patternflow, an open-source LED synthesizer: <https://ganpan.org/patternflow> · [start page](https://ganpan.org/patternflow/start) · [placard](https://ganpan.org/patternflow/placard)

## Make a sign

The authoring guide is at <https://ganpan.org/ganpan/make>. A sign is a handful of Markdown files. Copy [site/template/](site/template/), write the entrance and the pieces, and build:

```bash
node tools/build.mjs
```

The output in `dist/` is static HTML with no scripts, and it goes on any static host. There are no dependencies. Node 20 or later is enough. For each sign the build also makes:

- a start page with the copy button. The first message comes from a fixed template, and what the guest copies is exactly what the page shows
- a QR code of the start page, `start-qr.png` and `start-qr.svg`
- a placard to print

Your own coding agent (Claude Code, Cursor, Codex) can write the sign for you. Point it at [docs/agent-playbook.md](docs/agent-playbook.md): it interviews you, proposes the pieces, writes them, runs the checks and prepares the pull request. In Claude Code the command is `/new-sign`.

A place with no domain can have its sign hosted at `ganpan.org/<slug>`. See [Contributing](#contributing).

The QR generator also works on its own, with no login and no short link in between:

```bash
node tools/qr.mjs "https://example.com/ganpan/start" qr.png
```

## Read

- The convention: [docs/SPEC.md](docs/SPEC.md) (English, canonical) · [docs/SPEC.ko.md](docs/SPEC.ko.md) (한국어) · on the site at <https://ganpan.org/spec>
- Background, decisions and survey notes with sources (Korean): [docs/CONTEXT.md](docs/CONTEXT.md)
- Test log (Korean): [docs/test-log.md](docs/test-log.md)
- The earlier record of this idea, from March 2026: [engmung/BYOA](https://github.com/engmung/BYOA)

## This repository

This is the source of ganpan.org. Pushing to `main` builds it and deploys it to GitHub Pages.

```
docs/    the convention, background, test log, the playbook for agents
site/    what ganpan.org serves: pages for people, the sign for Ganpan itself (ganpan/),
         hosted signs (signs/<slug>/), and the starter template (template/)
tools/   the build, the checker for owner-written text, the QR generator, their tests, a local server
```

The build fails if a sign breaks the convention: a `<script>` tag, a link that is not an absolute URL, a query string on a sign address, a piece that the entrance does not link to, a slug with anything other than lowercase ASCII letters and digits, or characters a person cannot see. Phrases aimed at the AI are printed as notes for the reviewer. A person reads every hosted sign before it goes up.

## Contributing

There is no upload service. Reports of how a sign behaved in an AI app, proposals for hosted signs, and bad texts that get past the checker all come in through issues and pull requests, and the maintainer reviews them by hand. See [CONTRIBUTING.md](.github/CONTRIBUTING.md).

Contact: open an issue at <https://github.com/engmung/ganpan/issues>.

## Cite

Lee, Seunghun. (2026). *Ganpan: signage for AI agents* (convention, draft v0.1). Zenodo. <https://doi.org/10.5281/zenodo.22849147>

That DOI always resolves to the latest version. Version 0.1 alone is <https://doi.org/10.5281/zenodo.22849148>.

## License

Text (the convention, the site, the docs) is CC BY 4.0. Code in `tools/` is MIT. The starter files in `site/template/` are CC0. The licenses do not cover the name. Details are in [LICENSE.md](LICENSE.md). Putting up a sign that follows the convention needs no license and no credit.

Author: Seunghun Lee (이승훈)
