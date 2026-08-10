/* ============================================================
   hissy — 콘텐츠 데이터
   15개 영상의 모든 텍스트가 이 파일에 있습니다.
   실제 카피가 나오면 여기의 kr / en 값만 바꾸면 사이트 전체에 반영됩니다.
   영상 파일은 web/videos/01.mp4 ~ 15.mp4 로 넣으세요.
   ============================================================ */

// 챕터 정의 (가안 — 확정되면 이름만 수정)
const CHAPTERS = {
  ch1: {
    id: 'ch1',
    label: { kr: '01 — 기현상', en: '01 — PHENOMENA' },
    name: { kr: '이상 기온의 기현상', en: 'Phenomena of Abnormal Heat' },
  },
  ch2: {
    id: 'ch2',
    label: { kr: '02 — 제품', en: '02 — PRODUCT' },
    name: { kr: 'hissy의 개입', en: 'The hissy Intervention' },
  },
  ch3: {
    id: 'ch3',
    label: { kr: '03 — 미래', en: '03 — FUTURE' },
    name: { kr: 'hissy가 바라보는 미래', en: 'The Future hissy Sees' },
  },
};

// ── 15개 영상 (임시 카피 — 코어 가치 수령 후 톤 교정 예정) ──
const VIDEOS = [
  // CH.1 이상 기온의 기현상 (01–05)
  {
    id: 1, chapter: 'ch1',
    title: { kr: '아스팔트 위의 신기루', en: 'MIRAGE ON ASPHALT' },
    desc: {
      kr: '한낮의 도로가 물처럼 일렁입니다. 열은 이제 풍경을 왜곡하는 렌즈가 되었습니다.',
      en: 'Midday roads shimmer like water. Heat has become a lens that bends the city itself.',
    },
  },
  {
    id: 2, chapter: 'ch1',
    title: { kr: '30°C의 밤', en: 'NIGHT OF 30°C' },
    desc: {
      kr: '해가 져도 식지 않는 도시. 밤은 더 이상 회복의 시간이 아닙니다.',
      en: 'A city that never cools after sunset. Night is no longer a time of recovery.',
    },
  },
  {
    id: 3, chapter: 'ch1',
    title: { kr: '녹아내리는 시간', en: 'MELTING HOUR' },
    desc: {
      kr: '가장 뜨거운 오후 2시. 모든 움직임이 느려지고, 도시는 정지에 가까워집니다.',
      en: 'The hottest hour of the day. Everything slows, and the city approaches stillness.',
    },
  },
  {
    id: 4, chapter: 'ch1',
    title: { kr: '열섬', en: 'HEAT ISLAND' },
    desc: {
      kr: '콘크리트와 유리가 만든 인공의 사막. 도시 스스로가 열을 만들어냅니다.',
      en: 'An artificial desert of concrete and glass. The city generates its own heat.',
    },
  },
  {
    id: 5, chapter: 'ch1',
    title: { kr: '가장 긴 여름', en: 'THE LONGEST SUMMER' },
    desc: {
      kr: '여름은 계절이 아니라 조건이 되었습니다. 우리는 그 안에서 살아갑니다.',
      en: 'Summer is no longer a season but a condition. We live inside it.',
    },
  },

  // CH.2 hissy의 개입 (06–10)
  {
    id: 6, chapter: 'ch2',
    title: { kr: '카트리지', en: 'CARTRIDGE' },
    desc: {
      kr: '손안의 겨울. 체결하는 순간, 전환이 시작됩니다.',
      en: 'Winter in your hand. The moment it locks in, the shift begins.',
    },
  },
  {
    id: 7, chapter: 'ch2',
    title: { kr: '첫 번째 히스', en: 'FIRST HISS' },
    desc: {
      kr: '짧은 소리와 함께 퍼지는 냉기. hissy의 이름이 시작된 순간.',
      en: 'A short sound, then the cold spreads. The moment hissy got its name.',
    },
  },
  {
    id: 8, chapter: 'ch2',
    title: { kr: '차가움을 입다', en: 'WEARING COLD' },
    desc: {
      kr: '시원함은 공간이 아니라 착용하는 것. 냉기가 흐르는 의류의 구조.',
      en: 'Coolness is not a place — it is worn. Inside the garment where cold flows.',
    },
  },
  {
    id: 9, chapter: 'ch2',
    title: { kr: '즉각적인 겨울', en: 'INSTANT WINTER' },
    desc: {
      kr: '기다림 없는 온도 전환. 원하는 순간, 원하는 만큼.',
      en: 'Temperature shift without the wait. The moment you want, as much as you want.',
    },
  },
  {
    id: 10, chapter: 'ch2',
    title: { kr: '쿨링 리추얼', en: 'COOLING RITUAL' },
    desc: {
      kr: '하루에도 수차례 반복되는 짧은 의식. 열을 지우는 새로운 습관.',
      en: 'A short ritual, repeated through the day. A new habit of erasing heat.',
    },
  },

  // CH.3 hissy가 바라보는 미래 (11–15)
  {
    id: 11, chapter: 'ch3',
    title: { kr: '숨 쉬는 도시', en: 'CITY THAT BREATHES' },
    desc: {
      kr: '개인의 냉각이 모여 도시의 온도를 바꿉니다. hissy가 그리는 도시의 호흡.',
      en: 'Personal cooling, multiplied, changes the city. The breathing city hissy imagines.',
    },
  },
  {
    id: 12, chapter: 'ch3',
    title: { kr: '계절의 리셋', en: 'SEASON RESET' },
    desc: {
      kr: '계절을 기다리지 않고 스스로 만드는 시대. 온도의 주도권이 이동합니다.',
      en: 'An era that makes its own seasons. The ownership of temperature is shifting.',
    },
  },
  {
    id: 13, chapter: 'ch3',
    title: { kr: '차가움의 공유지', en: 'COLD COMMONS' },
    desc: {
      kr: '시원함이 소수의 실내에 갇히지 않는 미래. 모두에게 열린 냉각.',
      en: 'A future where coolness is not locked indoors. Cooling, open to everyone.',
    },
  },
  {
    id: 14, chapter: 'ch3',
    title: { kr: '일기예보 2031', en: 'FORECAST 2031' },
    desc: {
      kr: '2031년의 날씨 뉴스는 무엇을 말하게 될까요. hissy가 예측하는 일상.',
      en: 'What will the weather report say in 2031? The everyday hissy predicts.',
    },
  },
  {
    id: 15, chapter: 'ch3',
    title: { kr: '더위가 지나간 뒤', en: 'AFTER THE HEAT' },
    desc: {
      kr: '열기가 지워진 자리에 남는 것. hissy가 바라보는 가장 먼 미래.',
      en: 'What remains where the heat has been erased. The furthest future hissy sees.',
    },
  },
];

