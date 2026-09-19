#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Ganpan 사이트 빌드. 의존성 없음.
//
//   node tools/build.mjs                    → dist/ (base는 site/site.json)
//   node tools/build.mjs --base http://localhost:4173
//
// 하는 일은 세 가지다.
//   1. 마크다운(제한된 부분집합)을 자바스크립트 없는 정적 HTML로 바꾼다.
//   2. 간판(site/ganpan, signs/<slug>)을 입구 + 조각으로 내보낸다.
//   3. 규약이 요구하는 것을 검사하고, 어기면 빌드를 실패시킨다.
//
// 출력 경로: 입구는 <dir>/index.html, 조각은 <dir>/<slug>.html.
// GitHub Pages · Cloudflare Pages · Vercel(cleanUrls) 모두 <slug>.html 을
// /<slug> 로 내준다. 입구가 /ganpan → /ganpan/ 로 한 번 리다이렉트되는지는
// 호스트마다 다르므로 배포 후 docs/test-log.md 에 기록한다.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
`.trim();

function shell({ lang, title, description, canonical, markdownUrl, body }) {
  const alternate = markdownUrl ? `<link rel="alternate" type="text/markdown" href="${markdownUrl}">\n` : "";
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">\n` : ""}<link rel="canonical" href="${canonical}">
${alternate}<style>${CSS}</style>
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

function checkHtml(where, html) {
  if (/<script\b/i.test(html)) errors.push(`${where}: <script> 금지 (간판은 JS 없이 보여야 한다)`);
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (!/^(https?:\/\/|mailto:)/.test(href)) errors.push(`${where}: 절대 URL이 아닌 링크 ${href}`);
    // 쿼리스트링이 붙은 주소는 AI 쪽에서 데이터 유출 경로로 의심받는다(CONTEXT 3.2c). 간판의 주소에는 쓰지 않는다.
    if (href.startsWith(BASE) && href.includes("?"))
      errors.push(`${where}: 쿼리스트링이 붙은 간판 주소 ${href}`);
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
  const out = signPage(sign, "entrance", entrance, sign.url, `${sign.url}/index.md`);
  write(`${urlPath}/index.md`, signMarkdown(sign, "entrance", entrance));
  checkHtml(rel(entranceFile), out);
  emit(`${urlPath}/index.html`, sign.url, out);
  // 같은 입구를 <dir>.html 로도 낸다. 디렉터리만 있으면 정적 호스트는 /ganpan 을 /ganpan/ 로
  // 301 시킨다(GitHub Pages에서 확인, 2026-09-20). 인쇄되는 주소가 리다이렉트 없이 열리게 하려는 것.
  write(`${urlPath}.html`, out);
  const entranceBytes = Buffer.byteLength(entrance.body);
  if (entranceBytes > config.limits.entranceBytes)
    warnings.push(`${rel(entranceFile)}: 입구가 ${entranceBytes}B — 입구는 가벼운 인덱스여야 한다 (기준 ${config.limits.entranceBytes}B)`);

  const pieces = fs.readdirSync(srcDir).filter((f) => f.endsWith(".md") && f !== "index.md");
  for (const f of pieces) {
    const slug = f.slice(0, -3);
    const file = path.join(srcDir, f);
    if (!SLUG.test(slug)) errors.push(`${rel(file)}: 조각 slug는 소문자 ASCII와 숫자만 (하이픈·한글 금지)`);
    const pieceUrl = `${sign.url}/${slug}`;
    const page = readPage(file, vars);
    if (!page.meta.title) errors.push(`${rel(file)}: front matter에 title 필요`);
    if (!entrance.body.includes(pieceUrl))
      errors.push(`${rel(file)}: 입구에 ${pieceUrl} 링크가 없다 (모든 조각은 입구에서 1홉)`);
    const bytes = Buffer.byteLength(page.body);
    if (bytes > config.limits.pieceBytes)
      warnings.push(`${rel(file)}: 조각이 ${bytes}B — 긴 페이지는 잘릴 수 있다 (기준 ${config.limits.pieceBytes}B)`);
    const html = signPage(sign, "piece", page, pieceUrl, `${pieceUrl}.md`);
    write(`${urlPath}/${slug}.md`, signMarkdown(sign, "piece", page));
    checkHtml(rel(file), html);
    emit(`${urlPath}/${slug}.html`, pieceUrl, html);
  }
  console.log(`  간판 ${sign.url}  (입구 + 조각 ${pieces.length})`);
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
// Content-Signal 은 만료된 IETF 초안이라 지킬 의무가 있는 쪽은 없다. ai-train 은 주인이 정할 일이라 비워 둔다.
write("robots.txt", `User-agent: *\nContent-Signal: search=yes, ai-input=yes\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);

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
