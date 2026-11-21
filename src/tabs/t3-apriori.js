/*! 연관 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유 */
// 탭 4 Apriori 알고리즘 — 왜 Apriori? · 트랜잭션과 항목 집합 · 단계별 시뮬레이터 · 햄버거 가게의 연관 규칙
import { h, s, 채우기, 알림, 서술칸, 고르기단추, 슬라이더, 을, 은 } from '../lib/ui.js';
import { 기록 } from '../lib/store.js';
import { 집합수, 규칙수, 조합, 세기, 포함, apriori단계, 빈발집합, 지표, 수글, 맞는수, 집합글 } from '../lib/assoc.js';
import { 분수 } from '../lib/views.js';
import { 알파, 햄버거, 그림, 서술, 힌트글자 } from '../data.js';

const 칩글 = x => (그림[x] && x.length > 1 ? 그림[x] + ' ' : '') + x;

/** 큰 수를 한국어 단위로 — 1234567 → 123만 4,567 */
export function 큰수글(n) {
  if (!Number.isFinite(n)) return '∞';
  if (n < 10000) return n.toLocaleString('ko-KR');
  const 단위 = [['경', 1e16], ['조', 1e12], ['억', 1e8], ['만', 1e4]];
  for (const [이름, 크기] of 단위) if (n >= 크기) {
    const 앞 = n / 크기;
    return (앞 >= 100 ? Math.round(앞).toLocaleString('ko-KR') : 앞.toFixed(앞 >= 10 ? 0 : 1).replace(/\.0$/, '')) + 이름;
  }
  return String(n);
}
/** 초를 읽기 쉬운 시간으로 */
export function 시간글(초) {
  if (초 < 1) return '1초도 안 걸림';
  if (초 < 60) return `${Math.round(초)}초`;
  if (초 < 3600) return `${Math.round(초 / 60)}분`;
  if (초 < 86400) return `${Math.round(초 / 3600)}시간`;
  if (초 < 86400 * 365) return `${Math.round(초 / 86400)}일`;
  return `${큰수글(Math.round(초 / (86400 * 365)))}년`;
}

