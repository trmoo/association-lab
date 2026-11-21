/*! 연관 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유 */
// 탭 3 연관 규칙 찾기 — 주문 바꾸기 실험실 · 실습 정리표 · 연관 규칙 탐색기 · 좋은 규칙 고르기
import { h, s, 채우기, 알림, 서술칸, 다듬기, 고르기단추, 슬라이더, 을, 이, 과 } from '../lib/ui.js';
import { 기록 } from '../lib/store.js';
import { 지표, 규칙목록, 좋은규칙, 향상도판정, 분수글, 수글, 맞는수 } from '../lib/assoc.js';
import { 영수증들, 값글, 분수 } from '../lib/views.js';
import { 편의점, 편의점40, 그림, 향상도뜻빈칸, 정리표쌍, 판정규칙, 서술, 힌트글자 } from '../data.js';

const 칩글 = x => (그림[x] ? 그림[x] + ' ' : '') + x;
const 복사 = 거래 => 거래.map(t => [...t]);

// ───────────────────────── 1. 주문 바꾸기 실험실 ─────────────────────────
const 도전목록 = [
  { id: 'lt', 글: '주문 속 상품을 넣고 빼서 향상도를 1 보다 작게 만들기', 확인: st => st.nAB > 0 && 향상도판정(st) === '작음' },
  { id: 'eq', 글: '향상도를 정확히 1 로 만들기 (두 상품이 서로 독립)', 확인: st => st.nAB > 0 && 향상도판정(st) === '같음' },
  { id: 'add', 글: '주문을 더하거나 빼서 전체 거래 수를 바꿔 보기', 확인: st => st.N !== 6 },
  { id: 'rare', 글: '신뢰도는 1 인데 지지도는 0.2 보다 작은 규칙 찾기', 확인: st => st.nA > 0 && st.nAB === st.nA && st.지지도 < 0.2 },
];
function 실험실(el, 수명, 도구) {
  const 품목 = 편의점.품목;
  const 상태 = 기록.get('실험실', { 거래: 복사(편의점.거래), A: '삼각김밥', B: '사이다', 도전: [], 뜻: ['', '', ''], 뜻맞음: false });
  const 저장 = () => 기록.set('실험실', 상태);
  const 끝확인 = () => { if (['lt', 'eq'].every(id => 상태.도전.includes(id)) && 상태.뜻맞음) 도구.완료(); };
  const 영수증칸 = h('div', { class: 'grow scroll-y' });
  const 고르기칸 = h('div', { class: 'row', style: { gap: '4px' } });
  const 지표칸 = h('div', { class: 'mboxes' });
  const 계기칸 = h('div');
  const 도전칸 = h('div', { class: 'col', style: { gap: '3px' } });
  const 단추줄 = h('div', { class: 'row' });
  const 문장칸 = h('div', { class: 'big-eq', style: { fontSize: '15.5px' } });

  function 그리기() {
    const { A, B } = 상태, 거래 = 상태.거래, st = 지표(거래, A, B);
    채우기(문장칸, '규칙: 만약 ', h('em', { class: 'a' }, A), 을(A).slice(A.length), ' 사면 ', h('em', { class: 'b' }, B), '도 산다');
    채우기(고르기칸,
      h('b', { class: 'ta' }, 'A'), 품목.map(x => h('button', { class: 'chip' + (A === x ? ' a' : ''), style: { padding: '1px 7px', fontSize: '14px' }, onClick: () => { if (x !== B) { 상태.A = x; 저장(); 그리기(); } } }, 칩글(x))),
      h('b', { class: 'tb', style: { marginLeft: '8px' } }, 'B'), 품목.map(x => h('button', { class: 'chip' + (B === x ? ' b' : ''), style: { padding: '1px 7px', fontSize: '14px' }, onClick: () => { if (x !== A) { 상태.B = x; 저장(); 그리기(); } } }, 칩글(x))));
    채우기(단추줄,
      h('button', { class: 'btn sm', disabled: 거래.length >= 10, onClick: () => { 상태.거래.push([A]); 저장(); 그리기(); } }, '＋ 주문 더하기'),
      h('button', { class: 'btn sm', disabled: 거래.length <= 2, onClick: () => { 상태.거래.pop(); 저장(); 그리기(); } }, '－ 마지막 주문 빼기'),
      h('button', { class: 'btn sm', onClick: () => { 상태.거래 = 복사(편의점.거래); 저장(); 그리기(); } }, '↺ 처음 6건으로'),
      h('span', { class: 'muted' }, `전체 ${거래.length}건 · 상품을 누르면 넣고 빼요`));
    채우기(영수증칸, 영수증들(거래, {
      A, B, 품목, 열: 거래.length <= 6 ? 3 : 5, 작게: true,
      편집: (i, x) => {
        const t = 상태.거래[i];
        if (t.includes(x)) { if (t.length > 1) t.splice(t.indexOf(x), 1); } else t.push(x);
        저장(); 그리기();
      },
    }));
    const 박스 = (cls, 이름, n, d, 덧) => h('div', { class: 'mbox ' + cls }, h('h4', null, 이름), h('div', { class: 'val' }, d ? 수글(n / d) : '—'), h('div', { class: 'how' }, d ? `${n}/${d}${분수글(n, d) !== `${n}/${d}` ? ' = ' + 분수글(n, d) : ''}` : '', 덧 || ''));
    채우기(지표칸,
      박스('sup', '지지도', st.nAB, st.N),
      박스('conf', '신뢰도', st.nAB, st.nA),
      박스('lift', '향상도', st.향상도분자, st.향상도분모));
    채우기(계기칸, 계기판(st));
    // 도전 과제
    for (const d of 도전목록) if (!상태.도전.includes(d.id) && d.확인(st)) { 상태.도전.push(d.id); 저장(); }
    채우기(도전칸, 도전목록.map(d => h('div', { class: 'row nw', style: { gap: '6px', fontSize: '15px' } },
      h('span', { style: { color: 상태.도전.includes(d.id) ? 'var(--ok)' : '#c5bfcf', fontWeight: 900 } }, 상태.도전.includes(d.id) ? '✔' : '○'),
      h('span', { style: { color: 상태.도전.includes(d.id) ? 'var(--ok)' : 'inherit' } }, d.글))));
    끝확인();
  }

  // 향상도의 뜻 빈칸
  const 뜻칸 = h('div', { class: 'col', style: { gap: '3px' } });
  const 뜻피드백 = h('div', { class: 'fb' });
  const 뜻입력 = 향상도뜻빈칸.map((b, i) => {
    const 칸 = h('input', { class: 'fill', style: { width: '4.6em' }, value: 상태.뜻[i], 'aria-label': b.조건 });
    칸.addEventListener('input', () => { 상태.뜻[i] = 칸.value; 칸.classList.remove('ok', 'bad'); 저장(); });
    return 칸;
  });
  채우기(뜻칸, 향상도뜻빈칸.map((b, i) => h('div', { class: 'row nw', style: { fontSize: '15px', gap: '6px' } },
    h('span', { class: 'badge', style: { minWidth: '92px', textAlign: 'center' } }, b.조건), h('span', null, b.앞, ' ', 뜻입력[i], b.뒤))));
  const 뜻확인 = (조용히 = false) => {
    let 다 = true;
    향상도뜻빈칸.forEach((b, i) => { const ok = b.답.some(d => 다듬기(뜻입력[i].value).startsWith(다듬기(d)) || 다듬기(뜻입력[i].value) === 다듬기(d)); 뜻입력[i].classList.toggle('ok', ok); 뜻입력[i].classList.toggle('bad', !ok); if (!ok) 다 = false; });
    상태.뜻맞음 = 다; 저장();
    if (!조용히 || 다) 알림(뜻피드백, 다 ? '⭕ 향상도 > 1 연관 · = 1 독립 · < 1 억제(음의 연관)' : '❌ 위 실험으로 향상도를 1 보다 크게·같게·작게 만들어 보며 다시 생각해 보세요.', 다 ? 'ok' : 'bad');
    끝확인();
  };
  if (상태.뜻맞음) queueMicrotask(() => 뜻확인(true));

  el.append(h('div', { class: 'split' },
    h('div', { class: 'col', style: { flex: 1.2 } },
      h('h2', null, '🧪 주문 바꾸기 실험실'),
      h('p', { class: 'lead', style: { fontSize: '15px' } }, '영수증 속 상품을 눌러 넣고 빼 보세요. 오른쪽 세 지표와 향상도 계기판이 바로 바뀝니다.'),
      고르기칸, 단추줄, 영수증칸),
    h('div', { class: 'col', style: { flex: 1 } },
      문장칸,
      지표칸, 계기칸,
      h('div', { class: 'panel', style: { padding: '6px 11px' } }, h('h3', null, '🏆 도전 과제'), 도전칸),
      h('div', { class: 'panel', style: { padding: '6px 11px' } }, h('h3', null, '📝 향상도의 뜻'), 뜻칸,
        h('div', { class: 'row nw' }, h('button', { class: 'btn sm primary', onClick: () => 뜻확인() }, '확인'), 뜻피드백)))));
  그리기();
}

