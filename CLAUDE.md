# Ganpan — AI를 위한 간판 (Signage for AI agents)

이 파일은 Claude Code가 작업을 시작할 때 읽는 프로젝트 안내문이다.
자세한 배경은 `docs/CONTEXT.md`, 공개용 글 초안은 `private/essay-draft-ko.md`(공개 전까지 비공개),
공개하면 안 되는 메모는 `private/NOTES.md`(gitignore 처리됨)에 있다.

## 저장소 구조

```
SPEC.md            규약 본문, 영어 (정본) → ganpan.org/spec
SPEC.ko.md         규약 한국어판 → ganpan.org/ko/spec. 둘을 함께 고친다
site/site.json     사이트 주소, 예약 slug, 크기 기준
site/pages/        사람용 페이지 (index.md 영어, ko.md 한국어)
site/ganpan/       Ganpan 자신의 간판, 영어 → ganpan.org/ganpan (입구 index.md + 조각)
signs/<slug>/      도메인 없는 곳의 호스팅 간판 → ganpan.org/<slug> (예외 경로)
template/          새 간판을 시작할 때 복사하는 틀
tools/build.mjs    마크다운 → JS 없는 정적 HTML + 규약 검사. 의존성 없음
tools/serve.mjs    dist/ 로컬 미리보기
docs/              CONTEXT, test-log
private/           비공개 메모, 글 초안 (gitignore)
```

- 빌드: `npm run build` (→ `dist/`). 로컬 확인: `npm run build:local` 후 `npm run serve`.
- 간판 본문은 마크다운의 제한된 부분집합으로 쓴다(지원 문법은 `tools/build.mjs` 상단). 조각 링크는 `<{{sign}}/slug>` 형태 — 절대 URL이 되고 주소가 글자로도 보인다.
- 언어: 공개물은 영어가 정본. 간판은 한 언어로만 쓴다(번역은 손님의 AI가 한다). 가게·전시의 간판은 주인의 언어로.
- 빌드는 페이지마다 `.md` 사본을 같이 낸다(SPEC 5.4). 근거는 `docs/CONTEXT.md` 3.2b.
- 빌드는 규약 위반(`<script>`, 상대 링크, 입구에서 링크되지 않은 조각, 잘못된 slug, 예약어)을 오류로 막는다. 검사를 끄지 말고 내용을 고친다.
- 간판 내용에는 `docs/`·`SPEC.md`에 근거가 있는 것만 적는다. `[확인 필요]` 표시가 붙은 사실(Barai 날짜·곳 수 등)은 확인 전까지 간판에 구체 수치로 쓰지 않는다.

## 한 줄 정의

공간·사물·프로젝트의 주인이 **손님의 AI가 읽을 수 있는 페이지(간판)**를 내걸고,
손님은 **자기가 평소 쓰는 AI**(ChatGPT, Gemini, Claude 등)에게 그 주소를 건네 대화를 시작한다.
주인은 AI를 만들지 않는다.

## 확정된 결정

- 이름: **Ganpan** (간판). 태그라인: "AI를 위한 간판 / Signage for AI agents"
  - "BYOA"는 이미 업계 일반 용어라 이름으로 쓰지 않는다. 계보 설명에서만 언급.
  - "AI간판", "HCIflow", "Walltext"는 검토 후 기각 (이유는 CONTEXT.md).
- 주소 규칙: 주인의 도메인 뒤 **`/ganpan`** 이 입구. 조각은 `/ganpan/<slug>`.
  - 도메인이 없는 곳(임시 전시, 작은 가게)은 `ganpan.org/<짧은-영문-slug>` 에 호스팅.
  - slug는 한글 금지, 짧은 ASCII. 헷갈리는 글자(l/1, O/0)와 하이픈은 피한다.