// ───────────────────────── 1. 왜 Apriori 인가? ─────────────────────────
function 왜(el, 수명, 도구) {
  const 상태 = 기록.get('폭발', { n: 6, 본: [6], 퀴즈: null });
  const 저장 = () => 기록.set('폭발', 상태);
  const 끝확인 = () => {
    const 글 = (기록.get('서술', {}).최소지지도 || '').replace(/\s/g, '');
    if (상태.본.length >= 3 && 상태.퀴즈 === 0 && 글.length >= 힌트글자) 도구.완료();
  };
  const 수칸 = h('div', { class: 'row nw', style: { gap: '10px', alignItems: 'stretch' } });
  const 그래프칸 = h('div', { class: 'svgbox' });
  function 그리기() {
    const n = 상태.n, 집 = 집합수(n), 규 = 규칙수(n);
    채우기(수칸,
      h('div', { class: 'mbox sup', style: { flex: 1 } }, h('h4', null, `상품 ${n}종의 항목 집합 수 (2ⁿ − 1)`), h('div', { class: 'val' }, 큰수글(집)), h('div', { class: 'how' }, 집.toLocaleString('ko-KR') + '개')),
      h('div', { class: 'mbox lift', style: { flex: 1 } }, h('h4', null, '따져 볼 연관 규칙 수'), h('div', { class: 'val' }, 큰수글(규)), h('div', { class: 'how' }, 규.toLocaleString('ko-KR') + '개')),
      h('div', { class: 'mbox conf', style: { flex: 1 } }, h('h4', null, '1초에 규칙 100만 개를 검사하면'), h('div', { class: 'val' }, 시간글(규 / 1e6)), h('div', { class: 'how' }, n >= 25 ? '😱 사람이 기다릴 수 없어요' : n >= 16 ? '⏳ 점점 오래 걸려요' : '아직은 괜찮아요')));
    // 로그 눈금 그래프
    const W = 600, H = 300, pad = { l: 64, r: 16, t: 14, b: 38 }, iw = W - pad.l - pad.r, ih = H - pad.t - pad.b, 최대n = 30, 최대로그 = 15;
    const sx = v => pad.l + ((v - 1) / (최대n - 1)) * iw, sy = v => pad.t + ih - (Math.min(v, 최대로그) / 최대로그) * ih;
    // 값이 0 인 곳(상품 1종이면 규칙이 없다)은 로그를 그릴 수 없으므로 건너뛴다
    const 선 = f => [...Array(최대n).keys()].map(i => i + 1).filter(k => f(k) > 0).map((k, i) => `${i ? 'L' : 'M'}${sx(k)},${sy(Math.log10(f(k)))}`).join(' ');
    const 눈금 = [[0, '1'], [3, '1천'], [6, '100만'], [9, '10억'], [12, '1조'], [15, '1000조']];
    채우기(그래프칸, s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'plot', role: 'img', 'aria-label': '상품 수에 따른 조합 수' },
      s('rect', { x: pad.l, y: pad.t, width: iw, height: ih, fill: '#fff', stroke: '#d6cfe0' }),
      눈금.map(([v, 글]) => [s('line', { x1: pad.l, x2: pad.l + iw, y1: sy(v), y2: sy(v), class: 'grid' }), s('text', { x: pad.l - 7, y: sy(v) + 4, 'text-anchor': 'end', class: 'tick' }, 글)]),
      [1, 5, 10, 15, 20, 25, 30].map(v => s('text', { x: sx(v), y: pad.t + ih + 16, 'text-anchor': 'middle', class: 'tick' }, v)),
      s('text', { x: pad.l + iw, y: H - 4, 'text-anchor': 'end', class: 'axis-name' }, '상품 종류 수 →'),
      s('text', { x: 6, y: 12, class: 'axis-name' }, '↑ 개수(눈금 한 칸마다 1000배)'),
      s('path', { d: 선(집합수), fill: 'none', stroke: '#27ae60', 'stroke-width': 3 }),
      s('path', { d: 선(규칙수), fill: 'none', stroke: '#e67e22', 'stroke-width': 3 }),
      s('line', { x1: sx(n), x2: sx(n), y1: pad.t, y2: pad.t + ih, stroke: '#6a3d9a', 'stroke-dasharray': '5 4', 'stroke-width': 2 }),
      s('circle', { cx: sx(n), cy: sy(Math.log10(집합수(n))), r: 7, fill: '#27ae60', stroke: '#fff', 'stroke-width': 2 }),
      s('circle', { cx: sx(n), cy: sy(Math.min(최대로그, Math.log10(Math.max(1, 규칙수(n))))), r: 7, fill: '#e67e22', stroke: '#fff', 'stroke-width': 2 }),
      s('text', { x: pad.l + iw - 10, y: pad.t + ih - 32, 'text-anchor': 'end', 'font-size': 14, 'font-weight': 800, fill: '#e67e22' }, '● 연관 규칙 수 (3ⁿ − 2ⁿ⁺¹ + 1)'),
      s('text', { x: pad.l + iw - 10, y: pad.t + ih - 12, 'text-anchor': 'end', 'font-size': 14, 'font-weight': 800, fill: '#27ae60' }, '● 항목 집합 수 (2ⁿ − 1)')));
  }
  const 슬 = 슬라이더({
    이름: '상품 종류 수 n =', min: 2, max: 30, step: 1, 값: 상태.n, 글: v => `${v}종`,
    onInput: v => { 상태.n = v; if (!상태.본.includes(v)) 상태.본.push(v); 저장(); 그리기(); 끝확인(); },
  });
  const 퀴즈피드백 = h('div', { class: 'fb' });
  const 퀴즈칸 = h('div', { class: 'row' });
  const 퀴즈그리기 = () => 채우기(퀴즈칸, ['1번 이하', '2번', '100번', '알 수 없다'].map((t, i) => h('button', {
    class: 'chip' + (상태.퀴즈 === i ? (i === 0 ? ' ok' : ' bad') : ''),
    onClick: () => { 상태.퀴즈 = i; 저장(); 퀴즈그리기(); 알림(퀴즈피드백, i === 0 ? '⭕ {우산, 장화} 가 든 영수증엔 반드시 우산이 있어요. <b>드문 항목을 품은 조합은 더 드물다</b> — Apriori 의 핵심!' : '🤔 {우산, 장화} 가 든 영수증에는 우산이 반드시 있어요. 그렇다면?', i === 0 ? 'ok' : 'bad'); 끝확인(); },
  }, t)));
  퀴즈그리기();
  if (상태.퀴즈 === 0) 알림(퀴즈피드백, '⭕ 드문 항목을 품은 더 큰 조합은 더 드물다 — Apriori 의 핵심이에요.', 'ok');

  el.append(h('div', { class: 'split' },
    h('div', { class: 'col', style: { flex: 1.25 } },
      h('h2', null, '💥 왜 Apriori 알고리즘이 필요할까?'),
      h('p', { class: 'lead', style: { fontSize: '15px' } }, '모든 경우를 다 따져 보면 계산할 양이 급증해요. 슬라이더로 상품 종류를 늘려 보세요.'),
      슬, 수칸,
      h('div', { class: 'panel fill', style: { padding: '4px' } }, 그래프칸)),
    h('div', { class: 'col', style: { flex: 1 } },
      h('div', { class: 'panel' },
        h('h3', null, '🧮 Apriori 알고리즘'),
        h('p', { class: 'small', style: { margin: '3px 0' } }, '함께 자주 나타나는 항목들에서 패턴을 찾는 방법이에요. 항목 집합의 경우의 수가 매우 많으므로, 빈발 항목을 판단하는 기준인 ', h('b', null, '최소 지지도'), '(특정 항목 집합이 나타나는 최소 비율)가 필요해요.'),
        h('div', { class: 'row nw', style: { gap: '6px' } },
          h('div', { class: 'tip small', style: { flex: 1 } }, '💬 「이 정도 비율 이상으로 자주 나온 조합만 분석하겠다!」'),
          h('div', { class: 'tip small', style: { flex: 1 } }, '💬 「너무 드물게 나오는 조합은 처음부터 빼자!」')),
        h('div', { class: 'chain', style: { marginTop: '6px', fontSize: '14px' } },
          h('span', { class: 'node on' }, '① 거래 데이터 준비'), h('span', { class: 'arr' }, '→'),
          h('span', { class: 'node on' }, '② 최소 지지도를 만족하는 빈발 k-항목 집합'), h('span', { class: 'arr' }, '→'),
          h('span', { class: 'node on' }, '③ 향상도·신뢰도로 연관 규칙 정리'))),
      h('div', { class: 'panel' },
        h('b', { class: 'small' }, '❓ 영수증 100장 가운데 {우산}이 든 것이 1장뿐이에요. {우산, 장화}가 든 영수증은 최대 몇 장일까요?'),
        퀴즈칸, 퀴즈피드백),
      서술칸({ 키: '최소지지도', ...서술.최소지지도, 줄: 2, 힌트글자, 다씀: 끝확인, 작게: true }))));
  그리기();
}

