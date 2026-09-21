// SPDX-License-Identifier: MIT
// QR 코드 생성기. 바이트 모드, 버전 1~6(한 변 21~41칸). 의존성 없음(PNG 압축은 Node의 zlib).
// 안내판에 넣을 주소 하나를 담는 것이 목적이라 작은 버전만 다룬다. 버전 6의 M 등급은 106바이트까지 담는다.
// 웹의 QR 생성기는 로그인을 요구하거나 자기네 단축 주소를 끼워 넣는 일이 많아서, 간판마다 빌드가 직접 만든다.
//
//   import { qrSvg, qrPng } from "./qr.mjs";
//   node tools/qr.mjs "https://example.com/ganpan/start" > qr.svg
//   node tools/qr.mjs "https://example.com/ganpan/start" qr.png
//
// 시험은 tools/test-qr.mjs. 2026-09-22에 다른 구현이 만든 QR 다섯 개(버전 3~5, 등급 Q·M)와 칸 단위로
// 대조해 오류 정정·교차 배치·칸 배치·마스크·형식 정보가 같음을 확인했다.

import zlib from "node:zlib";

const FORMAT_BITS = { L: 1, M: 0, Q: 3, H: 2 };

// [버전][등급] = [블록당 오류 정정 코드워드 수, [[블록 수, 블록당 데이터 코드워드 수], ...]]
const BLOCKS = {
  1: { L: [7, [[1, 19]]], M: [10, [[1, 16]]], Q: [13, [[1, 13]]], H: [17, [[1, 9]]] },
  2: { L: [10, [[1, 34]]], M: [16, [[1, 28]]], Q: [22, [[1, 22]]], H: [28, [[1, 16]]] },
  3: { L: [15, [[1, 55]]], M: [26, [[1, 44]]], Q: [18, [[2, 17]]], H: [22, [[2, 13]]] },
  4: { L: [20, [[1, 80]]], M: [18, [[2, 32]]], Q: [26, [[2, 24]]], H: [16, [[4, 9]]] },
  5: { L: [26, [[1, 108]]], M: [24, [[2, 43]]], Q: [18, [[2, 15], [2, 16]]], H: [22, [[2, 11], [2, 12]]] },
  6: { L: [18, [[2, 68]]], M: [16, [[4, 27]]], Q: [24, [[4, 19]]], H: [28, [[4, 15]]] },
};

// ── 리드-솔로몬 (GF(256), 기약다항식 0x11D) ──
function gfMul(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}
function rsDivisor(degree) {
  const result = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 2);
  }
  return result;
}
function rsRemainder(data, divisor) {
  const result = new Array(divisor.length).fill(0);
  for (const b of data) {
    const factor = b ^ result.shift();
    result.push(0);
    divisor.forEach((coef, i) => { result[i] ^= gfMul(coef, factor); });
  }
  return result;
}

// ── 데이터 코드워드 ──
function codewords(bytes, version, level) {
  const [ecLen, groups] = BLOCKS[version][level];
  const dataLen = groups.reduce((n, [count, len]) => n + count * len, 0);
  const bits = [];
  const push = (value, length) => { for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1); };
  push(0b0100, 4);           // 바이트 모드
  push(bytes.length, 8);     // 버전 1~9의 글자 수 칸은 8비트
  for (const b of bytes) push(b, 8);
  if (bits.length > dataLen * 8) return null;
  push(0, Math.min(4, dataLen * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((n, b) => (n << 1) | b, 0));
  for (let pad = 0xec; data.length < dataLen; pad ^= 0xec ^ 0x11) data.push(pad);

  const divisor = rsDivisor(ecLen);
  const blocks = [];
  let at = 0;
  for (const [count, len] of groups)
    for (let c = 0; c < count; c++) {
      const d = data.slice(at, at + len);
      at += len;
      blocks.push({ d, e: rsRemainder(d, divisor) });
    }
  const out = [];
  const longest = Math.max(...blocks.map((b) => b.d.length));
  for (let i = 0; i < longest; i++) for (const b of blocks) if (i < b.d.length) out.push(b.d[i]);
  for (let i = 0; i < ecLen; i++) for (const b of blocks) out.push(b.e[i]);
  return out;
}

// ── 행렬 ──
const MASKS = [
  (x, y) => (x + y) % 2 === 0,
  (x, y) => y % 2 === 0,
  (x, y) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

function blank(version) {
  const size = version * 4 + 17;
  const m = Array.from({ length: size }, () => new Array(size).fill(false));
  const fn = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (x, y, dark) => { if (x >= 0 && x < size && y >= 0 && y < size) { m[y][x] = dark; fn[y][x] = true; } };

  for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }          // 타이밍
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]])                                // 위치 찾기 + 분리선
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        set(cx + dx, cy + dy, dist !== 2 && dist !== 4);
      }
  if (version >= 2) {                                                                           // 정렬 무늬(버전 2~6은 하나)
    const c = size - 7;
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) set(c + dx, c + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  return { size, m, fn, set };
}