/** 향상도 계기판 — 0 ~ 3 눈금, 1 을 기준으로 왼쪽은 억제, 오른쪽은 연관 */
function 계기판(st) {
  const W = 520, H = 100, 최대 = 3, X = v => 20 + (Math.min(v, 최대) / 최대) * (W - 40);
  const 있음 = st.nA && st.nB;
  const 판 = 향상도판정(st);
  return s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'plot', style: { width: '100%', height: 'auto', maxHeight: '100px' }, role: 'img', 'aria-label': '향상도 계기판' },
    s('rect', { x: X(0), y: 46, width: X(1) - X(0), height: 18, rx: 4, fill: '#f8d7d7' }),
    s('rect', { x: X(1), y: 46, width: X(최대) - X(1), height: 18, rx: 4, fill: '#d5f0de' }),
    s('line', { x1: X(1), x2: X(1), y1: 38, y2: 72, stroke: '#1f2433', 'stroke-width': 2.5 }),
    [0, 0.5, 1, 1.5, 2, 2.5, 3].map(v => s('text', { x: X(v), y: 80, 'text-anchor': 'middle', class: 'tick' }, v === 3 ? '3+' : v)),
    s('text', { x: X(0) + 4, y: 14, 'text-anchor': 'start', 'font-size': 13.5, 'font-weight': 800, fill: '#9a2222' }, '억제 (< 1)'),
    s('text', { x: X(1), y: 97, 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: '#1f2433' }, '▲ 독립 (= 1)'),
    s('text', { x: X(최대) - 4, y: 14, 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 800, fill: '#145c33' }, '연관 (> 1)'),
    있음 ? s('g', { style: { transition: 'transform .45s', transform: `translateX(${X(st.향상도)}px)` } },
      s('path', { d: 'M0 44 l-9 -14 h18 z', fill: 판 === '큼' ? '#1e8e4e' : 판 === '같음' ? '#1f2433' : '#d64545' }),
      s('text', { x: 0, y: 27, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900 }, 수글(st.향상도))) : null);
}

