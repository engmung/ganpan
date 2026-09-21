<!-- 한국어로 써도 됩니다. -->

## What this changes

<!-- One or two sentences. -->

## If this adds or changes a hosted sign (`signs/<slug>/`)

- [ ] I am the owner of this place or project, or I have the owner's permission.
- [ ] The pages describe. They give the AI no role, no orders and no requests.
- [ ] Any recommendation is marked as the owner's, where a person can see it.
- [ ] Nothing works against the guest: no pushing of the expensive item, no running down of a neighbor, nothing kept from the guest.
- [ ] `start.intro` is one sentence a guest would say for themselves. It has no recommendation and no address.
- [ ] The boundary statement in `sign.json` is true: these pages are all the owner has published.
- [ ] `node tools/build.mjs` passes on my machine.

## If this changes the checker (`tools/lint.mjs`)

- [ ] I added an example under `tests/checker/bad/`, `good/` or `known-gaps/`.
- [ ] `node tools/test-checker.mjs` passes.