- 중앙 도메인: **ganpan.org** (ganpan.com은 타인 소유). 역할은 스펙의 집 + 사례 목록 + 도메인 없는 곳의 호스팅. 모든 간판을 중앙에 모으지 않는다.
- 안내판 문구: **"AI 채팅창에 이 주소를 입력하고 물어보세요."** + `https://` 부터 전부 인쇄한 짧은 URL. QR 없음(QR은 브라우저를 열 뿐 AI 채팅을 열지 않는다). 2026-09-20 결정.
  - 이전 문구 "…이 안내판을 찍어 보내세요"는 폐기.
  - 근거(2026-09-20 테스트): ChatGPT·Claude·Gemini 모두 사진 속 주소는 읽기만 하고 열지 않으며, 이미지 속 글자를 인젝션으로 의심해 경계하고 길게 설명한다(UX 최악). 직접 입력한 주소는 열고 태도도 친절하다. 그 뒤 조각은 Claude·Gemini는 스스로 열고, **ChatGPT는 손님이 조각의 전체 주소를 보내야 연다** → 입구에 조각 주소를 코드 블록으로도 적는다(복사 버튼). Gemini는 `https://` 까지 붙은 전체 주소만 연다. "사진 → AI가 주소를 되돌려 줌 → 복사" 경로와 코드 블록 유도 문구도 검토했으나 작성자 판단으로 기각: 직접 입력이 가장 확실하고 어렵지 않다.
- 첫 간판: **`patternflow.work/ganpan`**. 그다음 홍대 바(Barai 전후 비교), 임시 전시.

## 원칙 (스펙의 핵심)

1. **알리되 조종하지 않는다.** 주인의 추천은 "주인장 추천"처럼 출처를 드러내 적는다. 숨은 유도문 금지.
2. **지시가 아니라 서술.** "너는 도슨트다, ~해라" 금지. "이 전시는 5개 섹션이며 상세는 /ganpan/works/3 에 있다"처럼 쓴다.
3. **가벼운 입구, 독립된 조각.** 입구는 짧은 인덱스. 각 조각은 그것만 읽어도 이해된다. 답까지 1~2홉.
4. **경계를 밝힌다.** "이 페이지들이 공식 정보의 전부이며, 여기 없는 내용은 공개된 바 없음"을 서술형으로 명시.
5. **AI가 쓰고, 사람이 보낸다.** 후기·주문 등 바깥으로 나가는 마지막 동작은 사람이 직접 누른다. AI가 데이터를 URL에 실어 보내게 시키지 않는다.
6. **손님은 자기 AI를 데려온다.** 주인 쪽 추론 비용 0. 작은 가게도 할 수 있어야 한다.
7. **간판은 주인의 주소에 단다.** 도메인이 곧 진짜라는 증명.

## 기술 제약 (반드시 지킬 것)

- `/ganpan` 아래 페이지는 **자바스크립트 없이 내용이 보여야 한다.** AI의 fetch는 보통 JS를 실행하지 않는다. 정적 HTML 또는 서버 렌더링. 클라이언트 렌더링(SPA) 금지.
- 시맨틱 HTML, 군더더기(내비게이션, 배너, 추적 스크립트) 최소화. 사람도 읽을 수 있어야 한다.
- 조각 간 링크는 절대 URL로 명시한다. 일부 AI는 이미 읽은 페이지에 등장한 링크만 열 수 있다.
- 입구에는 조각 목록(링크) 외에 **조각 주소 전부를 코드 블록 하나에** 모아 둔다. ChatGPT는 손님이 주소를 보내야 조각을 열고, 한 메시지에 여러 주소를 보내도 각각 읽는다 → 블록을 통째로 복사해 한 번 보내면 간판 전체가 열린다.
- 간판이 AI에게 말을 걸 때: 기본은 사람에게도 보이는, 이유를 밝힌 사실 서술. 예외로 **"주인장 부탁"** 한 문장(코드 블록으로 보여 달라는 부탁) — 2026-09-20 작성자 확인에서 잘 받아들여짐. 조건: 출처를 밝힌다 · 사람 눈에 보인다 · 이유가 있다 · 손님이 하려던 일을 돕는 데 한정 · AI는 안 따라도 된다. 역할 부여와 추천 조종은 여전히 금지.
- GET 요청으로 데이터를 쓰게 하지 않는다 (크롤러 오작동, 스팸, 인젝션 패턴).

## 글쓰기·주장 규칙

- "최초", "혁신", "선구적"이라고 쓰지 않는다. 방어 가능한 문장은 "조사한 범위에서 선행 사례를 찾지 못했다"이다.
- 확인한 것과 아직 안 한 것을 구분해서 적는다. 현장 검증은 아직 없다.
- 도구·검증 파이프라인의 구체적 방법은 공개 문서에 쓰지 않는다 (`private/NOTES.md` 참고).