// 영상 파일 경로 규칙: videos/01.mp4 ~ videos/15.mp4
VIDEOS.forEach((v) => {
  v.src = `videos/${String(v.id).padStart(2, '0')}.mp4`;
});

/* ── 섹션별 콘텐츠 (피그마 1차 시안 기준) ── */

// "히씨가 정의한 미래" 섹션
const FUTURE = {
  tempLabel: '2031+N Temperature',
  temp: '40°C',
  cap: {
    kr: '40도를 웃도는 날씨가 기어코 상수가 되는, 히씨가 그리는 미래',
    en: 'A future where 40°C weather finally becomes the constant — as hissy sees it',
  },
  capSub: {
    kr: '기현상 아카이브 — 과열된 도시의 기록',
    en: 'phenomena archive — records of an overheated city',
  },
};

// "히씨 제품" 섹션 — 세로 스크롤 스테이지 구조
// ※ 설명(body)과 스펙(spec)은 시안 원칙대로 KR/EN 모드 모두 '영어 고정'
// ※ 스테이지 추가/삭제는 stages 배열에 항목을 넣고 빼면 끝
const PRODUCT = {
  // 하단 캡션도 시안 원칙대로 KR/EN 모두 영어 고정
  cap: { kr: 'Hissy Product', en: 'Hissy Product' },
  capSub: { kr: 'Cartridge + Garment System', en: 'Cartridge + Garment System' },
  stages: [
    {
      id: 'cartridge',
      // 좌상단 타이포 / 우하단 타이포 (반복 대신 호응하는 두 문구)
      titleA1: 'CO₂ Cartridge',
      titleA2: 'Ultra Rapid Cooling',
      titleB1: 'Lock In',
      titleB2: 'Cool Down',
      imgLabel: 'CO₂ Cartridge',
      media: 'assets/cartridge.mp4', // 정사각 틀에 중앙 크롭으로 재생
      body: 'The city overheats in minutes.\n\nHissy responds in one action. Insert a CO₂ cartridge into the garment port, and cooling airflow moves through concealed channels to interrupt heat across the body. No detours. No waiting for summer to behave.\nOne Hiss is enough to take back control.',
      spec: '[A]\nCartridge engaged\n\n+0°C',
    },
    {
      id: 'garment',
      titleA1: 'Hissy Garment',
      titleA2: 'Wearable Climate',
      titleB1: 'Wear the Cold',
      titleB2: 'Own the Summer',
      imgLabel: 'Hissy Garment',
      media: 'assets/garment.mp4',
      body: 'Cold is not a place. It is worn.\n\nConcealed channels run through the garment, carrying cooling airflow along the body’s heat lines. The silhouette stays sharp; the system stays invisible.\nCooling becomes something you put on — not somewhere you go.',
      spec: '[B]\nChannels active\n\n-12°C',
    },
    {
      id: 'system',
      titleA1: 'One Hiss',
      titleA2: 'Instant Winter',
      titleB1: 'Heat Ends',
      titleB2: 'Here',
      imgLabel: 'Full System',
      // 여러 장의 사진을 1초 간격 루프 — assets/system-01.jpg(.png), system-02… 로 넣으면 자동 인식
      framesBase: 'assets/system-',
      framesMax: 12,
      body: 'Cartridge in. Heat out.\n\nThe full hissy system — cartridge and garment, one action apart.',
      spec: '[C]\nSystem complete\n\n-18°C',
    },
  ],
};

