/*! 연관 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유 */
// 여러 카드가 함께 쓰는 그림 조각 — 영수증 · 벤 다이어그램 · 분수 · 동시 구매표 · 지표 계산 흐름
import { h, s, 을 } from './ui.js';
import { 지표, 분수글, 수글, 포함, 동시구매표 } from './assoc.js';
import { 그림 } from '../data.js';

const 배열로 = x => (Array.isArray(x) ? x : x == null ? [] : [x]);

/** 상품 칩 하나 */
export function 상품칩(이름, cls = '') {
  return h('span', { class: 'it ' + cls }, 그림[이름] && 이름.length > 1 ? 그림[이름] + ' ' : '', 이름);
}

/**
 * 영수증(거래) 묶음.
 *  A, B: 상품 이름(또는 배열) — A 는 파랑, B 는 주황, 둘 다 든 거래는 초록
 *  흐리게: 'notA' 이면 A 가 없는 거래를 흐리게 (신뢰도), 'none' 이면 A·B 둘 다 없는 거래를 흐리게
 *  강조: [상품…] — 그 상품 칩만 노랗게 (동시 구매표 칸을 눌렀을 때, 세는 것은 학생 몫)
 *  편집: (거래번호, 상품) => {} 이면 모든 상품을 단추로 보여 넣고 뺄 수 있다(품목 필요)
 */
export function 영수증들(거래들, { A, B, 흐리게, 강조 = [], 편집, 품목, 열 = 3, 번호 = i => `주문 ${i + 1}`, 표시 = true, 작게 = false } = {}) {
  const a = 배열로(A), b = 배열로(B);
  return h('div', { class: `rcpts c${열}${작게 ? ' mini' : ''}` }, 거래들.map((t, i) => {
    const 가 = a.length && 포함(t, a), 나 = b.length && 포함(t, b);
    let cls = 'rcpt';
    if (표시 && 가 && 나) cls += ' ab'; else if (표시 && 가) cls += ' a'; else if (표시 && 나) cls += ' b';
    if (흐리게 === 'notA' && a.length && !가) cls += ' dim';
    if (흐리게 === 'none' && !가 && !나) cls += ' dim';
    const 꼬리 = 표시 && 가 && 나 ? h('span', { class: 'tag ab' }, 'A·B') : 표시 && 가 ? h('span', { class: 'tag a' }, 'A') : 표시 && 나 ? h('span', { class: 'tag b' }, 'B') : null;
    const 칩들 = 편집
      ? 품목.map(x => h('button', {
        class: 'it ' + (t.includes(x) ? (a.includes(x) ? 'a' : b.includes(x) ? 'b' : '') : 'off'),
        title: t.includes(x) ? `${x} 빼기` : `${x} 넣기`,
        onClick: () => 편집(i, x),
      }, 그림[x] && x.length > 1 ? 그림[x] + ' ' : '', x))
      : t.map(x => 상품칩(x, 강조.includes(x) ? 'hl' : a.includes(x) ? 'a' : b.includes(x) ? 'b' : ''));
    return h('div', { class: cls }, h('div', { class: 'rcpt-h' }, h('b', null, 번호(i)), 꼬리), h('div', { class: 'its' }, 칩들));
  }));
}

/** 분수 모양 (위/아래) */
export const 분수 = (위, 아래) => h('span', { class: 'frac' }, h('span', null, 위), h('span', null, 아래));

/**
 * 벤 다이어그램 — 영역마다 그 영역에 든 거래 번호를 적는다.
 * 모드: 'sup'(전체 상자와 겹친 곳) · 'conf'(A 원과 겹친 곳) · 'lift'(B 원) · 'pa'(그냥)
 * 가림: true 면 영역의 건수 글자를 숨긴다(직접 세게 할 때)
 */