// ───────────────────────── 2. 실습 정리표 ─────────────────────────
function 정리표(el, 수명, 도구) {
  const 거래 = 편의점.거래;
  const 상태 = 기록.get('정리표', { 쌍: 0, 칸: {}, 확인: [false, false, false] });
  const 저장 = () => 기록.set('정리표', 상태);
  const 끝확인 = () => {
    const 글 = (기록.get('서술', {}).발견규칙 || '').replace(/\s/g, '');
    if (상태.확인[0] && 상태.확인[1] && 글.length >= 힌트글자) 도구.완료();
  };
  const 영수증칸 = h('div');
  const 표칸 = h('div', { class: 'scroll-x' });
  const 피드백 = h('div', { class: 'fb' });
  const 쌍단추 = 고르기단추(정리표쌍.map((p, i) => ({ 값: i, 글: (상태.확인[i] ? '✔ ' : '') + p.이름 })), 상태.쌍, v => { 상태.쌍 = v; 저장(); 피드백.className = 'fb'; 피드백.textContent = ''; 그리기(); });
  const 정답 = (A, B) => { const st = 지표(거래, A, B); return { 지지도: st.지지도, 신뢰도: st.신뢰도, 향상도: st.향상도, ox: 향상도판정(st) === '큼' ? 'O' : 'X' }; };
  const 설명 = {
    지지도: (A, B) => `전체 거래에서 ${과(A)} ${이(B)} 동시에 판매된 비율`,
    신뢰도: (A, B) => `${을(A)} 구매한 거래 가운데 ${B}도 함께 구매된 비율`,
    향상도: (A, B) => `${을(B)} 구매할 비율이 ${을(A)} 살 때 몇 배가 되나`,
  };
  function 그리기() {
    const p = 정리표쌍[상태.쌍];
    채우기(영수증칸, 영수증들(거래, { A: p.A, B: p.B, 열: 3, 작게: true }));
    const 줄 = (A, B, 열쇠) => {
      const 칸 = 이름 => {
        const k = `${상태.쌍}:${열쇠}:${이름}`;
        const 입력 = h('input', { class: 'num', style: { width: '104px', fontSize: '18px', padding: '5px 4px' }, value: 상태.칸[k] ?? '', placeholder: '분수·소수', 'aria-label': `${A}→${B} ${이름}` });
        입력.addEventListener('input', () => { 상태.칸[k] = 입력.value; 입력.classList.remove('ok', 'bad'); 저장(); });
        입력.dataset.k = k;
        return h('td', { style: { padding: '8px 6px' } }, 입력, h('div', { class: 'muted', style: { fontSize: '13px', lineHeight: 1.3, marginTop: '4px' } }, 설명[이름](A, B)));
      };
      const k = `${상태.쌍}:${열쇠}:ox`;
      const ox = h('td', null, h('div', { class: 'row nw', style: { justifyContent: 'center' } }, ['O', 'X'].map(v => h('button', {
        class: 'chip' + (상태.칸[k] === v ? ' on' : ''), style: { minWidth: '38px' }, 'data-ox': k,
        onClick: () => { 상태.칸[k] = v; 저장(); 그리기(); },
      }, v))));
      return h('tr', null, h('td', { style: { whiteSpace: 'nowrap', fontSize: '16px' } }, h('b', { class: 'ta' }, A), h('br'), '→ ', h('b', { class: 'tb' }, B)), 칸('지지도'), 칸('신뢰도'), 칸('향상도'), ox);
    };
    채우기(표칸, h('table', { class: 'grid', style: { width: '100%' } },
      h('tr', null, h('th', null, '규칙'), h('th', null, '지지도'), h('th', null, '신뢰도'), h('th', null, '향상도'), h('th', null, '연관 규칙 (O/X)')),
      줄(p.A, p.B, 'ab'), 줄(p.B, p.A, 'ba')));
  }
  function 채점() {
    const p = 정리표쌍[상태.쌍];
    let 다 = true;
    for (const [A, B, 열쇠] of [[p.A, p.B, 'ab'], [p.B, p.A, 'ba']]) {
      const 답 = 정답(A, B);
      for (const 이름 of ['지지도', '신뢰도', '향상도']) {
        const 입력 = 표칸.querySelector(`input[data-k="${상태.쌍}:${열쇠}:${이름}"]`);
        const ok = 맞는수(상태.칸[`${상태.쌍}:${열쇠}:${이름}`], 답[이름]);
        입력.classList.remove('ok', 'bad'); 입력.classList.add(ok ? 'ok' : 'bad');
        if (!ok) 다 = false;
      }
      const 오 = 상태.칸[`${상태.쌍}:${열쇠}:ox`] === 답.ox;
      표칸.querySelectorAll(`[data-ox="${상태.쌍}:${열쇠}:ox"]`).forEach(b => { b.classList.remove('ok', 'bad'); if (b.textContent === 상태.칸[`${상태.쌍}:${열쇠}:ox`]) b.classList.add(오 ? 'ok' : 'bad'); });
      if (!오) 다 = false;
    }
    if (다 && !상태.확인[상태.쌍]) { 상태.확인[상태.쌍] = true; 저장(); 쌍단추.children[상태.쌍].textContent = '✔ ' + p.이름; }
    const st = 지표(거래, p.A, p.B);
    알림(피드백, 다
      ? `⭕ 모두 정답! 지지도·향상도는 방향을 바꿔도 같고(${값글(st.nAB, st.N)}, ${값글(st.향상도분자, st.향상도분모)}), 신뢰도만 달라져요. 향상도 ${향상도판정(st) === '큼' ? '> 1 이라 연관 규칙으로 쓸 수 있어요(O).' : '≤ 1 이라 연관 규칙으로 쓰기 어려워요(X).'}`
      : '❌ 빨간 칸을 다시 계산해 보세요. 연관 규칙 O/X 는 향상도가 1 보다 큰지로 정해요.', 다 ? 'ok' : 'bad');
    끝확인();
  }
  el.append(h('div', { class: 'col grow' },
    h('div', { class: 'row nw', style: { justifyContent: 'space-between' } }, h('h2', null, '📋 데이터 안에서 연관 규칙 찾기 — 실습 정리표'), 쌍단추),
    h('div', { class: 'split' },
      h('div', { class: 'col', style: { flex: 0.85 } },
        h('div', { class: 'muted' }, '편의점 주문 6건 — 파랑 = A, 주황 = B, 초록 = 둘 다'),
        영수증칸,
        h('div', { class: 'tip small' }, '💡 지지도 → 신뢰도 → 향상도 차례로 구하고, 향상도가 1 보다 크면 연관 규칙 O 예요. [3] 은 더 해 보기예요.'),
        서술칸({ 키: '발견규칙', ...서술.발견규칙, 줄: 3, 힌트글자, 다씀: 끝확인 })),
      h('div', { class: 'col', style: { flex: 1.15 } },
        h('div', { class: 'panel' }, 표칸, h('div', { class: 'row nw', style: { marginTop: '8px' } }, h('button', { class: 'btn primary', onClick: 채점 }, '정답 확인'), 피드백)),
        h('div', { class: 'mboxes' },
          h('div', { class: 'mbox sup' }, h('h4', null, '지지도'), h('div', { class: 'formula', style: { fontSize: '16px', background: 'none', padding: '2px' } }, 'P(A∩B) = ', 분수('A, B 함께 든 거래 수', '전체 거래 수'))),
          h('div', { class: 'mbox conf' }, h('h4', null, '신뢰도'), h('div', { class: 'formula', style: { fontSize: '16px', background: 'none', padding: '2px' } }, 'P(B|A) = ', 분수('지지도', 'P(A)'))),
          h('div', { class: 'mbox lift' }, h('h4', null, '향상도'), h('div', { class: 'formula', style: { fontSize: '16px', background: 'none', padding: '2px' } }, 분수('신뢰도', 'P(B)'), ' = ', 분수('P(A∩B)', 'P(A)·P(B)'))))))));
  그리기();
}