function drawFormat(q, level, mask) {
  const data = (FORMAT_BITS[level] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  const bit = (i) => ((bits >>> i) & 1) === 1;
  const { size, set } = q;
  for (let i = 0; i <= 5; i++) set(8, i, bit(i));
  set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
  set(8, size - 8, true);                                                                       // 늘 검은 칸
}

function drawData(q, words) {
  const { size, m, fn } = q;
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++)
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!fn[y][x] && i < words.length * 8) {
          m[y][x] = ((words[i >>> 3] >>> (7 - (i & 7))) & 1) === 1;
          i++;
        }
      }
  }
}

function applyMask(q, mask) {
  const { size, m, fn } = q;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) if (!fn[y][x] && MASKS[mask](x, y)) m[y][x] = !m[y][x];
}

function penalty(q) {
  const { size, m } = q;
  let p = 0;
  const lines = [];
  for (let y = 0; y < size; y++) lines.push(m[y]);
  for (let x = 0; x < size; x++) lines.push(m.map((row) => row[x]));
  for (const line of lines) {
    let run = 1;
    for (let i = 1; i <= size; i++) {
      if (i < size && line[i] === line[i - 1]) run++;
      else { if (run >= 5) p += 3 + (run - 5); run = 1; }
    }
    const s = line.map((d) => (d ? "1" : "0")).join("");
    for (const pat of ["10111010000", "00001011101"]) {
      let at = s.indexOf(pat);
      while (at !== -1) { p += 40; at = s.indexOf(pat, at + 1); }
    }
  }
  for (let y = 0; y < size - 1; y++)
    for (let x = 0; x < size - 1; x++)
      if (m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
  const dark = m.reduce((n, row) => n + row.filter(Boolean).length, 0);
  const total = size * size;
  p += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
  return p;
}

// text 를 QR 행렬로. level: "L" | "M" | "Q" | "H". mask 를 주면 그 마스크를 쓰고, 안 주면 벌점이 가장 낮은 것을 고른다.
export function qrMatrix(text, { level = "M", mask } = {}) {
  const bytes = [...new TextEncoder().encode(text)];
  let version = 0, words = null;
  for (let v = 1; v <= 6 && !words; v++) { words = codewords(bytes, v, level); if (words) version = v; }
  if (!words) throw new Error(`QR: ${bytes.length}바이트는 버전 6(${level})에 담기지 않는다. 주소를 줄인다`);

  const make = (k) => {
    const q = blank(version);
    drawFormat(q, level, k);   // 형식 정보 자리를 먼저 기능 칸으로 잡아 둔다
    drawData(q, words);
    applyMask(q, k);
    return q;
  };
  let best = null, bestMask = mask;
  if (mask === undefined) {
    let low = Infinity;
    for (let k = 0; k < 8; k++) {
      const q = make(k), score = penalty(q);
      if (score < low) { low = score; best = q; bestMask = k; }
    }
  } else best = make(mask);
  return { version, size: best.size, mask: bestMask, modules: best.m };
}

// 행렬을 SVG로. 여백(quiet zone)은 규격대로 4칸.
export function qrSvg(text, { level = "M", quiet = 4, color = "#000" } = {}) {
  const { size, modules } = qrMatrix(text, { level });
  const full = size + quiet * 2;
  let d = "";
  for (let y = 0; y < size; y++) {
    let x = 0;
    while (x < size) {
      if (!modules[y][x]) { x++; continue; }
      let run = 1;
      while (x + run < size && modules[y][x + run]) run++;
      d += `M${x + quiet} ${y + quiet + 0.5}h${run}`;
      x += run;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${full} ${full}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="${full}" height="${full}" fill="#fff"/><path stroke="${color}" d="${d}"/></svg>`;
}

// 행렬을 PNG로(8비트 회색조). scale 은 한 칸의 픽셀 수.
export function qrPng(text, { level = "M", quiet = 4, scale = 16 } = {}) {
  const { size, modules } = qrMatrix(text, { level });
  const full = (size + quiet * 2) * scale;
  const raw = Buffer.alloc((full + 1) * full, 0xff);
  for (let py = 0; py < full; py++) {
    raw[py * (full + 1)] = 0; // 줄마다 "필터 없음"
    const y = Math.floor(py / scale) - quiet;
    if (y < 0 || y >= size) continue;
    for (let px = 0; px < full; px++) {
      const x = Math.floor(px / scale) - quiet;
      if (x >= 0 && x < size && modules[y][x]) raw[py * (full + 1) + 1 + px] = 0x00;
    }
  }
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c >>> 0;
  }
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const sum = Buffer.alloc(4); sum.writeUInt32BE(crc(body));
    return Buffer.concat([len, body, sum]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(full, 0); ihdr.writeUInt32BE(full, 4);
  ihdr[8] = 8; // 8비트, 나머지 0: 회색조, 압축·필터·인터레이스 기본값
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// 시험(tools/test-qr.mjs)이 쓰는 내부 단계들.
export const _internals = { BLOCKS, rsDivisor, rsRemainder, blank, drawFormat, MASKS };

//   node tools/qr.mjs <글> > qr.svg        node tools/qr.mjs <글> qr.png
if (process.argv[1] && process.argv[1].replaceAll("\\", "/").endsWith("tools/qr.mjs") && process.argv[2]) {
  if (process.argv[3]) (await import("node:fs")).writeFileSync(process.argv[3], qrPng(process.argv[2]));
  else process.stdout.write(qrSvg(process.argv[2]) + "\n");
}