export function 벤(거래들, A, B, { 모드 = 'pa', 가림 = false, 이름A, 이름B, w = 440, hh = 280 } = {}) {
  const a = 배열로(A), b = 배열로(B);
  const 번호 = 조건 => 거래들.map((t, i) => [t, i]).filter(([t]) => 조건(t)).map(([, i]) => i + 1);
  const 오직A = 번호(t => 포함(t, a) && !포함(t, b)), 둘 = 번호(t => 포함(t, a) && 포함(t, b));
  const 오직B = 번호(t => !포함(t, a) && 포함(t, b)), 없음 = 번호(t => !포함(t, a) && !포함(t, b));
  const cx1 = w * 0.375, cx2 = w * 0.625, cy = hh * 0.53, r = hh * 0.33;
  const 강조상자 = 모드 === 'sup', 강조A = 모드 === 'conf', 강조B = 모드 === 'lift';
  const 아이디 = 'vc' + Math.random().toString(36).slice(2, 7);
  const 목록글 = (xs, x, y, 색) => xs.map((n, k) => s('text', { x, y: y + k * 19 - ((xs.length - 1) * 19) / 2, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: 색 }, `${n}번`));
  const 글A = 이름A || a.join('·'), 글B = 이름B || b.join('·');
  return s('svg', { viewBox: `0 0 ${w} ${hh}`, class: 'plot venn', role: 'img', 'aria-label': `${글A}와 ${글B} 벤 다이어그램` },
    s('defs', null, s('clipPath', { id: 아이디 }, s('circle', { cx: cx1, cy, r }))),
    s('rect', { x: 2, y: 2, width: w - 4, height: hh - 4, rx: 12, fill: '#fff', stroke: 강조상자 ? '#1f2433' : '#cfc8da', 'stroke-width': 강조상자 ? 3 : 1.2 }),
    s('text', { x: 12, y: 22, 'font-size': 14, fill: '#5d6475', 'font-weight': 700 }, `전체 거래 ${거래들.length}건`),
    s('circle', { cx: cx1, cy, r, fill: 'rgba(46,134,222,.12)', stroke: '#2e86de', 'stroke-width': 강조A ? 5 : 2 }),
    s('circle', { cx: cx2, cy, r, fill: `rgba(234,122,18,${강조B ? 0.26 : 0.12})`, stroke: '#ea7a12', 'stroke-width': 강조B ? 5 : 2 }),
    모드 === 'sup' || 모드 === 'conf' ? s('circle', { cx: cx2, cy, r, 'clip-path': `url(#${아이디})`, fill: 'rgba(39,174,96,.38)' }) : null,
    s('text', { x: cx1 - r * 0.35, y: cy - r - 8, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#1d5fa0' }, `A: ${글A}${가림 ? '' : ` (${오직A.length + 둘.length}건)`}`),
    s('text', { x: cx2 + r * 0.35, y: cy - r - 8, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#a3530a' }, `B: ${글B}${가림 ? '' : ` (${오직B.length + 둘.length}건)`}`),
    목록글(오직A, cx1 - r * 0.5, cy + 5, '#1d5fa0'),
    목록글(둘, (cx1 + cx2) / 2, cy + 5, '#145c33'),
    목록글(오직B, cx2 + r * 0.5, cy + 5, '#a3530a'),
    s('text', { x: w / 2, y: hh - 10, 'text-anchor': 'middle', 'font-size': 13.5, fill: '#5d6475' },
      `A∩B: ${가림 ? '?' : 둘.length + '건'}${없음.length ? ` · 둘 다 없음: ${없음.map(n => n + '번').join(', ')}` : ''}`),
  );
}

/**
 * 동시 구매표 (아래 삼각형). 칸(td)을 만드는 일은 칸그리기(행, 열, 값) 에 맡긴다 — 입력 칸 / 숫자 / 역할 색칠 등
 */
export function 동시구매표판(품목, 칸그리기) {
  return h('div', { class: 'mtx-wrap' }, h('table', { class: 'mtx' },
    h('tr', null, h('th'), 품목.map(x => h('th', null, 그림[x] || '', h('br'), x))),
    품목.map((행이름, r) => h('tr', null,
      h('th', { class: 'row-h' }, `${그림[행이름] || ''} ${행이름}`),
      품목.map((_, c) => (c > r ? h('td', { class: 'dash' }, '–') : 칸그리기(r, c)))))));
}

/** 동시 구매표에서 이 지표를 계산할 때 쓰는 칸을 색칠해 보여 준다 (A∩B · A · B) */
export function 쓰이는칸(거래들, 품목, A, B, 쓰는것 = ['ab', 'a', 'b'], 보여줄칸 = () => true) {
  const 표 = 동시구매표(거래들, 품목);
  const i = 품목.indexOf(A), j = 품목.indexOf(B);
  const [r0, c0] = i >= j ? [i, j] : [j, i];
  return 동시구매표판(품목, (r, c) => {
    const 역할 = r === r0 && c === c0 && 쓰는것.includes('ab') ? 'ab' : r === i && c === i && 쓰는것.includes('a') ? 'a' : r === j && c === j && 쓰는것.includes('b') ? 'b' : '';
    return h('td', { class: (역할 ? 'role-' + 역할 : '') + (r === c ? ' diag' : ''), style: { cursor: 'default' } },
      보여줄칸(r, c) ? 표[r][c] : h('span', { class: 'qmark' }, '?'));
  });
}

/** 지표 값 글자 — 분수와 소수를 함께 (3/4 = 0.75) */
export function 값글(n, d) {
  if (!d) return '—';
  const f = 분수글(n, d), v = 수글(n / d);
  return f === v ? f : `${f} = ${v}`;
}

/** 규칙 문장 — 만약 A 를 구매했다면, B 도 구매할 가능성이 높다 */
export function 규칙문장(A, B) {
  const a = 배열로(A).join('·'), b = 배열로(B).join('·');
  return h('div', { class: 'big-eq' }, '만약 ', h('em', { class: 'a' }, a), 을(a).slice(a.length), ' 구매했다면, ', h('em', { class: 'b' }, b), '도 구매할 가능성이 높다');
}

export { 지표 };