// ───────────────────────── 2. 트랜잭션과 항목 집합 ─────────────────────────
function 항목집합(el, 수명, 도구) {
  const 품목 = 햄버거.품목, 거래 = 햄버거.거래, N = 거래.length;
  const 상태 = 기록.get('항목집합', { 고른: ['햄버거'], k: 2, 최고쌍: false, 셋답: '', 셋맞음: false });
  const 저장 = () => 기록.set('항목집합', 상태);
  const 끝확인 = () => { if (상태.최고쌍 && 상태.셋맞음) 도구.완료(); };
  const 표칸 = h('div', { class: 'grow' });
  const 고르기칸 = h('div', { class: 'row' });
  const 결과칸 = h('div');
  const 후보칸 = h('div', { class: 'row', style: { gap: '5px' } });
  const 문제피드백 = h('div', { class: 'fb' });
  function 그리기() {
    const 집 = 상태.고른;
    채우기(표칸, h('table', { class: 'grid', style: { width: '100%', fontSize: '15.5px' } },
      h('tr', null, h('th', null, '트랜잭션'), h('th', { class: 'l' }, '항목')),
      거래.map((t, i) => {
        const 맞 = 집.length && 포함(t, 집);
        return h('tr', { style: { background: 맞 ? '#e1f5e8' : '' } }, h('td', null, i + 1),
          h('td', { class: 'l' }, t.map((x, j) => [j ? ', ' : '', h('span', { style: { fontWeight: 집.includes(x) ? 900 : 400, color: 집.includes(x) ? '#145c33' : 'inherit' } }, 칩글(x))])));
      })));
    채우기(고르기칸, 품목.map(x => h('button', {
      class: 'chip' + (집.includes(x) ? ' on' : ''),
      onClick: () => { 상태.고른 = 집.includes(x) ? 집.filter(y => y !== x) : 품목.filter(y => 집.includes(y) || y === x); 저장(); 확인(); 그리기(); },
    }, 칩글(x))));
    const 횟수 = 집.length ? 세기(거래, 집) : 0;
    채우기(결과칸, 집.length
      ? h('div', { class: 'big-eq', style: { fontSize: '16.5px' } }, `${은(집합글(집))} `, h('b', null, `${집.length}-항목 집합`), ` — 트랜잭션 ${N}개 가운데 `, h('b', null, `${횟수}번`), ` 나왔어요 → 지지도 ${횟수}/${N} = ${수글(횟수 / N)}`)
      : h('div', { class: 'muted' }, '위 항목을 눌러 항목 집합을 만들어 보세요.'));
    채우기(후보칸, 조합(품목, 상태.k).map(c => h('button', {
      class: 'chip' + (c.length === 집.length && c.every(x => 집.includes(x)) ? ' on' : ''), style: { fontSize: '13.5px' },
      onClick: () => { 상태.고른 = [...c]; 저장(); 확인(); 그리기(); },
    }, 집합글(c))));
  }
  function 확인() {
    const 집 = 상태.고른;
    if (!상태.최고쌍 && 집.length === 2 && 집.includes('햄버거') && 집.includes('콜라')) {
      상태.최고쌍 = true; 저장();
      알림(문제피드백, '⭕ {햄버거, 콜라} 는 4번 — 2-항목 집합 가운데 가장 자주 함께 나왔어요.', 'ok');
    }
    끝확인();
  }
  const k단추 = 고르기단추([1, 2, 3].map(k => ({ 값: k, 글: `${k}-항목 후보 집합` })), 상태.k, v => { 상태.k = v; 저장(); 그리기(); }, 'sm');
  const 셋입력 = h('input', { class: 'num', value: 상태.셋답, style: { width: '56px' }, 'aria-label': '3-항목 집합의 최대 횟수' });
  셋입력.addEventListener('input', () => { 상태.셋답 = 셋입력.value; 저장(); });
  const 셋확인 = () => {
    const 최대 = Math.max(...조합(품목, 3).map(c => 세기(거래, c)));
    const ok = Number(상태.셋답) === 최대;
    상태.셋맞음 = ok; 저장();
    알림(문제피드백, ok ? `⭕ 3-항목 집합은 아무리 많이 나와도 ${최대}번뿐이에요. 항목 수가 늘수록 함께 나오는 횟수는 줄어들어요.` : '❌ 「3-항목 후보 집합」 단추를 눌러 하나씩 눌러 보며 세어 보세요.', ok ? 'ok' : 'bad');
    끝확인();
  };
  el.append(h('div', { class: 'split' },
    h('div', { class: 'col', style: { flex: 0.85 } },
      h('h2', null, '🧾 트랜잭션과 항목 집합'),
      h('div', { class: 'tip small' }, '한 사람이 구매한 항목을 계산하면 영수증이 나와요. ', h('b', null, '거래를 한 영수증 = 트랜잭션'), ' — 하나의 트랜잭션에는 구매한 항목의 목록이 적혀 있어요.'),
      표칸),
    h('div', { class: 'col', style: { flex: 1.15 } },
      h('div', { class: 'panel' },
        h('h3', null, '🧺 항목 집합 만들기'),
        h('p', { class: 'small', style: { margin: '3px 0' } }, '항목끼리 연관성이 있는지 알아보려면 항목끼리의 모든 조합을 만들어야 해요. 그 조합이 ', h('b', null, '항목 집합'), ' 이고, 항목이 k 개인 집합을 ', h('b', null, 'k-항목 집합'), '이라고 해요.'),
        고르기칸, 결과칸),
      h('div', { class: 'panel fill' },
        h('div', { class: 'row nw', style: { justifyContent: 'space-between' } }, h('h3', null, '📚 k-항목 후보 집합 모두 보기'), k단추),
        h('div', { class: 'muted' }, `상품 ${품목.length}종으로 만든 ${상태.k}-항목 후보 집합 — 눌러서 몇 번 나왔는지 보세요.`),
        후보칸),
      h('div', { class: 'panel' },
        h('div', { class: 'small' }, h('b', { style: { color: 상태.최고쌍 ? 'var(--ok)' : 'var(--brand)' } }, '① '), '가장 자주 함께 나온 2-항목 집합을 찾아 누르세요.'),
        h('div', { class: 'row nw small' }, h('b', { style: { color: 'var(--brand)' } }, '② '), '3-항목 집합은 가장 많이 나와도 몇 번일까요?', 셋입력, h('button', { class: 'btn xs', onClick: 셋확인 }, '확인')),
        문제피드백))));
  // k 단추를 누르면 안내 글도 바뀌게
  k단추.addEventListener('click', () => { const m = el.querySelector('.panel.fill .muted'); if (m) m.textContent = `상품 ${품목.length}종으로 만든 ${상태.k}-항목 후보 집합 — 눌러서 몇 번 나왔는지 보세요.`; });
  그리기();
  if (상태.최고쌍 && 상태.셋맞음) 알림(문제피드백, '⭕ 두 문제 모두 맞혔어요.', 'ok');
}