// ───────────────────────── 3. 연관 규칙 탐색기 ─────────────────────────
const 데이터들 = {
  six: { 글: '편의점 6건', 거래: () => 편의점.거래, 품목: 편의점.품목 },
  forty: { 글: '편의점 40건 (가상)', 거래: () => 편의점40.거래, 품목: 편의점40.품목 },
  lab: { 글: '실험실에서 바꾼 주문', 거래: () => 기록.get('실험실', null)?.거래 || 편의점.거래, 품목: 편의점.품목 },
};
function 탐색기(el, 수명, 도구) {
  const 상태 = 기록.get('탐색기', { 데이터: 'forty', 최소지지도: 0.2, 최소신뢰도: 0.6, 정렬: '향상도', 고른: null, 답수: '', 문제: [false, false, false] });
  const 저장 = () => 기록.set('탐색기', 상태);
  const 그래프칸 = h('div', { class: 'svgbox' });
  const 표칸 = h('div', { class: 'grow scroll-y', style: { background: '#fff', border: '1px solid var(--line)', borderRadius: '12px' } });
  const 고른칸 = h('div');
  const 사실칸 = h('div', { class: 'row', style: { gap: '6px' } });
  const 문제칸 = h('div', { class: 'col', style: { gap: '4px' } });
  const 끝확인 = () => { if (상태.문제.every(Boolean)) 도구.완료(); };

  function 목록() {
    const d = 데이터들[상태.데이터];
    return 규칙목록(d.거래(), d.품목);
  }
  const 통과 = r => r.지지도 >= 상태.최소지지도 - 1e-9 && r.신뢰도 >= 상태.최소신뢰도 - 1e-9;
  const 좋음 = r => 좋은규칙(r, 상태.최소지지도, 상태.최소신뢰도);
  function 그리기() {
    const rs = 목록();
    const 키 = 상태.정렬;
    rs.sort((x, y) => 통과(y) - 통과(x) || y[키] - x[키] || y.지지도 - x.지지도);
    // 산점도
    const W = 560, H = 400, pad = { l: 50, r: 16, t: 16, b: 42 }, iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const x최대 = Math.max(0.3, ...rs.map(r => r.지지도)) * 1.1;
    const sx = v => pad.l + (v / x최대) * iw, sy = v => pad.t + ih - (v / 1.05) * ih;
    const 눈금x = []; for (let v = 0; v <= x최대 + 1e-9; v += x최대 > 0.6 ? 0.2 : 0.1) 눈금x.push(Math.round(v * 100) / 100);
    const 겹침 = new Map();
    const 점들 = rs.map(r => {
      const 열쇠 = `${r.지지도.toFixed(3)},${r.신뢰도.toFixed(3)}`, n = 겹침.get(열쇠) || 0; 겹침.set(열쇠, n + 1);
      const 판 = 향상도판정(r);
      const 색 = 판 === '큼' ? '#27ae60' : 판 === '같음' ? '#8f95a3' : '#d64545';
      const 골 = 상태.고른 && 상태.고른[0] === r.A && 상태.고른[1] === r.B;
      return s('circle', {
        class: 'rule-dot', cx: sx(r.지지도) + n * 6, cy: sy(r.신뢰도) - n * 6, r: 골 ? 11 : 4 + Math.min(r.향상도, 4) * 1.6,
        fill: 색, opacity: 통과(r) ? 0.9 : 0.3, stroke: 골 ? '#1f2433' : '#fff', 'stroke-width': 골 ? 3 : 1.5,
        onClick: () => 고르기(r),
      }, s('title', null, `${r.A} → ${r.B}\n지지도 ${수글(r.지지도)} · 신뢰도 ${수글(r.신뢰도)} · 향상도 ${수글(r.향상도)}`));
    });
    채우기(그래프칸, s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'plot', role: 'img', 'aria-label': '규칙의 지지도와 신뢰도' },
      s('rect', { x: pad.l, y: pad.t, width: iw, height: ih, fill: '#fff', stroke: '#d6cfe0' }),
      s('rect', { x: sx(상태.최소지지도), y: sy(1.05), width: Math.max(0, sx(x최대) - sx(상태.최소지지도)), height: Math.max(0, sy(상태.최소신뢰도) - sy(1.05)), fill: 'rgba(39,174,96,.10)' }),
      눈금x.map(v => [s('line', { x1: sx(v), x2: sx(v), y1: pad.t, y2: pad.t + ih, class: 'grid' }), s('text', { x: sx(v), y: pad.t + ih + 17, 'text-anchor': 'middle', class: 'tick' }, v)]),
      [0, 0.2, 0.4, 0.6, 0.8, 1].map(v => [s('line', { x1: pad.l, x2: pad.l + iw, y1: sy(v), y2: sy(v), class: 'grid' }), s('text', { x: pad.l - 7, y: sy(v) + 4, 'text-anchor': 'end', class: 'tick' }, v)]),
      s('line', { x1: sx(상태.최소지지도), x2: sx(상태.최소지지도), y1: pad.t, y2: pad.t + ih, stroke: '#27ae60', 'stroke-dasharray': '6 4', 'stroke-width': 2 }),
      s('line', { x1: pad.l, x2: pad.l + iw, y1: sy(상태.최소신뢰도), y2: sy(상태.최소신뢰도), stroke: '#27ae60', 'stroke-dasharray': '6 4', 'stroke-width': 2 }),
      s('text', { x: pad.l + iw, y: H - 6, 'text-anchor': 'end', class: 'axis-name' }, '지지도 →'),
      s('text', { x: 8, y: 12, class: 'axis-name' }, '↑ 신뢰도'),
      점들));
    // 표
    채우기(표칸, h('table', { class: 'grid', style: { width: '100%', fontSize: '14px' } },
      h('tr', null, h('th', { class: 'l' }, '규칙 (A → B)'), h('th', null, '지지도'), h('th', null, '신뢰도'), h('th', null, '향상도')),
      rs.slice(0, 60).map(r => {
        const 골 = 상태.고른 && 상태.고른[0] === r.A && 상태.고른[1] === r.B;
        return h('tr', { style: { cursor: 'pointer', background: 골 ? '#fff3c4' : 통과(r) ? '' : '#faf9fb', opacity: 통과(r) ? 1 : 0.55, boxShadow: 좋음(r) ? 'inset 5px 0 0 #27ae60' : 'none' }, onClick: () => 고르기(r) },
          h('td', { class: 'l' }, `${r.A} → ${r.B}`), h('td', null, `${수글(r.지지도)}`), h('td', null, 수글(r.신뢰도)),
          h('td', { style: { color: 향상도판정(r) === '큼' ? 'inherit' : '#c0392b', fontWeight: 700 } }, 수글(r.향상도)));
      })));
    채우기(사실칸,
      h('span', { class: 'badge' }, `전체 규칙 ${rs.length}개`),
      h('span', { class: 'badge' }, `지지도·신뢰도 조건 통과 ${rs.filter(통과).length}개`),
      h('span', { class: 'muted', style: { fontSize: '13px' } }, '초록 줄 = 좋은 규칙'));
    const r = 상태.고른 && rs.find(x => x.A === 상태.고른[0] && x.B === 상태.고른[1]);
    채우기(고른칸, r
      ? h('div', { class: 'fb ' + (좋음(r) ? 'ok' : 'info'), style: { fontSize: '14.5px' } },
        h('b', null, `${r.A} → ${r.B}`), ` 지지도 ${수글(r.지지도)} (${r.nAB}/${r.N}) · 신뢰도 ${수글(r.신뢰도)} · 향상도 ${수글(r.향상도)} — `,
        좋음(r) ? '좋은 규칙의 조건을 모두 만족해요.' : 향상도판정(r) !== '큼' ? '향상도가 1 이하라 좋은 규칙이 아니에요.' : '최소 지지도나 최소 신뢰도를 넘지 못했어요.')
      : h('div', { class: 'muted' }, '그래프의 점이나 표의 줄을 눌러 규칙을 골라 보세요.'));
  }
  function 고르기(r) { 상태.고른 = [r.A, r.B]; 저장(); 그리기(); 문제그리기(); }

  // 탐구 문제 (편의점 40건 · 최소 지지도 0.2 · 최소 신뢰도 0.6)
  const 조건맞음 = () => 상태.데이터 === 'forty' && Math.abs(상태.최소지지도 - 0.2) < 1e-9 && Math.abs(상태.최소신뢰도 - 0.6) < 1e-9;
  const 답규칙들 = () => 규칙목록(편의점40.거래, 편의점40.품목).filter(r => 좋은규칙(r, 0.2, 0.6));
  const 문제피드백 = h('div', { class: 'fb' });
  const 수입력 = h('input', { class: 'num', style: { width: '56px' }, value: 상태.답수, 'aria-label': '좋은 규칙의 수' });
  수입력.addEventListener('input', () => { 상태.답수 = 수입력.value; 저장(); });
  function 문제그리기() {
    const 고른 = 상태.고른 && 규칙목록(편의점40.거래, 편의점40.품목).find(x => x.A === 상태.고른[0] && x.B === 상태.고른[1]);
    const 최고 = Math.max(...답규칙들().map(r => r.향상도));
    if (상태.데이터 === 'forty' && 고른) {
      if (!상태.문제[1] && 좋은규칙(고른, 0.2, 0.6) && Math.abs(고른.향상도 - 최고) < 1e-9) { 상태.문제[1] = true; 저장(); 알림(문제피드백, `⭕ ② 정답! 좋은 규칙 가운데 향상도가 가장 높은 규칙은 ${고른.A} → ${고른.B} (향상도 ${수글(고른.향상도)}) 예요.`, 'ok'); }
      if (!상태.문제[2] && 고른.지지도 >= 0.2 && 고른.신뢰도 >= 0.6 && 향상도판정(고른) !== '큼') { 상태.문제[2] = true; 저장(); 알림(문제피드백, `⭕ ③ 정답! ${고른.A} → ${고른.B} 는 신뢰도가 ${수글(고른.신뢰도)} 로 높지만 생수가 워낙 많이 팔려(P(B) ${수글(고른.pB)}) 향상도가 ${수글(고른.향상도)} — 1 보다 작아요. 신뢰도만 보면 속는다!`, 'ok'); }
    }
    const 표시 = (i, 글, 입력) => h('div', { class: 'row nw', style: { gap: '6px', fontSize: '14.5px' } },
      h('b', { style: { color: 상태.문제[i] ? 'var(--ok)' : 'var(--brand)' } }, 상태.문제[i] ? '✔' : `${'①②③'[i]}`), h('span', { class: 'grow' }, 글), 입력 || null);
    채우기(문제칸,
      h('div', { class: 'small', style: { fontWeight: 800 } }, '🔍 「편의점 40건」 · 최소 지지도 0.2 · 최소 신뢰도 0.6 으로 맞춘 뒤', 조건맞음() ? h('span', { class: 'badge ok', style: { marginLeft: '6px' } }, '조건 맞춤 ✔') : h('button', { class: 'btn xs', style: { marginLeft: '6px' }, onClick: () => { 상태.데이터 = 'forty'; 상태.최소지지도 = 0.2; 상태.최소신뢰도 = 0.6; 저장(); 데이터단추.설정('forty'); 지지도슬.값(0.2); 신뢰도슬.값(0.6); 그리기(); 문제그리기(); } }, '맞추기')),
      표시(0, '좋은 규칙(조건 통과 + 향상도 > 1)은 몇 개?', h('span', { class: 'row nw', style: { gap: '4px' } }, 수입력, h('button', {
        class: 'btn xs', onClick: () => {
          const ok = Number(상태.답수) === 답규칙들().length;
          if (ok) { 상태.문제[0] = true; 저장(); }
          알림(문제피드백, ok ? `⭕ ① 정답! 초록 줄 ${답규칙들().length}개예요.` : '❌ 표에서 초록 줄을 다시 세어 보세요(조건을 먼저 맞추세요).', ok ? 'ok' : 'bad');
          문제그리기();
        },
      }, '확인'))),
      표시(1, '그 가운데 향상도가 가장 높은 규칙을 눌러 고르기'),
      표시(2, '지지도·신뢰도는 통과했는데 향상도 때문에 탈락한 규칙 고르기'),
      문제피드백);
    끝확인();
  }

  const 데이터단추 = 고르기단추(Object.entries(데이터들).map(([k, d]) => ({ 값: k, 글: d.글 })), 상태.데이터, v => { 상태.데이터 = v; 상태.고른 = null; 저장(); 그리기(); 문제그리기(); });
  const 정렬단추 = 고르기단추(['향상도', '신뢰도', '지지도'].map(v => ({ 값: v, 글: v + '순' })), 상태.정렬, v => { 상태.정렬 = v; 저장(); 그리기(); }, 'nw sm');
  const 지지도슬 = 슬라이더({ 이름: '최소 지지도', min: 0, max: 0.6, step: 0.05, 값: 상태.최소지지도, 글: v => v.toFixed(2), onInput: v => { 상태.최소지지도 = v; 저장(); 그리기(); 문제그리기(); } });
  const 신뢰도슬 = 슬라이더({ 이름: '최소 신뢰도', min: 0, max: 1, step: 0.05, 값: 상태.최소신뢰도, 글: v => v.toFixed(2), onInput: v => { 상태.최소신뢰도 = v; 저장(); 그리기(); 문제그리기(); } });

  el.append(h('div', { class: 'split' },
    h('div', { class: 'col', style: { flex: 1.05 } },
      h('div', { class: 'row nw', style: { justifyContent: 'space-between' } }, h('h2', null, '🔭 연관 규칙 탐색기'), 데이터단추),
      h('div', { class: 'row nw', style: { gap: '18px' } }, 지지도슬, 신뢰도슬),
      h('div', { class: 'panel fill', style: { padding: '4px' } }, 그래프칸),
      h('div', { class: 'muted', style: { fontSize: '13px' } }, '점 하나 = 규칙 하나 · 크기 = 향상도 · ', h('span', { style: { color: '#27ae60', fontWeight: 800 } }, '초록 > 1'), ' · ', h('span', { style: { color: '#d64545', fontWeight: 800 } }, '빨강 < 1'), ' · 연한 초록 영역 = 최소 지지도·최소 신뢰도를 넘는 곳')),
    h('div', { class: 'col', style: { flex: 1 } },
      h('div', { class: 'panel', style: { padding: '7px 11px' } }, 문제칸),
      고른칸,
      h('div', { class: 'row nw', style: { justifyContent: 'space-between', alignItems: 'center' } }, 사실칸, 정렬단추),
      표칸)));
  그리기(); 문제그리기();
}

