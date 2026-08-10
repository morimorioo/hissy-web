/* ============================================================
   hissy — 메인 동작 (피그마 1차 시안 구조)
   가로 스크롤 콜라주 / 영화뷰 / KR·EN 토글 / 섹션 텍스트
   ============================================================ */

const state = {
  lang: 'kr',
  focusedId: null, // 콜라주에서 중앙에 온 영상
};

const $ = (id) => document.getElementById(id);

/* ============================================================
   세계관 영상 — 가로 스크롤 콜라주
   피그마 시안의 카드 배치(5장 패턴)를 3번 반복해 15장을 흩뿌림
   ============================================================ */

// 시안 좌표 [x, y, w, h] — 1600×1000 프레임 기준
const COLLAGE_PATTERN = [
  [-65, 330, 305, 389],
  [56, 604, 419, 309],
  [546, 435, 249, 257],
  [897, 87, 249, 403],
  [1059, 335, 596, 404],
];
const GROUP_SPAN = 1780; // 패턴 한 세트가 차지하는 가로 폭

const viewport = $('collageViewport');
const track = $('collageTrack');

function buildCollage() {
  track.innerHTML = '';
  const scale = viewport.clientHeight / 1000; // 시안 1000px 높이 기준 배율
  let maxRight = 0;

  VIDEOS.forEach((v, i) => {
    const p = COLLAGE_PATTERN[i % COLLAGE_PATTERN.length];
    const group = Math.floor(i / COLLAGE_PATTERN.length);
    // 그룹마다 y를 살짝 어긋나게 해서 반복 티가 안 나게
    const jitterY = group === 1 ? -40 : group === 2 ? 55 : 0;

    const x = (p[0] + group * GROUP_SPAN + 90) * scale; // +90: 첫 카드가 화면 밖에서 시작하지 않게
    const y = Math.max(70, Math.min(1000 - p[3] - 90, p[1] + jitterY)) * scale;
    const w = p[2] * scale;
    const h = p[3] * scale;

    const card = document.createElement('div');
    // 콜라주 카드도 슬라이드 인 대상 — 아래에서 순차 등장 (5장 단위로 스태거)
    card.className = 'collage-card reveal reveal--up';
    card.dataset.id = v.id;
    card.style.cssText =
      `left:${x}px; top:${y}px; width:${w}px; height:${h}px; --reveal-delay:${(i % 5) * 0.09}s;`;
    // 부유 모션·터치 반응 계산용 캐시 (매 프레임 좌표 계산 대신)
    card._x = x; card._y = y; card._w = w; card._h = h;
    card._ph = i * 1.7;                  // 부유 위상 (카드마다 다르게)
    card._spd = 0.55 + (i % 4) * 0.12;   // 부유 속도 (카드마다 다르게)
    if (v.id >= 7) {
      // 아직 공개 전 영상: 검은 박스 + Open D-1 (클릭·영상 로드 없음)
      card.classList.add('is-locked');
      card.innerHTML = `<span class="locked-label">Open D-1</span>`;
    } else {
      card.innerHTML = `<span class="card-num">${String(v.id).padStart(2, '0')}</span>`;
      card.dataset.src = v.src;
      card.addEventListener('click', () => openCinema(v, card));
    }
    track.appendChild(card);

    maxRight = Math.max(maxRight, x + w);
  });

  track.style.width = `${maxRight + 120 * scale}px`;
  watchCardMedia();
  updateFocus();
}

/* 카드 영상 미리보기 — 화면에 보일 때만 로드/재생 (탭 성능 보호)
   영상 파일이 아직 없는 카드는 회색 박스 유지 */
let mediaObserver = null;
function watchCardMedia() {
  if (mediaObserver) mediaObserver.disconnect();
  if (!('IntersectionObserver' in window)) return;
  mediaObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const card = entry.target;
      let vid = card.querySelector('video');
      if (entry.isIntersecting) {
        if (!vid) {
          vid = document.createElement('video');
          vid.src = card.dataset.src;
          vid.muted = true;
          vid.loop = true;
          vid.playsInline = true;
          vid.setAttribute('playsinline', '');
          vid.preload = 'metadata';
          vid.onerror = () => vid.remove();
          card.prepend(vid);
        }
        vid.play().catch(() => {});
      } else if (vid) {
        vid.pause();
      }
    });
  }, { threshold: 0.1 });
  [...track.children].forEach((c) => {
    if (!c.classList.contains('is-locked')) mediaObserver.observe(c);
  });
}

