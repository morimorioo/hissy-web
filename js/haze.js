/* ============================================================
   hissy — 히어로 아지랑이 셰이더 (heat haze)
   외부 라이브러리 없이 순수 WebGL로 동작 (오프라인 안전).

   원리:
   1) 보이지 않는 2D 캔버스에 타이포(hissy, 카피)를 그린다
   2) 그 그림을 GPU 텍스처로 올린다
   3) 셰이더가 매 프레임 노이즈로 화면을 일렁이게 왜곡한다
      - 커서/터치 주변: 왜곡 강해짐 (열기)
      - 탭하는 순간: 그 지점에서 냉각 파동이 퍼지며 왜곡이 식음 (hiss)
   ============================================================ */

const HeroHaze = (() => {
  let gl, canvas, program, tex;
  let textCanvas, textCtx;
  let logoImg = null; // 히어로 중앙에 그릴 공식 로고 (흰색 SVG)
  let heroVideo = null;      // 로고 아래 02 영상 (셰이더 텍스처로 합성)
  let heroVideoReady = false;
  let raf = null;
  let startTime = 0;
  let lang = 'kr';
  let webglOK = false;

  // 인터랙션 상태
  const mouse = { x: 0.5, y: 0.5, strength: 0 }; // strength: 움직일 때만 커짐
  const cool = { x: 0.5, y: 0.5, t: -100 };      // t: 탭 이후 경과 시간 기준점

  const VERT = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `;

  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTex;
    uniform vec2 uRes;
    uniform float uTime;
    uniform vec3 uMouse;   // x, y, strength
    uniform vec3 uCool;    // x, y, 탭 후 경과 시간(초)

    // 간단한 해시 노이즈 + fbm (아지랑이의 재료)
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 3; i++) {
        v += a * noise(p);
        p *= 2.1;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = vUv;
      float aspect = uRes.x / uRes.y;
      vec2 auv = vec2(uv.x * aspect, uv.y);

      /* ── 1) 기본 열기: 화면 전체가 은은하게 위로 아른거림 ── */
      float t = uTime * 0.35;
      // y를 시간에 따라 흘려보내 '피어오르는' 느낌
      float n1 = fbm(auv * 6.0 + vec2(0.0, -t * 1.6));
      float n2 = fbm(auv * 6.0 + vec2(4.7, -t * 1.3));
      vec2 dir = vec2(n1 - 0.5, n2 - 0.5);

      float baseAmp = 0.005 + 0.002 * sin(uTime * 0.7);

      /* ── 2) 커서/터치 주변 열 집중 ── */
      vec2 m = vec2(uMouse.x * aspect, uMouse.y);
      float md = distance(auv, m);
      float mouseAmp = smoothstep(0.5, 0.0, md) * 0.04 * uMouse.z;

      /* ── 3) 냉각 파동: 탭 지점에서 퍼지며 왜곡을 지움 ── */
      vec2 c = vec2(uCool.x * aspect, uCool.y);
      float cd = distance(auv, c);
      float ct = uCool.z;                 // 탭 후 경과 시간
      float radius = ct * 0.9;            // 파동이 퍼지는 속도
      float fade = 1.0 - clamp(ct / 3.5, 0.0, 1.0);  // 3.5초에 걸쳐 열기 복귀
      float inside = smoothstep(radius, radius - 0.25, cd);
      float suppress = inside * fade;     // 1 = 완전 냉각

      float amp = (baseAmp + mouseAmp) * (1.0 - suppress * 0.96);

      // 화면 가장자리에서는 왜곡을 0으로 — 테두리 줄무늬(범위 밖 샘플링) 방지
      float edgeFade =
        smoothstep(0.0, 0.07, uv.x) * smoothstep(1.0, 0.93, uv.x) *
        smoothstep(0.0, 0.07, uv.y) * smoothstep(1.0, 0.93, uv.y);
      amp *= edgeFade;

      vec2 duv = uv + dir * amp;
      vec4 col = texture2D(uTex, duv);

      /* ── 4) 색 연출 ── */
      // 열기: 왜곡 강한 곳에 아주 옅은 웜톤
      float heatGlow = (mouseAmp / 0.028) * (1.0 - suppress);
      col.rgb = mix(col.rgb, col.rgb * vec3(1.03, 0.99, 0.95), heatGlow * 0.6);

      // 냉각 파동은 '왜곡이 식는 것'으로만 표현 — 링/색 연출 없음 (잔상 방지)
      gl_FragColor = col;
    }
  `;

  /* ── 텍스처용 타이포 그리기 (일반 2D 캔버스) ── */
  function drawText() {
    const w = textCanvas.width;
    const h = textCanvas.height;
    const css = getComputedStyle(document.documentElement);
    const bg = css.getPropertyValue('--bg').trim() || '#000000';
    const ink = css.getPropertyValue('--ink').trim() || '#ffffff';
    const accent = css.getPropertyValue('--accent').trim() || '#FF3000';
    const muted = css.getPropertyValue('--dim').trim() || 'rgba(255,255,255,0.3)';
    const fontEn = css.getPropertyValue('--font-title').trim() || 'sans-serif';
    const fontKr = css.getPropertyValue('--font-nav').trim() || 'sans-serif';
    const fontMono = css.getPropertyValue('--font-mono').trim() || 'monospace';

    textCtx.fillStyle = bg;
    textCtx.fillRect(0, 0, w, h);

    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';

    // 히어로 메인: 02 영상을 정중앙에 (로고 없음)
    // 이 캔버스가 통째로 셰이더 텍스처가 되므로 영상에도 아지랑이가 걸림
    const subSize = Math.max(13, Math.min(w * 0.016, 20));
    let subY = h * 0.68;
    if (heroVideoReady && heroVideo.videoWidth > 0) {
      const vw = w * 0.5;
      const vh = vw * (heroVideo.videoHeight / heroVideo.videoWidth);
      const vy = h * 0.45 - vh / 2;
      textCtx.drawImage(heroVideo, (w - vw) / 2, vy, vw, vh);
      subY = vy + vh + Math.max(34, h * 0.07); // 카피는 영상 바로 아래
    } else {
      // 영상 로드 전/실패 시 임시 타이포
      const titleSize = Math.min(w * 0.26, h * 0.44);
      textCtx.fillStyle = ink;
      textCtx.font = `400 ${titleSize}px ${fontEn}`;
      textCtx.fillText('hissy', w / 2, h * 0.44);
    }

    // 서브 카피 (KR/EN)
    const sub = UI_TEXT.heroSub[lang];
    textCtx.font = lang === 'en'
      ? `400 ${subSize}px ${fontEn}`
      : `500 ${subSize}px ${fontKr}`;
    textCtx.fillStyle = ink;
    const spaced = lang === 'en' ? sub.split('').join('  ') : sub;
    textCtx.fillText(spaced, w / 2, subY);

    // 스펙시트 무드의 모노 라인
    const monoSize = Math.max(10, subSize * 0.72);
    textCtx.font = `400 ${monoSize}px ${fontMono}`;
    textCtx.fillStyle = muted;
    textCtx.fillText('NO VIRTUE IN ENDURANCE', w / 2, subY + subSize * 2.6);

    // 온도 라인 (회색)
    textCtx.fillStyle = muted;
    textCtx.fillText('35°C AND CLIMBING', w / 2, subY + subSize * 4.0);
  }

  function uploadTexture() {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // 캔버스와 WebGL의 상하 좌표계 차이 보정
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // 탭 성능 보호
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    textCanvas.width = w;
    textCanvas.height = h;
    if (webglOK) {
      gl.viewport(0, 0, w, h);
      drawText();
      uploadTexture();
    }
  }

  function frame(now) {
    const t = (now - startTime) / 1000;

    // 영상이 재생 중이면 매 프레임 캔버스를 다시 그려 텍스처 갱신
    if (heroVideoReady && !heroVideo.paused) {
      drawText();
      uploadTexture();
    }

    // 커서가 멈추면 열 집중이 서서히 잦아듦 (탭 터치도 여운이 남도록 천천히)
    mouse.strength *= 0.985;

    gl.uniform1f(loc('uTime'), t);
    gl.uniform2f(loc('uRes'), canvas.width, canvas.height);
    gl.uniform3f(loc('uMouse'), mouse.x, 1.0 - mouse.y, Math.min(mouse.strength, 1));
    gl.uniform3f(loc('uCool'), cool.x, 1.0 - cool.y, t - cool.t);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(frame);
  }

  const locCache = {};
  function loc(name) {
    if (!(name in locCache)) locCache[name] = gl.getUniformLocation(program, name);
    return locCache[name];
  }

  /* ── 포인터 이벤트 (마우스 + 터치 공용) ── */
  function bindEvents() {
    const rectUv = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    };
    canvas.addEventListener('pointermove', (e) => {
      const p = rectUv(e);
      mouse.x = p.x;
      mouse.y = p.y;
      mouse.strength = Math.min(mouse.strength + 0.15, 1.2);
    });
    canvas.addEventListener('pointerdown', (e) => {
      const p = rectUv(e);
      cool.x = p.x;
      cool.y = p.y;
      cool.t = (performance.now() - startTime) / 1000; // 지금부터 냉각 파동 시작
    });
  }

  function init(canvasEl) {
    canvas = canvasEl;
    textCanvas = document.createElement('canvas');
    textCtx = textCanvas.getContext('2d');

    gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return false; // 폴백은 main.js가 처리

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;

    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // 풀스크린 사각형
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    tex = gl.createTexture();
    gl.uniform1i(gl.getUniformLocation(program, 'uTex'), 0);

    webglOK = true;
    resize();
    bindEvents();
    window.addEventListener('resize', resize);

    // 웹폰트 로드가 끝나면 타이포를 다시 그림 (폰트 적용 반영)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { drawText(); uploadTexture(); });
    }

    // 공식 로고 로드 완료 시 텍스트 → 로고 교체
    logoImg = new Image();
    logoImg.src = 'assets/logo.svg';
    logoImg.onload = () => { drawText(); uploadTexture(); };

    // 로고 아래 02 영상 (숨김 상태로 재생하며 캔버스에 합성)
    heroVideo = document.createElement('video');
    heroVideo.src = 'videos/02.mp4';
    heroVideo.muted = true;
    heroVideo.loop = true;
    heroVideo.playsInline = true;
    heroVideo.setAttribute('playsinline', '');
    heroVideo.autoplay = true;
    heroVideo.style.cssText = 'position:absolute; width:1px; height:1px; opacity:0; pointer-events:none;';
    document.body.appendChild(heroVideo);
    heroVideo.onloadeddata = () => {
      heroVideoReady = true;
      heroVideo.play().catch(() => {});
    };
    heroVideo.onerror = () => { heroVideoReady = false; }; // 파일 없으면 기존 레이아웃 유지

    startTime = performance.now();
    raf = requestAnimationFrame(frame);
    return true;
  }

  // KR/EN 전환 시 타이포 다시 그리기
  function setLang(l) {
    lang = l;
    if (webglOK) {
      drawText();
      uploadTexture();
    }
  }

  return { init, setLang };
})();
