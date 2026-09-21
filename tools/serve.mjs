#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// dist/ 를 로컬에서 본다. 정적 호스트의 clean URL 동작(/x → x.html, /x → x/index.html)을 흉내 낸다.
//   node tools/serve.mjs [port]

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const TYPES = { ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png" };

http
  .createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/\/+$/, "");
    const base = path.join(DIST, pathname);
    const file = [base, `${base}.html`, path.join(base, "index.html")].find(
      (f) => f.startsWith(DIST) && fs.existsSync(f) && fs.statSync(f).isFile()
    );
    if (!file) {
      res.writeHead(404, { "content-type": TYPES[".txt"] });
      return res.end("404");
    }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`http://localhost:${PORT}`));