// ───────────────────────── 3. Apriori 단계별 시뮬레이터 ─────────────────────────
function 시뮬레이터(el, 수명, 도구) {
  const 품목 = 알파.품목;
  const 상태 = 기록.get('apriori', { 거래: 알파.거래.map(t => [...t]), 최소: 2, 단계: 0, 셈: {}, 가지치기: false, 편집: false, 끝: false });
  const 저장 = () => 기록.set('apriori', 상태);
  let 보는집합 = null;
  const 거래칸 = h('div');
  const 단계칸 = h('div', { class: 'stage-tabs' });
  const 본문 = h('div', { class: 'col grow', style: { gap: '8px' } });
  const 기록칸 = h('div', { class: 'col', style: { gap: '3px', background: '#faf8fc', borderRadius: '10px', padding: '6px 10px' } });
  const 열쇠 = (k, 집합) => `${k}:${집합.join('')}`;
  const 계산 = () => apriori단계(상태.거래, 품목, 상태.최소);
  const 셀맞음 = (k, c) => String(상태.셈[열쇠(k, c.집합)] ?? '').trim() === String(c.횟수);
  const 세야함 = c => !(상태.가지치기 && c.잘림);
  const 단계다셈 = 단 => 단.후보.filter(세야함).every(c => 셀맞음(단.k, c));

  function 거래그리기() {
    채우기(거래칸, h('table', { class: 'grid atx', style: { width: '100%', fontSize: '17px' } },
      h('tr', null, h('th', { colspan: 2 }, '거래 데이터')),
      h('tr', null, h('th', null, '고객'), h('th', null, 'items')),
      상태.거래.map((t, i) => {
        const 맞 = 보는집합 && 포함(t, 보는집합);
        return h('tr', null, h('td', null, i + 1), h('td', { class: 맞 ? 'hit' : '' },
          상태.편집
            ? h('div', { class: 'row nw', style: { gap: '3px', justifyContent: 'center' } }, 품목.map(x => h('button', {
              class: 'chip' + (t.includes(x) ? ' on' : ''), style: { padding: '1px 8px' },
              onClick: () => { const 새 = t.includes(x) ? t.filter(y => y !== x) : 품목.filter(y => t.includes(y) || y === x); if (새.length) { 상태.거래[i] = 새; 상태.셈 = {}; 상태.단계 = 0; 저장(); 다시(); } },
            }, x)))
            : t.join(', ')));
      })));
  }
  function 다시() {
    const 단계들 = 계산();
    const 칸수 = 단계들.length * 2;
    if (상태.단계 >= 칸수) 상태.단계 = 칸수 - 1;
    // 단계 단추: C1 F1 C2 F2 …  — 앞 단계를 끝내야 다음으로 갈 수 있다
    let 열림 = 0;
    for (let i = 0; i < 칸수; i++) { 열림 = i; const 단 = 단계들[Math.floor(i / 2)]; if (i % 2 === 0 && !단계다셈(단)) break; }
    채우기(단계칸, [...Array(칸수).keys()].map(i => {
      const 단 = 단계들[Math.floor(i / 2)];
      const 이름 = i % 2 === 0 ? `${단.k}-항목 후보 C${단.k}` : `${단.k}-항목 빈번 F${단.k}`;
      return h('button', { class: 'st' + (i === 상태.단계 ? ' on' : i < 열림 || (i % 2 === 0 && 단계다셈(단)) ? ' done' : ''), disabled: i > 열림, onClick: () => { 상태.단계 = i; 저장(); 다시(); } }, 이름);
    }));
    거래그리기();
    // 지금까지 확정한 빈번 집합 (지나온 F 단계)
    채우기(기록칸, h('b', { class: 'small' }, '📜 지금까지 찾은 빈번 집합'),
      단계들.filter((단, j) => 상태.단계 >= j * 2 + 1).map(단 => h('div', { class: 'row nw small', style: { gap: '6px' } },
        h('span', { class: 'badge ok' }, `F${단.k}`), 단.빈번.length ? 단.빈번.map(f => 집합글(f.집합)).join(', ') : '없음')),
      상태.단계 < 1 ? h('span', { class: 'muted small' }, '아직 없어요 — C1 을 세어 F1 을 확정하세요.') : null);
    const 단 = 단계들[Math.floor(상태.단계 / 2)];
    const 최소글 = `${상태.최소}/${상태.거래.length}`;
    if (상태.단계 % 2 === 0) {
      const 남은 = 단.후보.filter(세야함).filter(c => !셀맞음(단.k, c)).length;
      채우기(본문,
        h('div', { class: 'tip small' }, 단.k === 1
          ? '① 한 개의 요소를 가진 1-항목 후보 집합의 등장(지지도) 횟수를 세요. 후보를 누르면 그 후보가 든 거래가 노랗게 칠해져요.'
          : `${단.k - 1}-항목 빈번 집합에 나온 요소 가운데 ${단.k}개를 고른 조합이 ${단.k}-항목 후보 집합이에요. 각 집합의 등장 횟수를 세어 적으세요.`),
        h('div', { class: 'row csets', style: { gap: '9px' } }, 단.후보.map(c => {
          const 잘 = 상태.가지치기 && c.잘림;
          const 입력 = h('input', { class: 'num', style: { width: '52px' }, value: 상태.셈[열쇠(단.k, c.집합)] ?? '', disabled: 잘, 'aria-label': `${집합글(c.집합)} 횟수` });
          입력.addEventListener('input', () => { 상태.셈[열쇠(단.k, c.집합)] = 입력.value.replace(/[^0-9]/g, ''); 저장(); 다시(); const 새 = 본문.querySelector(`[data-set="${c.집합.join('')}"] input`); if (새) { 새.focus(); 새.setSelectionRange(새.value.length, 새.value.length); } });
          const 맞 = 셀맞음(단.k, c);
          return h('div', {
            class: 'cset' + (잘 ? ' cut' : 맞 ? (c.통과 ? ' pass' : ' fail') : '') + (보는집합 && 보는집합.join() === c.집합.join() ? ' cur' : ''),
            'data-set': c.집합.join(''),
            onClick: e => { if (e.target.tagName === 'INPUT') return; 보는집합 = c.집합; 거래그리기(); 다시표시(); },
          },
            h('span', { class: 'nm' }, 집합글(c.집합)),
            잘 ? h('span', { class: 'small', title: '부분 집합 가운데 빈번하지 않은 것이 있어 세지 않아도 돼요' }, '✂ 가지치기') : 입력,
            h('span', { class: 'mark ' + (맞 && !잘 ? (c.통과 ? 'o' : 'x') : '') }, 잘 ? '' : 맞 ? (c.통과 ? '○' : '×') : '?'));
        })),
        h('div', { class: 'row nw' },
          h('span', { class: 'badge' }, `최소 지지도 ${최소글} — ${상태.최소}번 이상 나오면 ○`),
          남은 ? h('span', { class: 'muted' }, `아직 ${남은}개 남았어요`) : h('span', { class: 'badge ok' }, '모두 셌어요!'),
          h('button', { class: 'btn xs', onClick: () => { for (const c of 단.후보) 상태.셈[열쇠(단.k, c.집합)] = String(c.횟수); 저장(); 다시(); } }, '🧑‍🏫 모두 세어 주기'),
          h('button', { class: 'btn sm primary', disabled: !!남은, style: { marginLeft: 'auto' }, onClick: () => { 상태.단계++; 저장(); 다시(); } }, `F${단.k} 확정 ▶`)),
        단.k > 1 && 단.후보.some(c => c.잘림) && !상태.가지치기
          ? h('div', { class: 'muted small' }, '🔬 왼쪽 [가지치기]를 켜 보세요 — 세어 보지 않아도 되는 후보가 있어요.') : null);
    } else {
      const 다음 = 단계들[Math.floor(상태.단계 / 2) + 1];
      const 마지막 = !다음;
      if (마지막 && !상태.끝) { 상태.끝 = true; 저장(); 도구.완료(); }
      const 최종 = 단.빈번.length ? 단.빈번 : (단계들[Math.floor(상태.단계 / 2) - 1]?.빈번 || []);
      채우기(본문,
        h('div', { class: 'tip small' }, `최소 지지도(${최소글})를 만족한 ${단.k}-항목 후보 집합만 ${단.k}-항목 빈번 집합 F${단.k} 로 확정해요.`),
        h('div', { class: 'row', style: { gap: '8px' } }, 단.빈번.length
          ? 단.빈번.map(f => h('div', { class: 'cset pass' }, h('span', { class: 'nm' }, 집합글(f.집합)), h('span', { class: 'small' }, `지지도 ${f.횟수}`)))
          : h('div', { class: 'fb bad' }, `최소 지지도를 넘는 ${단.k}-항목 집합이 없어요.`)),
        h('div', { class: 'small' }, '빠진 후보: ', 단.후보.filter(c => !c.통과).map(c => 집합글(c.집합)).join(', ') || '없음'),
        마지막
          ? h('div', { class: 'fb ok' }, `🎉 더 큰 후보 집합을 만들 수 없어 끝났어요. 최종 빈번 집합: `, h('b', null, 최종.map(f => 집합글(f.집합)).join(', ') || '없음'),
            ' — 이제 이 집합 안에서 신뢰도·향상도를 구해 연관 규칙을 정리해요.')
          : h('div', { class: 'row nw' }, h('span', { class: 'muted' }, `F${단.k} 의 요소 {${[...new Set(단.빈번.flatMap(f => f.집합))].join(', ')}} 로 ${단.k + 1}-항목 후보를 만들어요.`),
            h('button', { class: 'btn sm primary', style: { marginLeft: 'auto' }, onClick: () => { 상태.단계++; 저장(); 다시(); } }, `C${단.k + 1} 만들기 ▶`)));
    }
  }
  const 다시표시 = () => 본문.querySelectorAll('.cset').forEach(x => x.classList.toggle('cur', !!보는집합 && x.dataset.set === 보는집합.join('')));

  const 최소단추 = 고르기단추([1, 2, 3].map(v => ({ 값: v, 글: `${v}/4` })), 상태.최소, v => { 상태.최소 = v; 상태.단계 = 0; 저장(); 다시(); }, 'sm');
  const 가지단추 = h('button', { class: 'btn sm' + (상태.가지치기 ? ' primary' : ''), onClick: () => { 상태.가지치기 = !상태.가지치기; 가지단추.className = 'btn sm' + (상태.가지치기 ? ' primary' : ''); 가지단추.textContent = (상태.가지치기 ? '✂ 가지치기 켜짐' : '✂ 가지치기 꺼짐'); 저장(); 다시(); } }, 상태.가지치기 ? '✂ 가지치기 켜짐' : '✂ 가지치기 꺼짐');
  const 편집단추 = h('button', { class: 'btn sm', onClick: () => { 상태.편집 = !상태.편집; 편집단추.textContent = 상태.편집 ? '✔ 거래 바꾸기 끝' : '✏️ 거래 바꾸기'; 저장(); 다시(); } }, 상태.편집 ? '✔ 거래 바꾸기 끝' : '✏️ 거래 바꾸기');
  const 되돌리기 = h('button', { class: 'btn sm', onClick: () => { 상태.거래 = 알파.거래.map(t => [...t]); 상태.셈 = {}; 상태.단계 = 0; 저장(); 다시(); } }, '↺ 처음 거래로');

  el.append(h('div', { class: 'split' },
    h('div', { class: 'col', style: { flex: 0.72 } },
      h('h2', null, '🪜 Apriori 단계별 시뮬레이터'),
      거래칸,
      h('div', { class: 'row' }, h('b', { class: 'small' }, '최소 지지도'), 최소단추),
      h('div', { class: 'row' }, 편집단추, 되돌리기),
      h('div', { class: 'panel', style: { padding: '6px 10px' } },
        h('div', { class: 'row nw' }, h('b', { class: 'small' }, '🔬 더 깊이'), 가지단추),
        h('div', { class: 'small muted', style: { marginTop: '3px' } }, '빈번하지 않은 부분 집합을 품은 후보는 세어 보지 않아도 빈번 집합이 될 수 없어요. 예) {A, B} 가 드물면 {A, B, C} 도 드물다.'))),
    h('div', { class: 'col', style: { flex: 1.28 } },
      단계칸,
      h('div', { class: 'panel fill' }, 본문, 기록칸))));
  다시();
}

