#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Ganpan 사이트 빌드. 의존성 없음.
//
//   node tools/build.mjs                    → dist/ (base는 site/site.json)
//   node tools/build.mjs --base http://localhost:4173
//
// 하는 일은 네 가지다.
//   1. 마크다운(제한된 부분집합)을 자바스크립트 없는 정적 HTML로 바꾼다.
//   2. 간판(site/ganpan, signs/<slug>)을 입구 + 조각으로 내보낸다.
//   3. 규약이 요구하는 것을 검사하고, 어기면 빌드를 실패시킨다.
//   4. 간판마다 시작 페이지와 시작 프롬프트를 만든다. 주인이 쓴 글은 tools/lint.mjs 로 검사한다.
//
// 출력 경로: 입구는 <dir>/index.html, 조각은 <dir>/<slug>.html.
// GitHub Pages · Cloudflare Pages · Vercel(cleanUrls) 모두 <slug>.html 을
// /<slug> 로 내준다. 입구가 /ganpan → /ganpan/ 로 한 번 리다이렉트되는지는
// 호스트마다 다르므로 배포 후 docs/test-log.md 에 기록한다.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lint } from "./lint.mjs";
import { qrSvg, qrPng } from "./qr.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const config = JSON.parse(fs.readFileSync(path.join(ROOT, "site", "site.json"), "utf8"));

const baseFlag = process.argv.indexOf("--base");
const BASE = (baseFlag > -1 ? process.argv[baseFlag + 1] : config.base).replace(/\/+$/, "");

const errors = [];
const warnings = [];
const urls = []; // sitemap.xml 에 실을 주소

// ── 마크다운 ────────────────────────────────────────────────────────────────
// 지원: # ## ###, 문단, - 목록, 1. 목록, > 인용, ``` 코드, | 표 |,
// **굵게**, *기울임*, `코드`, [글자](주소), <https://주소>. 그 밖은 지원하지 않는다.

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(text) {
  const codes = [];
  let s = text.replace(/`([^`]+)`/g, (_, c) => `@@CODE${codes.push(c) - 1}@@`);
  s = esc(s);
  s = s.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, '<a href="$1">$1</a>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  return s.replace(/@@CODE(\d+)@@/g, (_, i) => `<code>${esc(codes[i])}</code>`);
}

const isBlockStart = (l) =>
  /^(#{1,3}\s|[-*]\s|\d+\.\s|>|```|\|)/.test(l);

function markdown(src) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;

  const list = (tag, marker) => {
    const items = [];
    while (i < lines.length && (marker.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
      if (marker.test(lines[i])) items.push(lines[i].replace(marker, ""));
      else items[items.length - 1] += " " + lines[i].trim();
      i++;
    }
    out.push(`<${tag}>\n${items.map((t) => `  <li>${inline(t)}</li>`).join("\n")}\n</${tag}>`);
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith("```")) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
      continue;
    }

    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }

    if (line.startsWith("|") && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? "")) {
      const cells = (l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => inline(c.trim()));
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(cells(lines[i++]));
      out.push(
        `<table>\n<thead><tr>${head.map((c) => `<th>${c}</th>`).join("")}</tr></thead>\n<tbody>\n` +
        rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("\n") +
        `\n</tbody>\n</table>`
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) { list("ul", /^[-*]\s+/); continue; }
    if (/^\d+\.\s+/.test(line)) { list("ol", /^\d+\.\s+/); continue; }

    if (line.startsWith(">")) {
      const quote = [];
      while (i < lines.length && lines[i].startsWith(">")) quote.push(lines[i++].replace(/^>\s?/, ""));
      out.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
      continue;
    }

    const para = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) para.push(lines[i++]);
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

// ── 파일 읽기 ───────────────────────────────────────────────────────────────

function readPage(file, vars) {
  let raw = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const meta = {};
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (fm) {
    for (const l of fm[1].split("\n")) {
      const m = l.match(/^(\w+):\s*(.*)$/);
      if (m) meta[m[1]] = m[2];
    }
    raw = raw.slice(fm[0].length);
  }
  for (const [k, v] of Object.entries(vars)) raw = raw.replaceAll(`{{${k}}}`, v);
  const left = raw.match(/\{\{\w+\}\}/);
  if (left) errors.push(`${rel(file)}: 알 수 없는 변수 ${left[0]}`);
  return { meta, body: raw, html: markdown(raw) };
}

const rel = (f) => path.relative(ROOT, f).replaceAll("\\", "/");

function emit(relPath, url, content) {
  urls.push(url);
  write(relPath, content);
}

