# site/signs/ — 호스팅 간판

도메인이 없는 곳(임시 전시, 작은 가게)의 간판이 사는 곳. `site/signs/<slug>/` 가 `ganpan.org/<slug>` 로 나간다.
이것은 예외 경로다. 도메인이 있는 주인의 간판은 그 주인의 주소(`/ganpan`)에 달고, 여기에 모으지 않는다.

## 간판 하나의 구성

```
site/signs/<slug>/
  sign.json     제목, 주인, 언어, 경계 문장, 갱신일, 상태
  index.md      입구
  <piece>.md    조각 (파일 이름이 곧 slug)
```

`site/template/` 을 복사해서 시작한다. 간판은 풀 리퀘스트(또는 "Propose a hosted sign" 이슈)로 들어오고, 관리자가 하나하나 읽어 보고 합친다. 절차는 `.github/CONTRIBUTING.md`. 코딩 에이전트에게 맡기려면 `docs/agent-playbook.md`.

## slug 규칙 (빌드가 검사한다)

- 소문자 ASCII와 숫자만. 한글·하이픈 금지.
- `site/site.json` 의 `reserved` 에 있는 이름은 쓸 수 없다 (`ganpan`, `spec` 등 사이트 자체의 경로).
- 이 slug는 안내판에 인쇄되고, 손님이 보고 직접 입력하기도 한다. 숫자 `0`·`1` 이 들어가거나 숫자와 `l`·`o` 가 섞이면 경고가 난다.

## sign.json

```json
{
  "title": "간판 이름",
  "owner": "주인 이름",
  "lang": "ko",
  "status": "open",
  "updated": "2026-09-20",
  "boundary": "이 간판의 페이지들이 ○○에 대해 주인이 공개한 공식 정보의 전부다. 여기에 없는 내용은 공개된 바 없다."
}
```

`start.intro` 는 시작 프롬프트의 첫 문장이다. 손님의 목소리로, 언어별로 한 문장씩 쓴다("나 지금 OO에 와 있어."). 추천이나 주소는 넣지 않는다. 나머지 프롬프트는 빌드가 고정된 틀로 만든다.

```json
"start": { "intro": { "ko": "나 지금 OO 전시에 와 있어.", "en": "I am at the OO exhibition." } }
```

끝난 간판은 지우지 않는다. `"status": "closed"` 와 `"closed": "2026-10-31"` 을 적으면 모든 페이지 위에 종료 안내가 붙는다.

## 본문에서 쓸 수 있는 변수

- `{{sign}}` — 이 간판의 입구 URL. 조각 링크는 `<{{sign}}/menu>` 처럼 쓴다 (절대 URL이 되고, 주소가 글자로도 보인다).
- `{{base}}` — 사이트 주소.
