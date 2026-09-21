#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// QR 생성기(tools/qr.mjs) 시험. 바깥 도구 없이 세 가지를 본다.
//   1. 리드-솔로몬 계산이 표준 예제("HELLO WORLD", 1-M)와 같은가
//   2. 만든 QR을 다시 읽으면(마스크를 벗기고, 교차 배치를 풀고) 넣은 글이 그대로 나오는가,
//      블록마다 오류 정정 코드워드가 데이터와 맞는가, 형식 정보가 등급과 마스크를 바르게 담고 있는가
//   3. PNG가 제대로 된 PNG 머리를 갖는가

import { qrMatrix, qrPng, qrSvg, _internals } from "./qr.mjs";
const { BLOCKS, rsDivisor, rsRemainder, blank, drawFormat, MASKS } = _internals;

let failed = 0;
const check = (name, ok, detail = "") => {
  if (ok) console.log(`ok    ${name}`);
  else { failed++; console.error(`FAIL  ${name} ${detail}`); }
};

// 1. 표준 예제
{
  const data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17];
  const expect = [196, 35, 39, 119, 235, 215, 231, 226, 93, 23];
  check("리드-솔로몬: HELLO WORLD 1-M", JSON.stringify(rsRemainder(data, rsDivisor(10))) === JSON.stringify(expect));
}

// 2. 되읽기
function readBack(text, level) {
  const q = qrMatrix(text, { level });
  const { version, size, mask, modules } = q;

  // 형식 정보
  const pos = [];
  for (let i = 0; i <= 5; i++) pos.push([8, i]);
  pos.push([8, 7], [8, 8], [7, 8]);
  for (let i = 9; i < 15; i++) pos.push([14 - i, 8]);
  let bits = 0;
  pos.forEach(([x, y], i) => { if (modules[y][x]) bits |= 1 << i; });
  const fmt = (bits ^ 0x5412) >>> 10;
  const fmtLevel = { 1: "L", 0: "M", 3: "Q", 2: "H" }[fmt >>> 3];
  if (fmtLevel !== level || (fmt & 7) !== mask) return { ok: false, why: "형식 정보" };

  // 기능 칸 지도
  const map = blank(version);
  drawFormat(map, level, mask);

  // 지그재그로 읽으며 마스크를 벗긴다
  const stream = [];
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++)
      for (let j = 0; j < 2; j++) {
        const x = right - j, upward = ((right + 1) & 2) === 0, y = upward ? size - 1 - vert : vert;
        if (!map.fn[y][x]) stream.push(modules[y][x] !== MASKS[mask](x, y) ? 1 : 0);
      }
  }
  const words = [];
  for (let i = 0; i + 8 <= stream.length; i += 8) words.push(stream.slice(i, i + 8).reduce((n, b) => (n << 1) | b, 0));

  // 교차 배치 풀기
  const [ecLen, groups] = BLOCKS[version][level];
  const lens = groups.flatMap(([count, len]) => new Array(count).fill(len));
  const blocks = lens.map(() => ({ d: [], e: [] }));
  let at = 0;
  for (let i = 0; i < Math.max(...lens); i++) lens.forEach((len, b) => { if (i < len) blocks[b].d.push(words[at++]); });
  for (let i = 0; i < ecLen; i++) blocks.forEach((b) => b.e.push(words[at++]));

  // 블록마다 오류 정정이 맞는가
  const divisor = rsDivisor(ecLen);
  for (const b of blocks) if (JSON.stringify(rsRemainder(b.d, divisor)) !== JSON.stringify(b.e)) return { ok: false, why: "오류 정정" };

  // 글 되살리기
  const data = blocks.flatMap((b) => b.d);
  const dbits = data.flatMap((v) => [...v.toString(2).padStart(8, "0")].map(Number));
  if (dbits.slice(0, 4).join("") !== "0100") return { ok: false, why: "모드" };
  const count = parseInt(dbits.slice(4, 12).join(""), 2);
  const bytes = [];
  for (let i = 0; i < count; i++) bytes.push(parseInt(dbits.slice(12 + i * 8, 20 + i * 8).join(""), 2));
  const back = new TextDecoder().decode(new Uint8Array(bytes));
  return { ok: back === text, why: `되읽은 글 "${back}"`, version, mask };
}

const samples = [
  "https://ganpan.org/ganpan/start",
  "https://ganpan.org/patternflow/start",
  "https://example.com/ganpan/start",
  "https://a-rather-long-domain-name.example.co.kr/ganpan/start",
  "한글 주소는 쓰지 않지만 바이트 모드는 UTF-8을 그대로 담는다",
  "a",
];
for (const text of samples)
  for (const level of ["L", "M", "Q", "H"]) {
    // 버전 6의 이 등급에 담기는 바이트 수(머리 12비트를 뺀다). 넘으면 거절하는 것이 맞다.
    const room = Math.floor((BLOCKS[6][level][1].reduce((n, [count, len]) => n + count * len, 0) * 8 - 12) / 8);
    const bytes = new TextEncoder().encode(text).length;
    let r;
    try { r = readBack(text, level); } catch (e) { r = { ok: false, threw: true, why: e.message }; }
    if (bytes > room) check(`거절 ${level} "${text.slice(0, 40)}" (${bytes}바이트 > ${room})`, r.threw === true);
    else check(`되읽기 ${level} "${text.slice(0, 40)}"${r.version ? ` (버전 ${r.version}, 마스크 ${r.mask})` : ""}`, r.ok, r.why);
  }

// 버전 6을 넘는 글은 거절해야 한다
{
  let threw = false;
  try { qrMatrix("x".repeat(200)); } catch { threw = true; }
  check("너무 긴 글은 오류", threw);
}

// 3. 출력 형식
{
  const png = qrPng("https://ganpan.org/ganpan/start");
  check("PNG 머리", png.subarray(0, 8).toString("hex") === "89504e470d0a1a0a" && png.subarray(12, 16).toString("ascii") === "IHDR");
  const svg = qrSvg("https://ganpan.org/ganpan/start");
  check("SVG", svg.startsWith("<svg ") && svg.includes("<path ") && !svg.includes("<script"));
}

if (failed) { console.error(`\n실패 ${failed}건`); process.exit(1); }
console.log("\nQR 시험 통과");