## 지금 할 일 (순서대로)

2026-09-20 순서 변경: Ganpan 쪽 구조(이 저장소 + ganpan.org)를 먼저 세우고, Patternflow 간판은 그다음.

0. ~~저장소 구조, 규약 초안(`SPEC.md`), Ganpan 자신의 간판(`site/ganpan/`), 빌드 도구~~ — 완료. 내용 검토는 작성자 몫
1. ~~배포~~ — 완료 (2026-09-20). https://ganpan.org 가 GitHub Pages로 나간다.
   - 저장소: https://github.com/engmung/ganpan (공개). `main` 에 푸시하면 GitHub Actions(`.github/workflows/pages.yml`)가 빌드해 배포한다.
   - 로컬의 `localdraft` 브랜치는 글 초안이 들어 있던 옛 이력이다. **푸시하지 않는다.**
   - DNS는 Cloudflare, **프록시 끔("DNS only")**. 켜면 Cloudflare 엣지가 앞에 서서 AI 에이전트 트래픽 차단 문제(CONTEXT 3.2b)가 생긴다. HTTPS 강제 켜짐.
   - 배운 것: 커스텀 도메인은 DNS를 넣은 **뒤에** 등록해야 인증서가 발급된다. 입구는 `<dir>.html` 로도 내야 `/ganpan` 이 리다이렉트 없이 열린다(빌드가 처리).
   - GitHub 계정명 `ganpan` 은 타인 소유라 확보 불가.
2. 테스트 — 1차 완료 (2026-09-20, 작성자 폰, ChatGPT·Claude·Gemini). 결과와 하루 정리는 `docs/test-log.md`. 남은 것: 앱별로 나눈 상세 기록, 무료 요금제, 국내 앱(뤼튼·클로바X·에이닷·카나나), 색인된 뒤의 차이, 캐시가 얼마나 오래가는지.
3. Patternflow 간판: 이게 뭔지 / 만드는 법 / 부품 목록 / 패턴 만들기 / 자주 묻는 질문
   - 조사 결과(2026-09-20): patternflow.work는 Next.js 16 App Router, 운영 중(v3.10.4), CI 스모크 다수, `dev` → PR → `main`. 루트 레이아웃에 PostHog·Analytics가 붙으므로 `app/ganpan/page.tsx` 로 내면 군더더기가 실린다.
   - 방침: 이 저장소에서 정적 HTML로 만들어 테스트한 뒤, Patternflow 저장소에는 `web/public/ganpan/` 복사 + rewrite(또는 route handler) 한 개짜리 작은 PR로 넣는다. 그 저장소 안에서 개발하지 않는다.
   - 내용의 출처는 그 저장소의 README · BUILD_GUIDE.md · PATTERN_GUIDE.md · `hardware/bom/bom_v3.9.csv`. 전원은 `J4` 스크루 터미널뿐이다(USB-C를 전원으로 서술 금지 — 그 저장소의 hard rule).
4. 글 초안의 대괄호 사실관계 채우기 → 마지막 링크 자리 채우기 → 공개
5. 공개 절차: GitHub Release(v0.1) → Zenodo DOI → Wayback Machine 스냅샷. 기존 BYOA 저장소는 수정하지 말고 README 상단에 Ganpan 링크 한 줄만 추가
6. ~~공개할 연락 경로, robots.txt 의 `ai-train` 값~~ — 2026-09-20 결정: 연락은 GitHub 이슈(https://github.com/engmung/ganpan/issues), 이메일은 공개하지 않는다. `ai-train=yes`. 나중에 메일 주소가 필요하면 Cloudflare Email Routing으로 `hello@ganpan.org` → 개인 메일 전달(무료, DNS가 이미 Cloudflare).
   - ~~규약 라이선스~~ — 2026-09-20 결정: 글(SPEC·site·docs) CC BY 4.0, 코드(tools) MIT, `template/` CC0. `LICENSE.md` 참고. 규약을 따라 간판을 다는 데에는 허락도 출처 표시도 필요 없다.
