#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// 검사기(tools/lint.mjs)를 예시 모음으로 시험한다.
//
//   tests/checker/bad/         걸려야 하는 글. 하나도 안 걸리면 실패.
//   tests/checker/good/        걸리면 안 되는 글. 하나라도 걸리면 실패(오탐).
//   tests/checker/known-gaps/  나쁜 글인데 지금 규칙으로는 못 잡는 것. 실패로 치지 않고 수만 센다.
//                              규칙을 고쳐 잡게 되면 bad/ 로 옮긴다. 여기 예를 더하는 것도 기여다.
//
// 파일 첫머리의 "# " 줄은 설명이다. "# prompt" 줄이 있으면 시작 프롬프트에 들어가는 글로 보고 검사한다.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lint } from "./lint.mjs";

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "tests", "checker");

function load(kind) {
  const dir = path.join(DIR, kind);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".txt")).sort().map((f) => {
    const lines = fs.readFileSync(path.join(dir, f), "utf8").replace(/\r\n/g, "\n").split("\n");
    let prompt = false;
    while (lines.length && lines[0].startsWith("# ")) {
      if (lines[0].trim() === "# prompt") prompt = true;
      lines.shift();
    }
    return { name: `${kind}/${f}`, findings: lint(lines.join("\n"), { prompt }) };
  });
}

let failed = 0;
for (const c of load("bad")) {
  if (c.findings.length) console.log(`ok    ${c.name}  → ${c.findings.map((x) => `${x.id}(${x.level})`).join(", ")}`);
  else { failed++; console.error(`FAIL  ${c.name}  걸려야 하는데 통과했다`); }
}
for (const c of load("good")) {
  if (!c.findings.length) console.log(`ok    ${c.name}`);
  else { failed++; console.error(`FAIL  ${c.name}  오탐: ${c.findings.map((x) => `${x.id} "${x.match}"`).join(", ")}`); }
}
const gaps = load("known-gaps");
const closed = gaps.filter((c) => c.findings.length);
for (const c of closed) console.log(`note  ${c.name}  이제 잡힌다(${c.findings.map((x) => x.id).join(", ")}). bad/ 로 옮길 것`);
console.log(`\n알려진 빈틈 ${gaps.length - closed.length}건 (tests/checker/known-gaps/)`);
if (failed) { console.error(`실패 ${failed}건`); process.exit(1); }
console.log("검사기 시험 통과");