function write(relPath, content) {
  const file = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

// ── 레이아웃 ────────────────────────────────────────────────────────────────

const CSS = `
:root{color-scheme:light dark}
body{font:17px/1.7 system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;max-width:42rem;margin:0 auto;padding:2rem 1rem 4rem}
h1{font-size:1.7rem;line-height:1.3}h2{font-size:1.25rem;margin-top:2.2em}h3{font-size:1.05rem}
a{word-break:break-all}code{font-size:.92em}pre{overflow-x:auto;padding:1rem;border:1px solid}
table{border-collapse:collapse;display:block;overflow-x:auto}th,td{border:1px solid;padding:.35rem .6rem;text-align:left;vertical-align:top}
blockquote{margin-left:0;padding-left:1rem;border-left:3px solid}
header.site,footer{font-size:.9rem}footer{margin-top:4rem;padding-top:1rem;border-top:1px solid}
.closed{padding:.6rem 1rem;border:1px solid}
.small{font-size:.9rem}
.prompt{white-space:pre-wrap;word-break:break-word;overflow-x:visible;font-size:.92rem;line-height:1.55}
.btn{display:inline-block;font:inherit;font-weight:700;padding:.6rem 1.4rem;border:2px solid;border-radius:.4rem;background:none;color:inherit;text-decoration:none;cursor:pointer;margin:.2rem .3rem .2rem 0}
.big{font-size:1.5rem;padding:1rem 3.2rem}
.langradio{position:absolute;opacity:0;pointer-events:none}
.langswitch{text-align:right;margin:0 0 1rem;font-size:.9rem}
.langswitch label{display:inline-block;padding:.25rem .7rem;border:1px solid;cursor:pointer}
.langswitch label+label{border-left:0}
details{margin-top:2.5rem}summary{cursor:pointer;font-size:.9rem}
`.trim();

function shell({ lang, title, description, canonical, markdownUrl, extraCss = "", body }) {
  const alternate = markdownUrl ? `<link rel="alternate" type="text/markdown" href="${markdownUrl}">\n` : "";
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">\n` : ""}<link rel="canonical" href="${canonical}">
${alternate}<style>${CSS}${extraCss}</style>
</head>
<body>
${body}
</body>
</html>
`;
}

// 간판 꼬리말. 지시문이 아니라 서술문으로만 쓴다(규약 원칙 2).
const FOOTER = {
  ko: (s, kind) => [
    `이 페이지는 「${esc(s.title)}」 간판의 ${kind === "entrance" ? "입구" : "조각"}이다. 주인: ${esc(s.owner)}.`,
    kind === "piece" ? `간판의 입구(전체 조각 목록): <a href="${s.url}">${s.url}</a>` : "",
    esc(s.boundary),
    `마지막 갱신: ${s.updated}. 이 간판은 Ganpan 규약을 따른다: <a href="${BASE}/spec">${BASE}/spec</a>`,
  ],
  en: (s, kind) => [
    `This page is ${kind === "entrance" ? "the entrance" : "one piece"} of the Ganpan sign "${esc(s.title)}". Owner: ${esc(s.owner)}.`,
    kind === "piece" ? `Entrance of this sign (the list of all pieces): <a href="${s.url}">${s.url}</a>` : "",
    esc(s.boundary),
    `Last updated: ${s.updated}. This sign follows the Ganpan convention: <a href="${BASE}/spec">${BASE}/spec</a>`,
  ],
};

const CLOSED = {
  ko: (s) => `이 간판은 종료되었다${s.closed ? ` (${s.closed})` : ""}. 기록으로 보존되며, 아래 내용은 종료 시점의 것이다.`,
  en: (s) => `This sign is closed${s.closed ? ` (${s.closed})` : ""}. It is kept as a record; the content below is as of closing.`,
};

// 마크다운 사본. 일부 AI의 읽기 도구는 Accept: text/markdown 으로 마크다운을 먼저 청한다.
// 원본이 마크다운이므로 비용 없이 같이 낸다. 꼬리말(주인·경계·갱신일)도 빠짐없이 싣는다.
function signMarkdown(sign, kind, page) {
  const foot = (FOOTER[sign.lang] ?? FOOTER.en)(sign, kind)
    .filter(Boolean)
    .map((p) => p.replace(/<a href="([^"]+)">[^<]*<\/a>/g, "<$1>").replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
  const closed = sign.status === "closed" ? `> ${(CLOSED[sign.lang] ?? CLOSED.en)(sign)}\n\n` : "";
  return `${closed}${page.body.trim()}\n\n---\n\n${foot.join("\n\n")}\n`;
}

function signPage(sign, kind, page, canonical, markdownUrl) {
  const foot = (FOOTER[sign.lang] ?? FOOTER.en)(sign, kind).filter(Boolean);
  const closed = sign.status === "closed" ? `<p class="closed">${(CLOSED[sign.lang] ?? CLOSED.en)(sign)}</p>\n` : "";
  return shell({
    lang: sign.lang,
    title: page.meta.title ?? sign.title,
    description: page.meta.summary,
    canonical,
    markdownUrl,
    body: `<main>\n<article>\n${closed}${page.html}\n</article>\n</main>\n<footer>\n${foot.map((p) => `<p>${p}</p>`).join("\n")}\n</footer>`,
  });
}

// ── 검사 ────────────────────────────────────────────────────────────────────

const SLUG = /^[a-z0-9]+$/;

// allowScript 는 시작 페이지 한 곳에만 쓴다. 사람이 여는 페이지이고, 내용은 JS 없이도 다 보이며,
// 스크립트는 복사 버튼 하나를 위한 것이다. AI가 읽는 입구와 조각에는 여전히 <script> 를 둘 수 없다.
// (마크다운 변환기는 본문의 HTML을 글자로 바꾸므로, 이 검사는 레이아웃 쪽 실수를 잡는 안전망이다.)
function checkHtml(where, html, { allowScript = false } = {}) {
  if (!allowScript && /<script\b/i.test(html)) errors.push(`${where}: <script> 금지 (간판은 JS 없이 보여야 한다)`);
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (!/^(https?:\/\/|mailto:)/.test(href)) errors.push(`${where}: 절대 URL이 아닌 링크 ${href}`);
    // 쿼리스트링이 붙은 주소는 AI 쪽에서 데이터 유출 경로로 의심받는다(CONTEXT 3.2c). 간판의 주소에는 쓰지 않는다.
    if (href.startsWith(BASE) && href.includes("?"))
      errors.push(`${where}: 쿼리스트링이 붙은 간판 주소 ${href}`);
  }
}

// ── 시작 페이지와 시작 프롬프트 ─────────────────────────────────────────────
//
// 시작 페이지(<간판>/start)는 사람이 연다. QR이나 링크로 와서, 거기 적힌 글을 복사해 자기 AI 채팅에
// 붙여넣는다. 그 글이 시작 프롬프트다. AI 앱은 손님이 제 손으로 보낸 글자를 믿으므로, 프롬프트에
// 든 주소는 전부 열리고, 거기 적힌 부탁은 손님 자신의 부탁이 된다.
//
// 그래서 선을 긋는다. 프롬프트는 손님의 목소리다: 어디에 무엇이 있는지, 그리고 손님이 자기 AI에게
// 할 법한 부탁만 싣는다. 주인의 추천이나 유도는 싣지 않는다. 그것은 페이지에, 출처를 밝혀 적는다
// (원칙 1). 복사되는 글은 화면에 보이는 글과 같다.
//
// 간판 전체가 작으면(limits.inlineChars) 본문을 프롬프트에 통째로 싣는다. 웹을 열지 못하는 앱에서도
// 되고, fetch 실패·캐시·호스트 차단과 무관해진다. 크면 지도(주소 + 한 줄 설명)만 싣는다.
const START = {
  en: {
    official: "These are the official pages the owner put up for AIs to read.",
    officialInline: (s) => `Below is the official text the owner put up for AIs to read, copied from ${s.url} (updated ${s.updated}).`,
    // 마지막 두 문장은 Gemini 때문에 있다. Gemini는 손님의 직전 메시지에 든 주소만 연다
    // (2026-09-22 작성자 관찰). 되묻는 턴을 지나면 주소가 "직전 메시지"에서 밀려나 열지 못한다.
    // 그때 AI가 필요한 주소를 코드 블록으로 돌려주면, 손님은 복사해 보내기만 하면 된다.
    ask: "First ask me briefly what I would like to know. Then read only the pages you need and explain at my level, in the language I am writing in. If something is not in these pages, tell me so. If you cannot open a page you need, do not guess. At the end of your reply, show me that page's address in a code block and ask me to send it back to you. Tell me that I do not need to open the link myself: I only copy it and paste it into this chat.",
    askInline: "First ask me briefly what I would like to know. Then answer from this text, at my level, in the language I am writing in. If something is not in this text, tell me so.",
    h1: (s) => `Ask your AI about ${s.title}`,
    placard: { title: "Ask your AI", lead: "Scan the code, copy the text,<br>and paste it into your AI chat.", or: "Or type this address into your AI chat.", any: "Any AI you already use: ChatGPT, Gemini, Claude." },
    forOwner: (qr, placard) => `For the owner: <a href="${qr}">QR code of this page (PNG)</a> · <a href="${placard}">placard to print</a>`,
    steps: ["Press the Copy prompt button.", "Open the AI app you already use and paste it."],
    copy: "Copy prompt", copied: "Copied", fail: "Press and hold the text below to copy it",
    show: "See the text that gets copied",
    note: "What gets copied is exactly this text. You can edit it before you send it.",
    foot: (s) => `This page is for people. The pages an AI reads start at <a href="${s.url}">${s.url}</a>. Owner: ${esc(s.owner)}. Updated ${s.updated}.`,
  },
  ko: {
    official: "주인이 AI가 읽으라고 내건 공식 안내 페이지들이야.",
    officialInline: (s) => `아래는 주인이 AI가 읽으라고 내건 공식 안내문이야. ${s.url} 에서 복사했어 (${s.updated} 갱신).`,
    ask: "먼저 내가 뭐가 궁금한지 짧게 물어봐 줘. 그다음 필요한 페이지만 읽고, 내 수준에 맞춰 한국어로 설명해 줘. 이 페이지들에 없는 내용은 없다고 말해 줘. 필요한 페이지를 열 수 없으면 짐작해서 답하지 말고, 답 마지막에 그 페이지 주소를 코드 블록에 담아 보여 주면서 나한테 다시 보내 달라고 해 줘. 그때 나는 그 링크를 열어 볼 필요 없이, 복사해서 이 채팅에 붙여넣기만 하면 된다고도 알려 줘.",
    askInline: "먼저 내가 뭐가 궁금한지 짧게 물어봐 줘. 그다음 이 글을 바탕으로, 내 수준에 맞춰 한국어로 답해 줘. 이 글에 없는 내용은 없다고 말해 줘.",
    h1: (s) => `${s.title}, AI에게 물어보기`,
    placard: { title: "AI에게 물어보세요", lead: "QR을 찍어 나온 글을 복사해,<br>AI 채팅창에 붙여넣으세요.", or: "또는 이 주소를 AI 채팅창에 입력하세요.", any: "ChatGPT, Gemini, Claude 등 평소 쓰는 AI면 됩니다." },
    forOwner: (qr, placard) => `주인용: <a href="${qr}">이 페이지의 QR 이미지(PNG)</a> · <a href="${placard}">인쇄용 안내판</a>`,
    steps: ["프롬프트 복사 버튼을 누르세요.", "평소 쓰시는 AI 앱을 열어서 붙여넣으세요."],
    copy: "프롬프트 복사", copied: "복사됨", fail: "아래 글을 길게 눌러 복사하세요",
    show: "복사되는 글 보기",
    note: "복사되는 글은 여기 보이는 그대로입니다. 보내기 전에 고쳐도 됩니다.",
    foot: (s) => `이 페이지는 사람을 위한 것입니다. AI가 읽는 페이지는 <a href="${s.url}">${s.url}</a> 에서 시작합니다. 주인: ${esc(s.owner)}. ${s.updated} 갱신.`,
  },
};

const LANG_NAMES = { en: "English", ko: "한국어" };

// 프롬프트가 채워진 채 앱을 여는 링크(chatgpt.com/?q=, claude.ai/new?q=)는 두지 않는다.
// 앱이 깔린 폰에서도 앱으로 넘어가지 않았다(2026-09-22 작성자 확인). 복사해서 붙여넣는 길 하나만 둔다.

function startPrompt(sign, lang, pieces, inline) {
  const t = START[lang];
  const intro = sign.start.intro[lang].trim();
  if (inline) {
    const text = pieces.map((p) => `=== ${p.title} (${p.url}) ===\n${p.body.trim()}`).join("\n\n");
    return `${intro} ${t.officialInline(sign)}\n\n${text}\n\n${t.askInline}`;
  }
  // 주소는 한 줄을 혼자 쓴다. 뒤에 문장부호가 붙으면 주소의 일부로 읽는 앱이 있다.
  const map = pieces.map((p) => `${p.url}\n${p.short}`).join("\n\n");
  return `${intro} ${t.official}\n\n${map}\n\n${t.ask}`;
}

function buildStart(sign, urlPath, where, pieces) {
  if (!sign.start?.intro || !Object.keys(sign.start.intro).length) {
    warnings.push(`${where}/sign.json: start.intro 가 없어 시작 페이지를 만들지 않았다`);
    return;
  }
  const langs = Object.keys(sign.start.intro).filter((lang) => {
    if (START[lang]) return true;
    errors.push(`${where}/sign.json: start.intro 의 언어 "${lang}" 는 지원하지 않는다 (${Object.keys(START).join(", ")})`);
    return false;
  });
  if (!langs.length) return;
  const total = pieces.reduce((n, p) => n + p.chars, 0);
  const inline = total <= config.limits.inlineChars;
  const startUrl = `${sign.url}/start`;

  // 한 번에 한 언어만 보인다. 전환은 라디오 버튼과 CSS로 하므로 스크립트 없이도 된다.
  // 스크립트가 있으면 폰의 언어 설정에 맞는 쪽을 처음에 고른다.
  const sections = langs.map((lang) => {
    const t = START[lang];
    lintOwnerText(`${where}/sign.json start.intro.${lang}`, sign.start.intro[lang], { prompt: true });
    const prompt = startPrompt(sign, lang, pieces, inline);
    console.log(`    시작 프롬프트 ${lang}: ${[...prompt].length}자 (${inline ? "본문 포함" : "지도"})`);
    return (
      `<section data-lang="${lang}" lang="${lang}">\n<h1>${esc(t.h1(sign))}</h1>\n` +
      `<ol>\n${t.steps.map((s) => `  <li>${s}</li>`).join("\n")}\n</ol>\n` +
      `<p><button type="button" class="btn big" data-copy="prompt-${lang}" data-done="${t.copied}" data-fail="${t.fail}">${t.copy}</button></p>\n` +
      // 프롬프트는 접어 둔다. 복사되는 글은 여기 보이는 글과 같다(SPEC 4.2).
      `<details>\n<summary>${t.show}</summary>\n<pre class="prompt" id="prompt-${lang}">${esc(prompt)}</pre>\n<p class="small">${t.note}</p>\n</details>\n</section>`
    );
  });
  const multi = langs.length > 1;
  const switcher = multi
    ? langs.map((l, i) => `<input class="langradio" type="radio" name="lang" id="lang-${l}"${i === 0 ? " checked" : ""}>`).join("\n") +
      `\n<p class="langswitch">${langs.map((l) => `<label for="lang-${l}" lang="${l}">${LANG_NAMES[l] ?? l}</label>`).join("")}</p>\n`
    : "";
  const extraCss = multi
    ? "section[data-lang]{display:none}" +
      langs.map((l) => `#lang-${l}:checked~section[data-lang=${l}]{display:block}#lang-${l}:checked~.langswitch label[for=lang-${l}]{font-weight:700;text-decoration:underline}`).join("")
    : "";

  const script = `<script>
(function () {
  var pref = (navigator.languages || [navigator.language || ""]).map(function (l) { return l.slice(0, 2).toLowerCase(); });
  for (var i = 0; i < pref.length; i++) {
    var r = document.getElementById("lang-" + pref[i]);
    if (r) { r.checked = true; break; }
  }
  document.querySelectorAll("button[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = document.getElementById(b.dataset.copy), text = el.textContent;
      var done = function () { b.textContent = b.dataset.done; };
      var byHand = function () {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
        document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
        var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        if (ok) return done();
        var d = el.closest("details"); if (d) d.open = true;
        b.textContent = b.dataset.fail;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, byHand);
      else byHand();
    });
  });
})();
</script>`;
  const footLang = langs.includes(sign.lang) ? sign.lang : langs[0];
  const html = shell({
    lang: footLang,
    title: START[footLang].h1(sign),
    canonical: startUrl,
    extraCss,
    body: `<main>\n${switcher}${sections.join("\n")}\n</main>\n<footer>\n<p>${START[footLang].foot(sign)}</p>\n<p>${START[footLang].forOwner(`${sign.url}/start-qr.png`, `${sign.url}/placard`)}</p>\n</footer>\n${script}`,
  });
  checkHtml(`${where} (start)`, html, { allowScript: true });
  emit(`${urlPath}/start.html`, startUrl, html);

  // 시작 페이지의 QR. 웹의 QR 생성기는 로그인을 요구하거나 자기네 단축 주소를 끼워 넣곤 해서 빌드가 직접 만든다.
  // QR에는 시작 페이지의 주소를 담는다. 안내 문구나 프롬프트를 바꿔도 인쇄한 QR은 그대로 쓸 수 있다.
  write(`${urlPath}/start-qr.svg`, qrSvg(startUrl) + "\n");
  write(`${urlPath}/start-qr.png`, qrPng(startUrl));

  // 인쇄용 안내판. 기본 모양일 뿐이다. 제 디자인을 쓰려면 위의 QR 이미지만 가져가면 된다.
  const placards = langs.map((lang) => {
    const p = START[lang].placard;
    return `<section class="placard" lang="${lang}">\n<h1>${p.title}</h1>\n<p class="name">${esc(sign.title)}</p>\n<p>${p.lead}</p>\n<div class="qr">${qrSvg(startUrl)}</div>\n<p class="small">${p.or}</p>\n<p class="url">${sign.url}</p>\n<p class="small">${p.any}</p>\n</section>`;
  });
  const placardCss = "body{max-width:none}.placard{max-width:30rem;margin:0 auto 3rem;padding:2.5rem;border:2px solid;text-align:center}.placard h1{font-size:2rem;margin:0}.placard .name{font-weight:700;margin:.2rem 0 1rem}.placard p{font-size:1.2rem;margin:.4rem 0}.placard .small{font-size:.95rem;margin-top:1rem}.placard .qr{width:14rem;margin:1rem auto}.placard .qr svg{width:100%;height:auto;display:block}.placard .url{font:700 1.1rem/1.35 ui-monospace,Consolas,monospace;word-break:break-all}@media print{body{padding:0}.placard{border:0;page-break-after:always;margin:0 auto}footer{display:none}}";
  const placardHtml = shell({
    lang: footLang,
    title: `${sign.title}: placard`,
    canonical: `${sign.url}/placard`,
    extraCss: placardCss,
    body: `<main>\n${placards.join("\n")}\n</main>\n<footer>\n<p>${START[footLang].foot(sign)}</p>\n</footer>`,
  });
  checkHtml(`${where} (placard)`, placardHtml);
  write(`${urlPath}/placard.html`, placardHtml);
}

// 주인이 쓴 글을 훑는다(tools/lint.mjs). 기계가 확실히 아는 것(error)만 빌드를 막는다.
// 문구 패턴(hint)은 막지 않고 검토자에게 알려 주기만 한다. 받아들일지는 사람이 읽고 정한다.
function lintOwnerText(where, text, opts) {
  for (const x of lint(text, opts)) {
    const line = `${where}: ${x.message} [${x.id}] "${x.match}"`;
    if (x.level === "error") errors.push(line);
    else warnings.push(`검토자 확인 — ${line}`);
  }
}

// ── 간판 빌드 ───────────────────────────────────────────────────────────────

function buildSign(srcDir, urlPath) {
  const where = rel(srcDir);
  const signFile = path.join(srcDir, "sign.json");
  if (!fs.existsSync(signFile)) { errors.push(`${where}: sign.json 없음`); return; }
  const sign = JSON.parse(fs.readFileSync(signFile, "utf8"));
  for (const key of ["title", "owner", "lang", "boundary", "updated"])
    if (!sign[key]) errors.push(`${where}/sign.json: "${key}" 필요`);
  sign.url = `${BASE}/${urlPath}`;

  const vars = { base: BASE, sign: sign.url };
  const entranceFile = path.join(srcDir, "index.md");
  if (!fs.existsSync(entranceFile)) { errors.push(`${where}: 입구(index.md) 없음`); return; }

  const entrance = readPage(entranceFile, vars);
  lintOwnerText(rel(entranceFile), entrance.body);
  const out = signPage(sign, "entrance", entrance, sign.url, `${sign.url}/index.md`);
  write(`${urlPath}/index.md`, signMarkdown(sign, "entrance", entrance));
  checkHtml(rel(entranceFile), out);
  emit(`${urlPath}/index.html`, sign.url, out);
  // 같은 입구를 <dir>.html 로도 낸다. 디렉터리만 있으면 정적 호스트는 /ganpan 을 /ganpan/ 로
  // 301 시킨다(GitHub Pages에서 확인, 2026-09-20). 인쇄되는 주소가 리다이렉트 없이 열리게 하려는 것.
  write(`${urlPath}.html`, out);
  // 크기는 글자 수로 센다(바이트로 세면 한글 간판이 세 배 빨리 걸린다).
  const entranceChars = [...entrance.body].length;
  if (entranceChars > config.limits.entranceChars)
    warnings.push(`${rel(entranceFile)}: 입구가 ${entranceChars}자. 입구는 가벼운 인덱스여야 한다 (기준 ${config.limits.entranceChars}자)`);

  const pieces = fs.readdirSync(srcDir).filter((f) => f.endsWith(".md") && f !== "index.md");

  // 입구 위쪽에 조각 주소 전부를 담은 코드 블록 하나가 있어야 한다(SPEC 5.1, 5.3).
  // ChatGPT는 손님이 주소를 보내야 조각을 연다. 블록을 통째로 복사해 한 번 보내면 전부 열린다.
  if (pieces.length) {
    const urlsNeeded = pieces.map((f) => `${sign.url}/${f.slice(0, -3)}`);
    const blocks = [...entrance.body.matchAll(/^```[^\n]*\n([\s\S]*?)^```/gm)];
    const block = blocks.find((b) => urlsNeeded.every((u) => b[1].split("\n").includes(u)));
    if (!block) errors.push(`${rel(entranceFile)}: 조각 주소 전부를 한 줄씩 담은 코드 블록이 없다`);
    else if ([...entrance.body.slice(0, block.index)].length > config.limits.addressBlockWithinChars)
      warnings.push(`${rel(entranceFile)}: 주소 블록이 너무 아래에 있다. 입구 맨 위 가까이에 둔다 (기준 ${config.limits.addressBlockWithinChars}자 이내)`);
  }
  const pieceInfos = [];
  for (const f of pieces) {
    const slug = f.slice(0, -3);
    const file = path.join(srcDir, f);
    if (!SLUG.test(slug)) errors.push(`${rel(file)}: 조각 slug는 소문자 ASCII와 숫자만 (하이픈·한글 금지)`);
    if (slug === "start" || slug === "placard") errors.push(`${rel(file)}: "${slug}" 는 빌드가 만드는 페이지의 자리다. 조각 이름으로 쓸 수 없다`);
    const pieceUrl = `${sign.url}/${slug}`;
    const page = readPage(file, vars);
    lintOwnerText(rel(file), page.body);
    if (!page.meta.title) errors.push(`${rel(file)}: front matter에 title 필요`);
    if (!entrance.body.includes(pieceUrl))
      errors.push(`${rel(file)}: 입구에 ${pieceUrl} 링크가 없다 (모든 조각은 입구에서 1홉)`);
    const chars = [...page.body].length;
    // 시작 프롬프트의 한 줄 설명은 입구의 조각 목록에서 가져온다("- 이름: <주소>. 설명").
    // 주인이 고른 한 줄을 한 곳에서만 관리하려는 것. 없으면 조각의 summary 로 대신한다.
    const line = entrance.body.split("\n").find((l) => l.startsWith("- ") && l.includes(`<${pieceUrl}>`));
    const m = line && line.match(/^- (.+?):?\s*<[^>]+>[.:]?\s*(.*)$/);
    const short = m ? `${m[1].trim()}. ${m[2].trim()}`.replace(/\.\s*$/, ".") : (page.meta.summary ?? page.meta.title ?? slug);
    lintOwnerText(`${rel(entranceFile)} (${slug} 의 한 줄 설명)`, short, { prompt: true });
    pieceInfos.push({ slug, url: pieceUrl, title: page.meta.title ?? slug, short, body: page.body, chars, order: line ? entrance.body.indexOf(line) : Infinity });
    if (chars > config.limits.pieceChars)
      warnings.push(`${rel(file)}: 조각이 ${chars}자. 긴 페이지는 잘릴 수 있으니 나눈다 (기준 ${config.limits.pieceChars}자)`);
    const html = signPage(sign, "piece", page, pieceUrl, `${pieceUrl}.md`);
    write(`${urlPath}/${slug}.md`, signMarkdown(sign, "piece", page));
    checkHtml(rel(file), html);
    emit(`${urlPath}/${slug}.html`, pieceUrl, html);
  }
  console.log(`  간판 ${sign.url}  (입구 + 조각 ${pieces.length})`);
  // 프롬프트 안의 순서는 입구의 조각 목록 순서를 따른다(주인이 정한 읽기 순서).
  pieceInfos.sort((a, b) => a.order - b.order);
  buildStart(sign, urlPath, where, pieceInfos);
}

// ── 실행 ────────────────────────────────────────────────────────────────────

fs.rmSync(DIST, { recursive: true, force: true });
console.log(`base: ${BASE}`);

// 1. 사람용 페이지. 영어가 정본, 한국어는 /ko 아래.
const NAV = {
  en: `<header class="site"><p><a href="${BASE}/">Ganpan</a> · <a href="${BASE}/spec">Spec</a> · <a href="${BASE}/ganpan">This site's sign</a> · <a href="${BASE}/ko" lang="ko">한국어</a></p></header>`,
  ko: `<header class="site"><p><a href="${BASE}/ko">Ganpan</a> · <a href="${BASE}/ko/spec">규약</a> · <a href="${BASE}/ganpan">이 사이트의 간판(영어)</a> · <a href="${BASE}/" lang="en">English</a></p></header>`,
};
const humanPages = [
  { src: "site/pages/index.md", out: "index", url: `${BASE}/`, lang: "en" },
  { src: "SPEC.md", out: "spec", url: `${BASE}/spec`, lang: "en" },
  { src: "site/pages/ko.md", out: "ko/index", url: `${BASE}/ko`, lang: "ko" },
  { src: "SPEC.ko.md", out: "ko/spec", url: `${BASE}/ko/spec`, lang: "ko" },
];
for (const p of humanPages) {
  const page = readPage(path.join(ROOT, p.src), { base: BASE, sign: `${BASE}/ganpan` });
  const h1 = page.body.match(/^#\s+(.*)$/m);
  const html = shell({
    lang: p.lang,
    title: page.meta.title ?? (h1 ? h1[1] : "Ganpan"),
    description: page.meta.summary,
    canonical: p.url,
    markdownUrl: `${BASE}/${p.out}.md`,
    body: `${NAV[p.lang]}\n<main>\n<article>\n${page.html}\n</article>\n</main>`,
  });
  checkHtml(p.src, html);
  emit(`${p.out}.html`, p.url, html);
  // ko/index.html → ko.html 도 같이. /ko 가 /ko/ 로 301 되지 않게(간판 입구와 같은 이유).
  if (p.out.endsWith("/index")) write(`${p.out.slice(0, -"/index".length)}.html`, html);
  write(`${p.out}.md`, page.body.trim() + "\n");
  console.log(`  페이지 ${p.url}`);
}

// 2. Ganpan 자신의 간판
buildSign(path.join(ROOT, "site", "ganpan"), "ganpan");

// 3. 호스팅 간판: signs/<slug>/ → ganpan.org/<slug>
const signsDir = path.join(ROOT, "signs");
for (const entry of fs.existsSync(signsDir) ? fs.readdirSync(signsDir, { withFileTypes: true }) : []) {
  if (!entry.isDirectory()) continue;
  const slug = entry.name;
  if (!SLUG.test(slug)) errors.push(`signs/${slug}: slug는 소문자 ASCII와 숫자만 (하이픈·한글 금지)`);
  if (config.reserved.includes(slug)) errors.push(`signs/${slug}: 예약된 이름이다 (site.json reserved)`);
  // 이 slug는 안내판에 인쇄되어 사진으로 읽힌다. 헷갈리는 글자를 경고한다.
  // 순수한 단어(hongdae)는 문맥으로 읽히므로 넘어가고, 숫자가 섞일 때만 본다:
  // 0·1 자체, 또는 숫자와 l·o 가 함께 있는 경우.
  if (/[01]/.test(slug) || (/\d/.test(slug) && /[lo]/.test(slug)))
    warnings.push(`signs/${slug}: 안내판에 인쇄될 주소에 헷갈리는 글자(l/1, o/0)가 있다`);
  buildSign(path.join(signsDir, slug), slug);
}

// 간판은 손님의 AI가 답하는 순간에 읽으라고 내건 것이다. 그 뜻을 robots.txt 에도 서술해 둔다.
// Content-Signal 은 만료된 IETF 초안이라 지킬 의무가 있는 쪽은 없다. ai-train 은 주인이 정할 일이고,
// 이 사이트는 허용한다(2026-09-20 결정: 규약은 널리 퍼지는 쪽이 낫다).
write("robots.txt", `User-agent: *\nContent-Signal: search=yes, ai-input=yes, ai-train=yes\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);

// 색인되는 것이 중요하다. ChatGPT는 공개 웹 색인에 없는 주소를 "확인되지 않은 링크"로 경고하고,
// Claude는 대화에 글자로 등장했거나 검색·fetch 결과에 나온 주소만 연다(CONTEXT 3.2c).
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`
);

// GitHub Pages: Jekyll 끄기와 커스텀 도메인. 로컬 빌드에는 CNAME 을 쓰지 않는다.
write(".nojekyll", "");
const host = new URL(BASE).hostname;
if (host !== "localhost") write("CNAME", `${host}\n`);

for (const w of warnings) console.warn(`경고  ${w}`);
for (const e of errors) console.error(`오류  ${e}`);
if (errors.length) { console.error(`\n실패: 오류 ${errors.length}건`); process.exit(1); }
console.log(`\n완료 → dist/  (경고 ${warnings.length}건)`);