// ───────────────────────── 4. 햄버거 가게의 연관 규칙 ─────────────────────────
function 햄버거가게(el, 수명, 도구) {
  const 품목 = 햄버거.품목, 거래 = 햄버거.거래, N = 거래.length;
  const st = 지표(거래, '햄버거', '콜라'), 역 = 지표(거래, '콜라', '햄버거');
  const 문항 = [
    { 키: 'sup', 글: '지지도(햄버거, 콜라)', 값: st.지지도 },
    { 키: 'c1', 글: '신뢰도(햄버거 → 콜라)', 값: st.신뢰도 },
    { 키: 'c2', 글: '신뢰도(콜라 → 햄버거)', 값: 역.신뢰도 },
    { 키: 'lift', 글: '향상도(햄버거, 콜라)', 값: st.향상도 },
  ];
  const 상태 = 기록.get('햄버거', { 최소: 0.4, 입력: {}, 맞음: false, 칠하기: false });
  const 저장 = () => 기록.set('햄버거', 상태);
  const 끝확인 = () => { const 글 = (기록.get('서술', {}).전략 || '').replace(/\s/g, ''); if (상태.맞음 && 글.length >= 힌트글자) 도구.완료(); };
  const 표칸 = h('div');
  const 빈발칸 = h('div', { class: 'row', style: { gap: '5px' } });
  function 표그리기() {
    채우기(표칸, h('table', { class: 'grid', style: { width: '100%', fontSize: '15.5px' } },
      h('tr', null, h('th', null, '트랜잭션'), h('th', { class: 'l' }, '항목')),
      거래.map((t, i) => {
        const 햄 = t.includes('햄버거'), 콜 = t.includes('콜라');
        const 배경 = !상태.칠하기 ? '' : 햄 && 콜 ? '#e1f5e8' : 햄 ? '#e3effc' : 콜 ? '#fdeedd' : '';
        return h('tr', { style: { background: 배경 } }, h('td', null, i + 1), h('td', { class: 'l' }, t.map(칩글).join(', ')));
      })));
  }
  function 빈발그리기() {
    const 최소횟수 = Math.ceil(상태.최소 * N - 1e-9);
    const 목록 = 빈발집합(거래, 품목, 최소횟수);
    채우기(빈발칸, 목록.length ? 목록.map(f => h('span', { class: 'cset pass', style: { minWidth: 0 } }, h('span', { class: 'nm', style: { fontSize: '14px' } }, 집합글(f.집합)), h('span', { class: 'small' }, `${f.횟수}/${N}`)))
      : h('span', { class: 'muted' }, '최소 지지도를 넘는 항목 집합이 없어요.'));
  }
  const 슬 = 슬라이더({ 이름: '최소 지지도', min: 0.1, max: 0.7, step: 0.1, 값: 상태.최소, 글: v => `${v.toFixed(1)} (${Math.round(v * N)}번 이상)`, onInput: v => { 상태.최소 = Math.round(v * 10) / 10; 저장(); 빈발그리기(); } });
  const 입력들 = {};
  const 피드백 = h('div', { class: 'fb' });
  const 입력칸 = h('div', { class: 'col', style: { gap: '5px' } }, 문항.map(q => {
    const 칸 = h('input', { class: 'num', style: { width: '96px' }, value: 상태.입력[q.키] ?? '', placeholder: '분수·소수', 'aria-label': q.글 });
    칸.addEventListener('input', () => { 상태.입력[q.키] = 칸.value; 칸.classList.remove('ok', 'bad'); 저장(); });
    입력들[q.키] = 칸;
    return h('div', { class: 'row nw', style: { justifyContent: 'space-between' } }, h('span', null, q.글), 칸);
  }));
  const 채점 = (조용히 = false) => {
    let 다 = true;
    for (const q of 문항) { const ok = 맞는수(상태.입력[q.키], q.값); 입력들[q.키].classList.toggle('ok', ok); 입력들[q.키].classList.toggle('bad', !ok); if (!ok) 다 = false; }
    상태.맞음 = 다; 저장();
    if (!조용히 || 다) 알림(피드백, 다 ? `⭕ 모두 정답! 지지도 0.4 · 신뢰도(햄버거→콜라) 0.8 · 신뢰도(콜라→햄버거) ${수글(역.신뢰도)} · 향상도 ${수글(st.향상도)} > 1 — 햄버거와 콜라는 서로 연관이 있어요.` : '❌ 빨간 칸을 다시 계산해 보세요. 햄버거가 든 거래 수, 콜라가 든 거래 수부터 세어요.', 다 ? 'ok' : 'bad');
    끝확인();
  };
  if (상태.맞음) queueMicrotask(() => 채점(true));
  const 칠단추 = h('button', { class: 'btn xs', onClick: () => { 상태.칠하기 = !상태.칠하기; 저장(); 표그리기(); 칠단추.textContent = 상태.칠하기 ? '칠하기 끄기' : '🎨 칠하기'; } }, 상태.칠하기 ? '칠하기 끄기' : '🎨 칠하기');

  el.append(h('div', { class: 'split' },
    h('div', { class: 'col', style: { flex: 0.82 } },
      h('h2', { style: { whiteSpace: 'nowrap' } }, '🍔 햄버거 가게의 연관 규칙'),
      h('div', { class: 'row nw', style: { justifyContent: 'space-between' } }, h('h3', null, '① 거래(트랜잭션) 데이터'), 칠단추),
      표칸,
      h('div', { class: 'muted', style: { fontSize: '13px' } }, '칠하기를 켜면 초록 = 햄버거·콜라 함께 · 파랑 = 햄버거만 · 주황 = 콜라만')),
    h('div', { class: 'col', style: { flex: 1 } },
      h('div', { class: 'panel' }, h('h3', null, '② 빈발 항목 집합 구하기'), 슬, 빈발칸,
        h('div', { class: 'muted', style: { fontSize: '13px', marginTop: '3px' } }, '최소 지지도 0.4 로 두면 2-항목 빈발 집합은 무엇이 남나요?')),
      h('div', { class: 'panel' }, h('h3', null, '③ 연관성 분석하기 — 직접 계산'), 입력칸,
        h('div', { class: 'row nw', style: { marginTop: '5px' } }, h('button', { class: 'btn sm primary', onClick: () => 채점() }, '확인'), 피드백))),
    h('div', { class: 'col', style: { flex: 1 } },
      h('div', { class: 'panel' }, h('h3', null, '④ 연관 규칙 구하기 — 선행과 후행'),
        h('table', { class: 'grid', style: { width: '100%', fontSize: '14.5px', marginTop: '4px' } },
          h('tr', null, h('th', null, '연관 규칙'), h('th', { class: 'l' }, '만약 A 가 일어나면 B 도 일어날 가능성이 높다')),
          h('tr', null, h('td', null, h('b', { class: 'ta' }, '햄버거'), ' → ', h('b', { class: 'tb' }, '콜라')), h('td', { class: 'l' }, '햄버거를 산 손님은 콜라를 함께 살 가능성이 높다.')),
          h('tr', null, h('td', null, h('b', { class: 'ta' }, '콜라'), ' → ', h('b', { class: 'tb' }, '햄버거')), h('td', { class: 'l' }, '콜라를 산 손님은 햄버거를 함께 살 가능성이 높다.'))),
        h('div', { class: 'muted', style: { fontSize: '13px', marginTop: '3px' } }, '파랑 = 선행, 주황 = 후행 — 빈발 집합 {햄버거, 콜라} 가 같아도 방향에 따라 신뢰도가 달라져요.')),
      h('div', { class: 'formula', style: { fontSize: '15.5px' } }, '향상도 = ', 분수('P(햄버거∩콜라)', 'P(햄버거)·P(콜라)')),
      서술칸({ 키: '전략', ...서술.전략, 줄: 3, 힌트글자, 다씀: 끝확인, 작게: true }))));
  표그리기(); 빈발그리기();
}

export default {
  id: 'apriori', 이름: 'Apriori', 아이콘: '🧮',
  카드: [
    { id: 'why', 제목: '왜 Apriori?', 그리기: 왜 },
    { id: 'itemset', 제목: '트랜잭션과 항목 집합', 그리기: 항목집합 },
    { id: 'steps', 제목: '단계별 시뮬레이터', 그리기: 시뮬레이터 },
    { id: 'burger', 제목: '햄버거 가게 규칙', 그리기: 햄버거가게 },
  ],
};
