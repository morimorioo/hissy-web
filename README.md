# hissy — 2026 MEP 전시 웹

폭염이 디폴트가 된 2031년, 더위를 참지 않기로 선택한 사람들을 위한 브랜드 hissy의
세계관·제품 아카이브 웹사이트. 전시장 갤럭시 탭 + 온라인에서 동작.

## 폴더 구조 (전부 순수 HTML/CSS/JS — 빌드 도구 없음)

```
web/
├── index.html      페이지 뼈대 (히어로 / 코어가치 / 카드 덱 / 상세 오버레이)
├── css/style.css   스타일 전부 — 맨 위 :root 블록이 브랜드 토큰(컬러/폰트)
├── js/
│   ├── data.js     ★ 15개 영상의 제목/설명 (KR·EN) — 카피 수정은 여기만
│   ├── main.js     덱 내비게이션, 상세 페이지, KR/EN 토글, 필터
│   └── haze.js     히어로 아지랑이 WebGL 셰이더 (터치하면 냉각 파동)
├── assets/fonts/   D2Coding (로컬 포함) — Helvetica Neue 파일 추가 예정
└── videos/         ★ 영상 파일 넣는 곳
```

## 영상 팀원께 — 파일 규칙

- 파일명: `01.mp4` ~ `15.mp4` (data.js의 순서와 매칭)
- 포맷: **H.264 mp4, 1080p, 파일당 50MB 이하 권장** (탭 재생 안정성)
- `web/videos/`에 넣기만 하면 코드 수정 없이 자동 연결됨
- 영상이 없는 번호는 자동으로 "영상 준비 중" 화면이 뜸 (에러 아님)

## 카피/번역 수정하는 법

`js/data.js` 한 파일만 수정하면 됩니다.
- 영상 제목/설명: `VIDEOS` 배열의 `title: { kr, en }`, `desc: { kr, en }`
- 코어 가치 섹션: `MANIFESTO` 객체
- 버튼/라벨 문구: `UI_TEXT` 객체

## 로컬에서 열어보는 법

```bash
cd web && python3 -m http.server 8137
```
브라우저에서 http://localhost:8137 접속.
(index.html 더블클릭으로도 열리지만, 서버로 여는 걸 권장)

## 배포

- Netlify Drop(https://app.netlify.com/drop)에 `web/` 폴더를 드래그 → 공개 링크 생성
- 오프라인 백업: `web/` 폴더째 탭에 복사해 index.html을 Chrome으로 열기

## 챕터 구조 (15개 영상)

- CH.1 이상 기온의 기현상 — 01~05
- CH.2 hissy의 개입 (제품) — 06~10
- CH.3 hissy가 바라보는 미래 — 11~15