/* 중앙에 가장 가까운 카드 → 캡션 갱신 + 멀리 있는 카드 흐리게 */
function updateFocus() {
  const center = viewport.scrollLeft + viewport.clientWidth / 2;
  let best = null;
  let bestD = Infinity;

  [...track.children].forEach((card) => {
    const cx = card.offsetLeft + card.offsetWidth / 2;
    const d = Math.abs(cx - center);
    card.classList.toggle('is-far', d > viewport.clientWidth * 0.55);
    if (d < bestD) { bestD = d; best = card; }
  });

  if (best) {
    const v = VIDEOS.find((x) => x.id === Number(best.dataset.id));
    if (v && state.focusedId !== v.id) {
      state.focusedId = v.id;
      renderWorldviewCap(v);
    }
  }
}

function renderWorldviewCap(v) {
  const num = String(v.id).padStart(2, '0');
  $('wvCap').textContent = `${num} — ${v.title[state.lang]}`;
  $('wvCapSub').textContent = v.desc[state.lang];
}

viewport.addEventListener('scroll', () => requestAnimationFrame(updateFocus));

/* ── 스크롤 방향 기울기 + 터치 반응 + 카드 부유 모션 + 영화뷰 확대 ──
   매 프레임 목표값을 부드럽게 따라가는 방식(lerp) */
let tiltVel = 0, tiltCur = 0, zoomTarget = 1, zoomCur = 1, lastScrollLeft = 0;
let touchX = -9999, touchY = -9999, touchHeat = 0; // 터치 지점과 반응 강도

viewport.addEventListener('scroll', () => {
  const sl = viewport.scrollLeft;
  // 스크롤 속도 → 기울기 목표값 (터치 스크롤은 델타가 작아서 배율 높게)
  tiltVel = Math.max(-14, Math.min(14, (sl - lastScrollLeft) * 0.55));
  lastScrollLeft = sl;
});

viewport.addEventListener('pointermove', (e) => {
  touchX = e.clientX;
  touchY = e.clientY;
  touchHeat = Math.min(touchHeat + 0.25, 1);
});
viewport.addEventListener('pointerdown', (e) => {
  touchX = e.clientX;
  touchY = e.clientY;
  touchHeat = 1;
});
viewport.addEventListener('pointerleave', () => { touchHeat = 0; });