// 공통 UI 문구
const UI_TEXT = {
  heroTag: { kr: 'SEOUL, 2031 — 35°C AND CLIMBING', en: 'SEOUL, 2031 — 35°C AND CLIMBING' },
  heroTitle: { kr: 'hissy', en: 'hissy' },
  heroSub: {
    kr: '선 넘는 여름엔, 자비 없는 애티튜드로.',
    en: 'GETTING HEATED? MAKE IT HISSY.',
  },
  scrollHint: { kr: '아래로 스크롤', en: 'SCROLL' },
  deckTitle: { kr: '아카이브', en: 'ARCHIVE' },
  filterAll: { kr: '전체', en: 'ALL' },
  comingSoon: { kr: '영상 준비 중', en: 'VIDEO COMING SOON' },
  close: { kr: '닫기', en: 'CLOSE' },
  touchHint: { kr: '화면을 터치해 열기를 식혀보세요', en: 'TOUCH THE SCREEN TO COOL IT DOWN' },
  navWorldview: { kr: 'Worldview', en: 'Worldview' },
  navInfo: { kr: 'Info', en: 'Info' },
};

/* ── 코어 가치 섹션 (애티튜드 선언) ── */
const MANIFESTO = {
  label: { kr: 'CORE — ATTITUDE', en: 'CORE — ATTITUDE' },
  // 큰 헤드라인 (줄 단위)
  head: {
    kr: ['참지 않기로', '선택한 사람들'],
    en: ['Instant', 'Native'],
  },
  body: {
    kr: 'HISSY를 입는 사람들은 더위를 1초도 못 참는 것이 아니라, 참지 않기로 선택한 사람들이다. 카트리지를 결합하는 짧은 액션 하나로 냉각 공기가 몸을 흐르고, 더위를 참고 버티는 대신 원하는 순간 직접 시원함을 선택한다. 그 순간은 냉방 제품을 쓰는 행동을 넘어, "나는 더위를 참지 않는 사람"임을 보여주는 감각적 플렉스가 된다.',
    en: 'Those who wear HISSY are not people who can’t stand the heat for one second — they are people who chose not to. One short click of a cartridge sends cooling air through the body: instead of enduring, you choose coolness the moment you want it. The act goes beyond using a cooling device — it becomes a sensory flex, proof that you are someone who does not endure heat.',
  },
  pillars: [
    {
      name: 'Micro',
      sub: { kr: '필요한 순간만 작동하는 냉각', en: 'Cooling only when it matters' },
      desc: {
        kr: '미래 도시의 더위는 목적지 사이 짧은 구간마다 반복되는 Heat Friction. HISSY는 공간 전체가 아닌, 불쾌함을 느끼는 짧은 순간에 집중한다.',
        en: 'Urban heat repeats in short bursts between destinations — heat friction. HISSY focuses not on whole spaces, but on the brief moments of discomfort.',
      },
    },
    {
      name: 'Instant',
      sub: { kr: '참는 시간 없이 시작되는 열쾌감', en: 'Thermal pleasure, zero waiting' },
      desc: {
        kr: '결합 한 번의 액션으로 냉각 공기가 몸을 흐르고, 더위로 흐트러진 상태를 즉시 전환한다. 스스로의 기후를 즉각 바꾸는 주도권.',
        en: 'One click, and cooling air flows — instantly resetting a state undone by heat. The agency to change your own climate, now.',
      },
    },
    {
      name: 'Anywhere',
      sub: { kr: '시원함을 찾는 대신, 입는 방식', en: 'Wear coolness, don’t chase it' },
      desc: {
        kr: '도로, 정류장, 골목처럼 냉방이 닿지 않는 도시의 틈에서도 작동한다. 기후에 자신을 맞추는 대신, 어디서든 자신의 기후를 꺼내 입는다.',
        en: 'It works in the gaps of the city — roads, bus stops, alleys — where cooling never reaches. Instead of adapting to the climate, you wear your own, anywhere.',
      },
    },
  ],
  // 스펙시트는 브랜드 그래픽 모티프라 양쪽 언어 동일 (EN 고정)
  spec: {
    title: 'ATTITUDE SPEC SHEET',
    rows: [
      { k: 'DISCOMFORT WINDOW', v: '< 1 MIN' },
      { k: 'ENDURANCE MODE', v: 'OFF' },
      { k: 'HEAT SENSITIVITY', v: 'HIGH' },
      { k: 'COOLING PRIORITY', v: 'MAX' },
      { k: '"WHY WAIT?"', v: 'DEFAULT' },
      { k: '"JUST DEAL WITH IT"', v: 'REJECTED', red: true },
    ],
    footer: 'NO VIRTUE IN ENDURANCE — HISSY™ 2031',
  },
};