// ───────────────────────── 4. 좋은 규칙 고르기 ─────────────────────────
function 좋은규칙고르기(el, 수명, 도구) {
  const 최소지지도 = 0.2, 최소신뢰도 = 0.6;
  const 목록 = 판정규칙.map(([A, B]) => ({ A, B, ...지표(편의점40.거래, A, B) }));
  const 정답 = r => [r.지지도 >= 최소지지도 - 1e-9, r.신뢰도 >= 최소신뢰도 - 1e-9, 향상도판정(r) === '큼'];
  const 상태 = 기록.get('좋은규칙', { 표시: 목록.map(() => [null, null, null]), 맞음: false, 함정지지도: 0 });
  const 저장 = () => 기록.set('좋은규칙', 상태);
  const 끝확인 = () => {
    const 서 = 기록.get('서술', {});
    if (상태.맞음 && ['거르기', '활용'].every(k => (서[k] || '').replace(/\s/g, '').length >= 힌트글자)) 도구.완료();
  };
  const 카드칸 = h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: '8px', flex: 1, minHeight: 0 } });
  const 피드백 = h('div', { class: 'fb' });
  const 조건이름 = ['지지도 ≥ 0.2', '신뢰도 ≥ 0.6', '향상도 > 1'];
  function 그리기(채점 = false) {
    채우기(카드칸, 목록.map((r, i) => {
      const 표 = 상태.표시[i], 답 = 정답(r);
      const 다고름 = 표.every(v => v !== null);
      const 맞음 = 다고름 && 표.every((v, k) => v === 답[k]);
      return h('div', { class: 'panel', style: { padding: '8px 11px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', borderColor: 채점 && 다고름 ? (맞음 ? 'var(--ok)' : 'var(--bad)') : 'var(--line)', borderWidth: '2px' } },
        h('div', { class: 'row nw', style: { justifyContent: 'space-between' } },
          h('b', { style: { fontSize: '18px' } }, h('span', { class: 'ta' }, `${그림[r.A] || ''} ${r.A}`), ' → ', h('span', { class: 'tb' }, `${그림[r.B] || ''} ${r.B}`)),
          채점 && 다고름 ? h('span', { class: 'badge ' + (답.every(Boolean) ? 'ok' : 'bad') }, 답.every(Boolean) ? '좋은 규칙' : '탈락') : null),
        h('div', { style: { fontSize: '15.5px' } }, `지지도 ${수글(r.지지도)} (${r.nAB}/${r.N}) · 신뢰도 ${수글(r.신뢰도)} · 향상도 ${수글(r.향상도)}`),
        h('div', { class: 'row nw', style: { gap: '4px', marginTop: '3px' } }, 조건이름.map((c, k) => h('button', {
          class: 'chip' + (표[k] === true ? ' ok' : 표[k] === false ? ' bad' : ''), style: { fontSize: '14px', padding: '3px 9px' },
          onClick: () => { 표[k] = 표[k] === true ? false : true; 저장(); 그리기(); },
        }, (표[k] === true ? '✓ ' : 표[k] === false ? '✗ ' : '? ') + c))));
    }));
  }
  const 채점 = () => {
    const 결과 = 목록.map((r, i) => 상태.표시[i].every((v, k) => v === 정답(r)[k]));
    상태.맞음 = 결과.every(Boolean); 저장();
    그리기(true);
    알림(피드백, 상태.맞음 ? '⭕ 모두 맞았어요! 세 조건을 모두 통과한 규칙만 좋은 규칙이에요. 핫바 → 컵라면은 신뢰도가 1 이어도 단 1건, 삼각김밥 → 생수는 신뢰도가 높아도 향상도가 1 보다 작아요.' : `${결과.filter(Boolean).length}/${목록.length}개 맞음 — 빨간 테두리 카드의 조건을 다시 견주어 보세요.`, 상태.맞음 ? 'ok' : 'bad');
    끝확인();
  };

  // 함정: 편의점 6건의 커피 → 껌
  const 함정 = 지표(편의점.거래, '커피', '껌');
  const 함정칸 = h('div');
  const 함정그리기 = v => {
    const 살아남 = 함정.지지도 >= v - 1e-9;
    채우기(함정칸, h('div', { class: 'row nw', style: { gap: '10px' } },
      h('div', { class: 'grow small' }, `커피 → 껌: 신뢰도 ${수글(함정.신뢰도)}, 향상도 ${수글(함정.향상도)} — 대단해 보이지만 커피가 든 주문은 단 ${함정.nA}건!`),
      h('span', { class: 'badge ' + (살아남 ? 'bad' : 'ok') }, 살아남 ? '🙈 아직 남아 있음' : '🧹 걸러짐')));
  };
  const 함정슬 = 슬라이더({ 이름: '최소 지지도', min: 0, max: 0.4, step: 0.05, 값: 상태.함정지지도, 글: v => v.toFixed(2), onInput: v => { 상태.함정지지도 = v; 저장(); 함정그리기(v); } });
  함정그리기(상태.함정지지도);

  el.append(h('div', { class: 'split' },
    h('div', { class: 'col', style: { flex: 1.2 } },
      h('h2', null, '🏅 좋은 규칙의 조건'),
      h('div', { class: 'chain', style: { fontSize: '15px' } },
        h('span', { class: 'node on' }, '① 최소 지지도 이상'), h('span', { class: 'arr' }, '+'),
        h('span', { class: 'node on' }, '② 높은 신뢰도'), h('span', { class: 'arr' }, '+'),
        h('span', { class: 'node on' }, '③ 향상도 > 1'), h('span', { class: 'arr' }, '='), h('span', { class: 'node done' }, '좋은 규칙')),
      h('div', { class: 'muted' }, '편의점 40건 · 최소 지지도 0.2 · 최소 신뢰도 0.6 — 각 규칙의 조건을 눌러 ✓/✗ 를 매기세요.'),
      카드칸,
      h('div', { class: 'row nw' }, h('button', { class: 'btn primary', onClick: 채점 }, '판정 확인'), 피드백)),
    h('div', { class: 'col', style: { flex: 0.95 } },
      h('div', { class: 'panel', style: { padding: '7px 11px' } }, h('h3', null, '🙈 신뢰도 1 의 함정 (편의점 6건)'), 함정칸, 함정슬),
      서술칸({ 키: '거르기', ...서술.거르기, 줄: 3, 힌트글자, 다씀: 끝확인 }),
      서술칸({ 키: '활용', ...서술.활용, 줄: 3, 힌트글자, 다씀: 끝확인 }))));
  그리기(상태.맞음);
  if (상태.맞음) 알림(피드백, '⭕ 세 조건을 모두 통과한 규칙만 좋은 규칙이에요.', 'ok');
}

export default {
  id: 'find', 이름: '규칙 찾기', 아이콘: '🔎',
  카드: [
    { id: 'lab', 제목: '주문 바꾸기 실험실', 그리기: 실험실 },
    { id: 'sheet', 제목: '실습 정리표', 그리기: 정리표 },
    { id: 'explore', 제목: '연관 규칙 탐색기', 그리기: 탐색기 },
    { id: 'good', 제목: '좋은 규칙 고르기', 그리기: 좋은규칙고르기 },
  ],
};