(function collageLoop(now) {
  tiltCur += (tiltVel - tiltCur) * 0.1;   // 목표를 향해 서서히
  tiltVel *= 0.94;                         // 손을 떼면 제자리로
  zoomCur += (zoomTarget - zoomCur) * 0.12;
  touchHeat *= 0.97;                       // 손을 떼면 반응이 서서히 잦아듦

  // 트랙 전체: 기울기 + 확대 (회전 축은 지금 보이는 화면 중앙)
  // 기울기 방향 = 손가락이 움직이는 방향 (콘텐츠 이동 방향과 동일)
  const originX = viewport.scrollLeft + viewport.clientWidth / 2;
  track.style.transformOrigin = `${originX}px 50%`;
  track.style.transform =
    `perspective(1200px) rotateY(${tiltCur.toFixed(3)}deg) scale(${zoomCur.toFixed(4)})`;

  // 카드 개별: 두둥실 부유 + 아주 느린 위글(기울어짐) + 터치 반응
  const t = now * 0.001;
  const sl = viewport.scrollLeft;
  for (const card of track.children) {
    const fx = Math.cos(t * card._spd + card._ph) * 3;
    const fy = Math.sin(t * card._spd + card._ph) * 5;
    const wig = Math.sin(t * card._spd * 0.45 + card._ph * 2.3) * 0.9; // 위글: ±0.9도 천천히
    let ox = 0, oy = 0, sc = 1;
    if (touchHeat > 0.02) {
      const cx = card._x + card._w / 2 - sl;
      const cy = card._y + card._h / 2;
      const dx = cx - touchX;
      const dy = cy - touchY;
      const d = Math.hypot(dx, dy) || 1;
      const fall = Math.max(0, 1 - d / 340) * touchHeat; // 가까울수록 강하게
      ox = (dx / d) * 22 * fall;
      oy = (dy / d) * 22 * fall;
      sc = 1 + 0.05 * fall;
    }
    card.style.transform =
      `translate(${(fx + ox).toFixed(2)}px, ${(fy + oy).toFixed(2)}px) ` +
      `rotate(${wig.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
  }
  requestAnimationFrame(collageLoop);
})(0);

/* 세로 휠을 가로 스크롤로 변환 (트랙 끝에서는 페이지 스크롤 허용) */
viewport.addEventListener('wheel', (e) => {
  const goingDown = e.deltaY > 0;
  const atStart = viewport.scrollLeft <= 0;
  const atEnd = viewport.scrollLeft + viewport.clientWidth >= track.offsetWidth - 2;
  if ((goingDown && atEnd) || (!goingDown && atStart)) return; // 페이지 스크롤로 통과
  e.preventDefault();
  viewport.scrollLeft += e.deltaY;
}, { passive: false });

/* ============================================================
   영화뷰
   ============================================================ */
const cinema = $('cinema');
const cinemaVideo = $('cinemaVideo');

function openCinema(v, cardEl) {
  const num = String(v.id).padStart(2, '0');
  $('cinemaTitle').textContent = v.title[state.lang];
  $('cinemaNum').textContent = num;

  $('cinemaPlaceholder').hidden = true;
  cinemaVideo.hidden = false;
  cinemaVideo.src = v.src;
  cinemaVideo.onerror = () => {
    cinemaVideo.hidden = true;
    $('cinemaPlaceholder').hidden = false;
  };

  cinema.hidden = false;

  // 빨려들어가는 전환: 클릭한 카드의 위치·크기에서 시작해 풀스크린으로 확장
  if (cardEl) {
    const r = cardEl.getBoundingClientRect();
    const sx = r.width / window.innerWidth;
    const sy = r.height / window.innerHeight;
    const dx = r.left + r.width / 2 - window.innerWidth / 2;
    const dy = r.top + r.height / 2 - window.innerHeight / 2;
    cinema.style.transition = 'none';
    cinema.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    zoomTarget = 1.18; // 뒤의 콜라주도 함께 커지며 화면 속으로 들어가는 느낌
    requestAnimationFrame(() => requestAnimationFrame(() => {
      cinema.style.transition = 'transform 0.6s cubic-bezier(0.7, 0, 0.25, 1)';
      cinema.style.transform = 'none';
    }));
  }

  requestAnimationFrame(() => cinema.classList.add('is-open'));
  cinema.dataset.currentId = v.id;
}

function closeCinema() {
  cinemaVideo.pause();
  cinema.classList.add('is-closing');
  cinema.classList.remove('is-open');
  zoomTarget = 1; // 콜라주 확대 원복
  setTimeout(() => {
    cinema.hidden = true;
    cinema.classList.remove('is-closing');
    cinema.style.transition = '';
    cinema.style.transform = '';
    cinemaVideo.removeAttribute('src');
  }, 320);
}
$('cinemaClose').addEventListener('click', closeCinema);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !cinema.hidden) closeCinema();
});

/* ============================================================
   제품 섹션 — 세로 스크롤 스테이지
   화면은 sticky로 고정, 스크롤 진행도(p)에 따라
   우측 텍스트가 아래→위로 흐르고 스테이지마다 이미지·타이포 전환
   ============================================================ */
const productSection = $('product');
const stream = $('productStream');           // 사진 뒤 레이어
const streamFront = $('productStreamFront'); // 사진 앞 레이어 (우하단 타이포)
const imgStack = $('productImgStack');
let curStage = 0;

function buildProduct() {
  const N = PRODUCT.stages.length;
  productSection.style.height = `${(N + 0.4) * 100}vh`; // 스테이지 수에 맞춰 여정 길이 자동 계산
  stream.innerHTML = '';
  streamFront.innerHTML = '';
  imgStack.innerHTML = '';
  PRODUCT.stages.forEach((s, i) => {
    // 사진 뒤 레이어: 좌상단 타이포 + 우측 설명
    const block = document.createElement('div');
    block.className = 'stream-block';
    block.style.top = `${i * 100}vh`;

    const titleA = document.createElement('h2');
    titleA.className = 'product-title product-title--a';
    titleA.innerHTML = `${s.titleA1}<br />${s.titleA2}`;

    const side = document.createElement('div');
    side.className = 'stream-side';
    const body = document.createElement('p');
    body.textContent = s.body;
    const spec = document.createElement('p');
    spec.textContent = s.spec;
    side.append(body, spec);

    block.append(titleA, side);
    stream.appendChild(block);

    // 사진 앞 레이어: 우하단 타이포 (같은 높이에서 함께 상승)
    const blockF = document.createElement('div');
    blockF.className = 'stream-block';
    blockF.style.top = `${i * 100}vh`;
    const titleB = document.createElement('h2');
    titleB.className = 'product-title product-title--b';
    titleB.innerHTML = `${s.titleB1}<br />${s.titleB2}`;
    blockF.appendChild(titleB);
    streamFront.appendChild(blockF);

    const im = document.createElement('div');
    im.className = 'stage-img' + (i === 0 ? ' is-cur' : '');
    if (s.framesBase) {
      // 여러 장의 사진 루프: system-01.jpg(.png)부터 순서대로 자동 인식
      probeFrames(s, im);
      im.innerHTML = `<span class="stage-img-label">${String(i + 1).padStart(2, '0')} — ${s.imgLabel}</span>`;
    } else if (s.media) {
      // 실제 영상: 정사각 틀에 중앙 크롭(cover)으로 재생, 소리 없음·반복
      const vid = document.createElement('video');
      vid.src = s.media;
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      vid.preload = 'metadata';
      vid.onerror = () => vid.remove(); // 파일 없으면 회색 박스로 폴백
      im.appendChild(vid);
    } else {
      im.innerHTML = `<span class="stage-img-label">${String(i + 1).padStart(2, '0')} — ${s.imgLabel}</span>`;
    }
    imgStack.appendChild(im);
  });
}

/* 사진 프레임 자동 탐색: system-01 ~ system-N (jpg/png) 중 존재하는 파일만 수집 */
function probeFrames(stage, container) {
  const found = [];
  let pending = 0;
  for (let n = 1; n <= (stage.framesMax || 12); n++) {
    const num = String(n).padStart(2, '0');
    ['jpg', 'png'].forEach((ext) => {
      pending++;
      const img = new Image();
      img.src = `${stage.framesBase}${num}.${ext}`;
      img.onload = () => { found.push({ n, img }); done(); };
      img.onerror = done;
    });
  }
  function done() {
    if (--pending > 0) return;
    if (!found.length) return; // 아직 파일 없음 — 회색 박스 유지
    found.sort((a, b) => a.n - b.n);
    container._frameEls = found.map(({ img }, j) => {
      img.className = 'stage-frame' + (j === 0 ? ' is-frame-cur' : '');
      container.prepend(img);
      return img;
    });
  }
}

let frameTimer = null;

function applyStage(instant) {
  // 타이포는 이제 스트림과 함께 물리적으로 이동 — 여기선 이미지·이미지 캡션만 전환
  const s = PRODUCT.stages[curStage];
  const cap = $('productImgCap');
  clearInterval(frameTimer);
  [...imgStack.children].forEach((im, i) => {
    im.classList.toggle('is-cur', i === curStage);
    // 현재 스테이지 영상만 재생, 나머지는 정지 (탭 성능 보호)
    const vid = im.querySelector('video');
    if (vid) {
      if (i === curStage) vid.play().catch(() => {});
      else vid.pause();
    }
    // 사진 루프 스테이지: 활성일 때만 1초 간격 순환
    if (i === curStage && im._frameEls && im._frameEls.length > 1) {
      let fi = 0;
      im._frameEls.forEach((f, j) => f.classList.toggle('is-frame-cur', j === 0));
      frameTimer = setInterval(() => {
        fi = (fi + 1) % im._frameEls.length;
        im._frameEls.forEach((f, j) => f.classList.toggle('is-frame-cur', j === fi));
      }, 1000);
    }
  });
  if (instant) { cap.textContent = s.imgLabel; return; }
  cap.classList.add('is-swapping');
  setTimeout(() => {
    cap.textContent = s.imgLabel;
    cap.classList.remove('is-swapping');
  }, 350);
}

function onProductScroll() {
  const rect = productSection.getBoundingClientRect();
  const total = productSection.offsetHeight - window.innerHeight;
  if (total <= 0) return;
  const p = Math.max(0, Math.min(1, -rect.top / total)); // 섹션 내 진행도 0~1
  const N = PRODUCT.stages.length;
  const shift = `translateY(${(-p * (N - 1) * 100).toFixed(3)}vh)`;
  stream.style.transform = shift;
  streamFront.style.transform = shift; // 앞뒤 레이어 동기 이동
  const s = Math.round(p * (N - 1));
  if (s !== curStage) { curStage = s; applyStage(false); }
}
window.addEventListener('scroll', () => requestAnimationFrame(onProductScroll), { passive: true });

/* ============================================================
   섹션 텍스트 렌더링 (KR/EN)
   ============================================================ */
/* ── 미래 섹션: 구체 영상 교체 + 온도 상승 카운터 ── */

// 사용자가 assets/sphere.mp4 를 넣으면 자동으로 이미지 → 영상 교체
(function trySphereVideo() {
  const vid = document.createElement('video');
  vid.src = 'assets/sphere.mp4';
  vid.muted = true;
  vid.loop = true;
  vid.playsInline = true;
  vid.setAttribute('playsinline', '');
  vid.autoplay = true;
  vid.onloadeddata = () => {
    const img = $('sphereImg');
    img.replaceWith(vid);
    vid.play().catch(() => {});
  };
  vid.onerror = () => {}; // 파일 없으면 기존 이미지 유지
})();

// 섹션에 들어올 때마다 35.0°C → 40+°C 로 차오르는 카운터
$('futureDeg').textContent = '35.0°C'; // 시작값
let tempRaf = null;
function animateTemp() {
  cancelAnimationFrame(tempRaf);
  const el = $('futureDeg');
  const t0 = performance.now();
  const dur = 2400;
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / dur);
    const ease = 1 - Math.pow(1 - p, 3); // 처음 빠르고 끝에서 느리게
    if (p < 1) {
      el.textContent = (35 + ease * 5).toFixed(1) + '°C';
      tempRaf = requestAnimationFrame(tick);
    } else {
      el.textContent = '40+°C';
    }
  };
  tempRaf = requestAnimationFrame(tick);
}
if ('IntersectionObserver' in window) {
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) animateTemp();
      else { cancelAnimationFrame(tempRaf); $('futureDeg').textContent = '35.0°C'; }
    });
  }, { threshold: 0.35 }).observe($('future'));
}

function renderSections() {
  const lang = state.lang;

  // 2. 미래 (온도 숫자는 카운터가 관리)
  $('futureTempLabel').textContent = FUTURE.tempLabel;
  $('futureCap').textContent = FUTURE.cap[lang];
  $('futureCapSub').textContent = FUTURE.capSub[lang];

  // 3. 제품 — 캡션만 언어 전환 (타이틀/본문/스펙은 시안 원칙대로 영어 고정)
  $('productCap').textContent = PRODUCT.cap[lang];
  $('productCapSub').textContent = PRODUCT.capSub[lang];
  applyStage(true);

  // 4. 세계관 캡션 (현재 포커스 영상 기준)
  const v = VIDEOS.find((x) => x.id === state.focusedId) || VIDEOS[0];
  renderWorldviewCap(v);

  // 영화뷰가 열려 있으면 제목도 갱신
  if (!cinema.hidden) {
    const cv = VIDEOS.find((x) => x.id === Number(cinema.dataset.currentId));
    if (cv) $('cinemaTitle').textContent = cv.title[lang];
  }
}

/* ============================================================
   KR / EN 토글
   ============================================================ */
function applyLang(lang) {
  state.lang = lang;
  document.documentElement.lang = lang === 'kr' ? 'ko' : 'en';

  document.querySelectorAll('[data-key]').forEach((el) => {
    const key = el.dataset.key;
    if (UI_TEXT[key]) el.textContent = UI_TEXT[key][lang];
  });

  document.querySelectorAll('.lang-btn').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.lang === lang));

  renderSections();
  if (typeof HeroHaze !== 'undefined') HeroHaze.setLang(lang);
}

document.querySelectorAll('.lang-btn').forEach((b) =>
  b.addEventListener('click', () => applyLang(b.dataset.lang)));

/* ============================================================
   우측 페이지 인덱스 — 섹션 점프 + 현재 위치 표시
   ============================================================ */
const PAGE_SECTIONS = [
  { id: 'hero', label: '01', name: 'Hissy™' },
  { id: 'future', label: '02', name: 'Visioning the Future' },
  { id: 'product', label: '03', name: 'Our Products' },
  { id: 'worldview', label: '04', name: 'Hissy Universe' },
];

function buildPageIndex() {
  const wrap = $('pageIndex');
  wrap.innerHTML = '';
  PAGE_SECTIONS.forEach((s) => {
    const btn = document.createElement('button');
    btn.innerHTML = `<span class="pi-num">${s.label}</span><span class="pi-name">${s.name}</span>`;
    btn.dataset.target = s.id;
    btn.addEventListener('click', () =>
      $(s.id).scrollIntoView({ behavior: 'smooth' }));
    wrap.appendChild(btn);
  });
}

function updatePageIndex() {
  // 화면 중앙이 어느 섹션 안에 있는지로 현재 위치 판정
  const probe = window.scrollY + window.innerHeight * 0.4;
  let active = PAGE_SECTIONS[0].id;
  PAGE_SECTIONS.forEach((s) => {
    if ($(s.id).offsetTop <= probe) active = s.id;
  });
  [...$('pageIndex').children].forEach((b) =>
    b.classList.toggle('is-active', b.dataset.target === active));
}
window.addEventListener('scroll', () => requestAnimationFrame(updatePageIndex), { passive: true });

// Info 메뉴는 아직 페이지가 없어서 비활성 (만들면 여기서 연결)
$('navInfoLink').addEventListener('click', (e) => e.preventDefault());

/* ============================================================
   터치 이펙트 — CO₂ 냉각가스 분사 흔적
   터치한 자리에 가스가 퍼졌다가 위로 피어오르며 사라짐
   ============================================================ */
function spawnGas(x, y, size, drift, trail) {
  const puff = document.createElement('div');
  puff.className = 'gas-puff' + (trail ? ' gas-puff--trail' : '');
  puff.style.cssText =
    `left:${x}px; top:${y}px;` +
    `width:${size}px; height:${size}px; margin:${-size / 2}px;` +
    `--gas-drift:${drift}px;`;
  document.body.appendChild(puff);
  puff.addEventListener('animationend', () => puff.remove());
}

// 터치: 본 가스 + 잔가스 (여운 2초)
document.addEventListener('pointerdown', (e) => {
  spawnGas(e.clientX, e.clientY, 90, -34, false);
  setTimeout(() => {
    spawnGas(e.clientX + (Math.random() - 0.5) * 24, e.clientY, 44, -52, false);
  }, 90);
});

// 드래그/스크롤 궤적: 손가락이 지나간 자리에 잔가스가 이어짐
let trailX = 0, trailY = 0, trailT = 0;
document.addEventListener('pointermove', (e) => {
  if (!e.buttons) return; // 누른 채 움직일 때만 (터치 스크롤 포함)
  const now = performance.now();
  const moved = Math.hypot(e.clientX - trailX, e.clientY - trailY);
  if (moved < 16 || now - trailT < 28) return; // 궤적이 촘촘히 이어지게
  trailX = e.clientX;
  trailY = e.clientY;
  trailT = now;
  spawnGas(e.clientX, e.clientY, 40 + Math.random() * 16, -26, true);
});

/* ============================================================
   시작
   ============================================================ */
const heroOK = HeroHaze.init($('hazeCanvas'));
if (!heroOK) {
  $('hazeCanvas').style.display = 'none';
  $('heroFallback').hidden = false;
}

/* ============================================================
   스크롤 인터랙션 — 화면에 들어오면 .is-in 을 붙여 슬라이드 인
   (나가면 다시 떼서, 위로 돌아왔을 때도 다시 재생됨)
   ============================================================ */
let revealObserver = null;
function watchReveals() {
  // 안전장치: 관찰 기능이 없는 브라우저에선 애니메이션 없이 다 보이게
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
    return;
  }
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-in', entry.isIntersecting);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
}

buildCollage();
buildProduct();
buildPageIndex();
applyLang('kr');
watchReveals();
onProductScroll();
updatePageIndex();
window.addEventListener('resize', () => { buildCollage(); watchReveals(); onProductScroll(); });
