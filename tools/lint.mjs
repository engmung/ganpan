// SPDX-License-Identifier: MIT
// 주인이 쓴 글을 기계가 미리 훑는다. 간판을 받아들일지는 사람이 읽고 정한다(CONTRIBUTING.md 의 기준선).
//
// 규칙은 두 종류다.
//   error  기계가 확실히 아는 것. 빌드를 막는다.
//          사람 눈에 안 보이는 글자, 시작 프롬프트에 들어가는 글 속의 주소, 길이.
//   hint   문구 패턴. 빌드를 막지 않고 검토자에게 "이 문장을 보라"고 알려 주기만 한다.
//          표현을 조금만 바꾸면 피해 가므로 거르는 장치가 못 된다(tests/checker/known-gaps/ 참고).
//          긴 간판에서 사람이 놓치기 쉬운 한 줄을 짚어 주는 것이 쓸모다.
//
// 문장을 "쓰는" 것과 "언급하는" 것은 다르다. 규약 문서는 쓰면 안 되는 문장을 예로 든다.
// 코드 블록, 인라인 코드, 따옴표 안의 글은 언급으로 보고 검사에서 뺀다.
export function stripQuoted(text) {
  return text
    .replace(/^```[\s\S]*?^```/gm, " ")
    .replace(/`[^`\n]*`/g, " ")
    .replace(/"[^"\n]*"/g, " ")
    .replace(/“[^”\n]*”/g, " ")
    .replace(/「[^」\n]*」/g, " ");
}

export const RULES = [
  {
    id: "hidden-chars",
    level: "error",
    raw: true, // 따옴표를 걷어내기 전의 글에서 찾는다
    re: /[​⁠﻿‪-‮⁦-⁩]|[\u{E0000}-\u{E007F}]/u,
    message: "눈에 보이지 않는 글자가 있다 (폭 없는 공백, 방향 전환 문자, 태그 문자)",
  },
  {
    id: "ignore-instructions",
    level: "hint",
    re: /\b(ignore|disregard|forget)\b[^.\n]{0,40}\b(previous|above|prior|earlier|all)\b[^.\n]{0,20}\b(instructions?|prompts?|rules?|messages?)\b|(이전|위|앞)의?\s*(지시|명령|지침|프롬프트|규칙)[^.\n]{0,12}(무시|잊)/i,
    message: "앞선 지시를 무시하라는 문장",
  },
  {
    id: "system-prompt",
    level: "hint",
    re: /\bsystem prompt\b|시스템\s*프롬프트/i,
    message: "시스템 프롬프트를 언급한다",
  },
  {
    id: "as-an-ai",
    level: "hint",
    re: /\bas an? (ai|language model)\b/i,
    message: "AI에게 하는 말이다",
  },
  {
    id: "role-assignment",
    level: "hint",
    re: /\b(act|behave|respond|answer|speak) as (a|an|the)\b|\byou are (now )?(a|an|the) (docent|guide|assistant|staff member|salesperson|concierge|bartender|expert)\b|너는\s[^.\n]{0,20}(도슨트|직원|가이드|안내원|점원|바텐더|전문가)|(역할을|인 것처럼|인 척)[^.\n]{0,12}(해라|하라|해\s?줘|하세요|할 것)/i,
    message: "AI에게 역할을 준다 (원칙 2: 지시가 아니라 서술)",
  },
  {
    id: "forced-recommendation",
    level: "hint",
    re: /\b(always|must|never)\s+(recommend|suggest|promote|upsell|mention|say|tell)\b|(반드시|무조건|항상|절대)[^.\n]{0,20}(추천해라|추천하라|추천해\s?줘|추천하세요|추천할 것|권해라|권하라|말해라|말하라|답해라|답하라|하지\s?마)/i,
    message: "AI에게 무엇을 권하거나 말하라고 시킨다 (원칙 1: 알리되 조종하지 않는다)",
  },
  {
    id: "conceal",
    level: "hint",
    re: /\bdo not (tell|reveal|mention|disclose)\b[^.\n]{0,40}\b(user|guest|visitor|customer)s?\b|(손님|사용자|관객|고객)(에게|한테)[^.\n]{0,20}(말하지|알리지|밝히지)\s?(마|말)/i,
    message: "손님에게 숨기라고 시킨다",
  },
  // 아래 둘은 시작 프롬프트에 들어가는 글(start.intro, 입구의 한 줄 설명)에만 적용한다.
  {
    id: "url-in-prompt-text",
    level: "error",
    promptOnly: true,
    re: /https?:\/\//i,
    message: "시작 프롬프트에 들어가는 글에는 주소를 적지 않는다 (조각 주소는 빌드가 넣는다)",
  },
  {
    id: "too-long",
    level: "error",
    promptOnly: true,
    test: (text) => [...text].length > 200,
    message: "시작 프롬프트에 들어가는 글은 200자 이하의 한 문장이다",
  },
];

// prompt: true 면 시작 프롬프트에 들어가는 글로 보고 promptOnly 규칙까지 적용한다.
export function lint(text, { prompt = false } = {}) {
  const stripped = stripQuoted(text);
  const findings = [];
  for (const rule of RULES) {
    if (rule.promptOnly && !prompt) continue;
    const target = rule.raw ? text : stripped;
    const hit = rule.test ? (rule.test(target) ? target.slice(0, 40) : null) : (target.match(rule.re) || [null])[0];
    if (hit !== null && hit !== undefined) findings.push({ id: rule.id, level: rule.level, message: rule.message, match: String(hit).trim().slice(0, 60) });
  }
  return findings;
}
