/*! 연관 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유 */
// 전체 학습 내용을 A4 PDF 로 만든다.
// A4 크기의 쪽을 화면 밖에 그린 뒤 html2canvas 로 그림을 떠서 jsPDF 로 묶는다(인터넷 필요 없음).
// 학생의 기록(store)으로 표·그래프를 다시 그린다 — 화면을 찍는 것이 아니다.
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { h, s } from './lib/ui.js';
import { 기록 } from './lib/store.js';
import { 지표, 동시구매표, 규칙목록, 좋은규칙, 향상도판정, 추천, 세기, apriori단계, 집합수, 규칙수, 수글, 분수글, 맞는수, 집합글, 조합 } from './lib/assoc.js';
import {
  편의점, 편의점40, 햄버거, 알파, 쇼핑몰, 미리적은칸, 정의빈칸, 사례, 음료이야기, 규칙문장, 세질문, 향상도뜻빈칸,
  정리표쌍, 판정규칙, 서술, 확인문제, 정리빈칸,
} from './data.js';
import { 탭들 } from './tabs/index.js';

let 쪽수 = 7;

// SVG 는 앱의 CSS 를 모르므로 필요한 모양을 그림 안에 넣어 그림 파일(img)로 바꾼다
const 그래프모양 = `
  .grid{stroke:#e7e2ee;stroke-width:1} .tick{font-size:12.5px;fill:#6b6f80}
  .axis-name{font-size:14px;font-weight:800;fill:#3b3f52}
  text{font-family:'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo',sans-serif}`;
function 그림(svg, 폭) {
  const 복사 = svg.cloneNode(true);
  복사.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const 모양 = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  모양.textContent = 그래프모양;
  복사.prepend(모양);
  const 글 = new XMLSerializer().serializeToString(복사);
  const img = h('img', { src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(글) });
  img.style.width = 폭 + 'px';
  img.style.display = 'block';
  return img;
}

const 안함 = 글 => h('div', { class: 'p-none' }, `⬜ 아직 하지 않은 활동입니다${글 ? ' — ' + 글 : ''}`);
const 제목 = (번, 글) => h('h2', { class: 'p-h2' }, h('span', null, 번), 글);
const 표 = (머리, 줄들, 넓이) => h('table', { class: 'p-table', style: 넓이 ? { width: 넓이 } : null },
  h('tr', null, 머리.map(m => h('th', null, m))),
  줄들.map(r => h('tr', null, r.map(c => h('td', null, c)))));
const 맞음표 = ok => h('b', { class: ok ? 'p-ok' : 'p-bad' }, ok ? '⭕' : '❌');
const 빈글 = v => (v == null || String(v).trim() === '' ? '—' : String(v));

function 쪽(번호, ...내용) {
  return h('div', { class: 'p-page' },
    h('div', { class: 'p-head' }, h('b', null, '🛒 연관 분석 실험실'), h('span', null, '「데이터 과학」 — 연관 분석 모델의 개념')),
    h('div', { class: 'p-body' }, ...내용),
    h('div', { class: 'p-foot' }, h('span', null, '© 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요'), h('span', null, `${번호} / ${쪽수}`)));
}

/** 서술형 — 물음 · 내가 쓴 답 · 예시 답 */
function 서술줄(키) {
  const 글 = (기록.get('서술', {})[키] || '').trim();
  const q = 서술[키];
  return h('div', { class: 'p-essay' },
    h('div', { class: 'p-q' }, '✍️ ', q.물음),
    글 ? h('div', { class: 'p-mine' }, 글) : 안함('서술형'),
    h('div', { class: 'p-ex' }, h('b', null, '예시 답 '), q.예시));
}

// ───────────── 1쪽 표지 ─────────────
function 쪽1() {
  const 목록 = 탭들.flatMap(t => t.카드.filter(c => c.id !== 'pdf').map(c => ({ 글: `${t.이름} · ${c.제목}`, 끝: 기록.완료됨(`${t.id}/${c.id}`) })));
  const 마친 = 목록.filter(x => x.끝).length;
  const 오늘 = new Date();
  return 쪽(1,
    h('div', { class: 'p-cover' },
      h('div', { class: 'p-cart' }, '🛒'),
      h('h1', null, '연관 분석 모델의 개념'),
      h('div', { class: 'p-sub' }, '연관 분석 실험실 · 학습 정리'),
      h('div', { class: 'p-date' }, `${오늘.getFullYear()}년 ${오늘.getMonth() + 1}월 ${오늘.getDate()}일`),
      h('div', { class: 'p-name' }, '학번 ____________   이름 ____________')),
    제목('🎯', '학습 목표'),
    h('ul', null, h('li', null, '데이터 간의 관계를 분석할 수 있다.'), h('li', null, '데이터 간의 상호 연관성을 파악하고 결과의 의미를 해석할 수 있다.')),
    제목('📋', `활동 현황 — ${마친} / ${목록.length} 완료`),
    h('div', { class: 'p-grid2' }, 목록.map(x => h('div', { class: x.끝 ? 'p-ok' : 'p-no' }, (x.끝 ? '✔ ' : '○ ') + x.글))),
    제목('🔑', '한눈에 보는 연관 분석'),
    표(['개념', '뜻'], [
      ['연관 분석 (장바구니 분석)', '데이터 간의 유용한 규칙이나 패턴과 같이 일련의 연관성을 찾아내는 분석 방법'],
      ['연관 규칙 A → B', 'if A then B — 만약 A 를 구매했다면 B 도 구매할 가능성이 높다 (A 선행, B 후행)'],
      ['지지도 (support)', 'P(A∩B) = A 와 B 가 함께 든 거래 수 ÷ 전체 거래 수'],
      ['신뢰도 (confidence)', 'P(B|A) = P(A∩B) ÷ P(A) = 지지도 ÷ P(A)'],
      ['향상도 (lift)', 'P(B|A) ÷ P(B) = P(A∩B) ÷ (P(A)·P(B)) — 1 보다 크면 연관, 1 이면 독립, 1 보다 작으면 억제'],
      ['Apriori 알고리즘', '최소 지지도를 넘는 빈발 항목 집합만 남겨 계산을 줄이고 연관 규칙을 찾는 방법'],
    ]),
    h('div', { class: 'p-tip' }, '이 문서는 「연관 분석 실험실」에서 내가 직접 한 활동 결과로 만들어졌습니다.'));
}

// ───────────── 2쪽 Ⅰ 생각 열기 ─────────────
function 쪽2() {
  const 추 = 기록.get('추천');
  const 정 = 기록.get('정의');
  const 사 = 기록.get('사례');
  const 표현 = 기록.get('표현');
  let 추천줄 = 안함('「생각 열기 › 추천의 비밀」');
  if (추 && 추.담아본?.length) {
    const 결과 = 추천(쇼핑몰.거래, 쇼핑몰.품목, 추.장바구니 || []);
    추천줄 = h('div', null,
      h('p', null, `담아 본 상품: ${추.담아본.join(', ')} (${추.담아본.length}종)`),
      추.장바구니?.length
        ? h('p', null, `마지막 장바구니 {${추.장바구니.join(', ')}} → 함께 산 상품 추천: `,
          결과.목록.slice(0, 3).map(r => `${r.상품} ${Math.round(r.신뢰도 * 100)}%`).join(' · ') || '없음',
          h('span', { class: 'p-note' }, `  (담은 상품이 든 주문 ${결과.기준수}건 가운데 함께 산 비율 = 신뢰도)`))
        : null);
  }
  return 쪽(2,
    제목('Ⅰ', '생각 열기 — 연관 분석이란?'),
    h('h3', null, '🛒 추천의 비밀 — 쇼핑몰은 어떻게 추천할까?'),
    추천줄,
    서술줄('추천'),
    h('h3', null, '🔗 연관 분석의 정의'),
    정 ? h('ol', null, 정의빈칸.map((b, i) => {
      const ok = b.답.some(d => String(정.답[i] || '').replace(/\s/g, '') === d);
      return h('li', null, b.앞, ' ', h('b', { class: ok ? 'p-fill' : 'p-blank' }, ok ? 정.답[i] : `( ${b.답[0]} )`), ' ', b.뒤);
    })) : 안함('「생각 열기 › 연관 분석이란?」'),
    정 ? h('p', null, `▸ 분석 흐름: 구매 데이터 → 연관 규칙 분석 → 마케팅 전략 · 채소 진열대 위치: ${정.진열 === 0 ? '정육 코너 옆 ⭕' : 정.진열 == null ? '—' : '다시 생각해 보기'} · 궁금증 카드 ${정.뒤집음?.length || 0}/6장`) : null,
    h('h3', null, '🌍 연관 분석은 어디에 쓰일까?'),
    표(['분야', '연관 규칙 (A → B)', '활용', ''], 사례.map((c, i) => [`${c.아이콘} ${c.분야}`, `${c.A} → ${c.B}`, c.활용, 사?.맞춤?.includes(i) ? '✔' : '○'])),
    h('p', null, `▸ ${음료이야기.물음} → 내 답: ${사?.음료 != null ? 음료이야기.보기[사.음료] : '—'} ${사?.음료 === 음료이야기.답 ? '⭕' : ''}`),
    서술줄('주변'),
    h('h3', null, '✏️ 연관 규칙의 표현'),
    표현 ? h('p', null, `내가 만든 규칙 ${표현.만든.length}개: ${표현.만든.map(([a, b]) => `${a.replace(/^\S+\s/, '')} → ${b.replace(/^\S+\s/, '')}`).join(' · ') || '—'} / 선행(A) 찾기 ${표현.문제.filter((v, i) => v === 규칙문장[i].A).length}/${규칙문장.length} / 방향이 바뀌면 ${표현.방향 === 1 ? '다른 뜻 ⭕' : '—'}`) : 안함('「생각 열기 › 연관 규칙의 표현」'));
}

// ───────────── 3쪽 Ⅱ 세 가지 지표 ─────────────
function 쪽3() {
  const 품목 = 편의점.품목, 거래 = 편의점.거래;
  const 정답표 = 동시구매표(거래, 품목);
  const 동 = 기록.get('동시표', { 칸: {} });
  const 미리 = (r, c) => 미리적은칸.some(([a, b]) => a === r && b === c);
  const 세 = 기록.get('세질문');
  const P = 기록.get('P표');
  const 동시판 = h('table', { class: 'p-table p-mtx' },
    h('tr', null, h('th'), 품목.map(x => h('th', null, x))),
    품목.map((행, r) => h('tr', null, h('th', null, 행), 품목.map((_, c) => {
      if (c > r) return h('td', { class: 'p-dash' }, '–');
      if (미리(r, c)) return h('td', null, h('b', null, 정답표[r][c]));
      const v = String(동.칸[`${r},${c}`] ?? '').trim();
      const ok = v === String(정답표[r][c]);
      return h('td', { class: ok ? 'p-cell-ok' : 'p-cell-no' }, ok ? v : v ? `${v}→${정답표[r][c]}` : `(${정답표[r][c]})`);
    }))));
  const 직접 = ['sup', 'conf', 'lift'].map(k => 기록.get('지표.' + k));
  const 목표 = 지표(거래, '삼각김밥', '사이다');
  const 이름 = { sup: '지지도', conf: '신뢰도', lift: '향상도' };
  const OX답 = { sup: 'O', conf: 'X', lift: 'O' };
  return 쪽(3,
    제목('Ⅱ', '세 가지 지표 — 지지도 · 신뢰도 · 향상도'),
    h('p', null, '연관 규칙을 찾으려면 각 규칙이 얼마나 자주 일어나고(지지도), 얼마나 믿을 만한지(신뢰도), 우연이 아닌지(향상도) 평가해야 한다. ', h('b', null, '지지도 → 신뢰도 → 향상도'), ' 차례로 계산해 향상도가 1 보다 큰지 확인한다.'),
    세 ? h('p', null, '▸ 말풍선 짝짓기: ', 세질문.map((q, i) => `「${q.말}」 → ${세.짝[i] || '—'} ${세.짝[i] === q.답 ? '⭕' : ''}`).join(' / ')) : null,
    h('div', { class: 'p-row' },
      h('div', { class: 'p-col' },
        h('h3', null, '🧾 편의점 주문 6건의 동시 구매표'),
        동시판,
        h('p', { class: 'p-note' }, '굵은 수 = 미리 적어 둔 칸 · 초록 = 내가 맞게 채운 칸 · ( ) = 채우지 않은 칸의 답 · a→b = 고쳐야 할 칸')),
      h('div', { class: 'p-col', style: { flex: '0 0 230px' } },
        h('h3', null, 'P(A) 정리'),
        표(['A', '내 답', 'P(A)'], 품목.map(x => {
          const v = P?.값?.[x];
          const 정 = 세기(거래, [x]) / 거래.length;
          return [x, 빈글(v), `${분수글(세기(거래, [x]), 거래.length)} ${v && 맞는수(v, 정) ? '⭕' : ''}`];
        })))),
    서술줄('최고칸'),
    h('h3', null, '✍️ 직접 계산하기 — 삼각김밥 → 사이다'),
    표(['지표', '내 답', '정답', 'A·B 를 바꾸어도 같을까?'], ['sup', 'conf', 'lift'].map((k, i) => {
      const d = 직접[i];
      const 값 = { sup: 목표.지지도, conf: 목표.신뢰도, lift: 목표.향상도 }[k];
      const 정답글 = { sup: `3/6 = ${수글(목표.지지도)}`, conf: `3/4 = ${수글(목표.신뢰도)}`, lift: `9/8 = ${수글(목표.향상도)}` }[k];
      return [이름[k], d ? `${빈글(d.입력?.v)} ${d.풀림 ? '⭕' : ''}` : '—', 정답글, d?.ox ? `${d.ox} ${d.ox === OX답[k] ? '⭕' : '❌'} (정답 ${OX답[k]})` : `— (정답 ${OX답[k]})`];
    })),
    h('p', { class: 'p-note' }, `향상도 ${수글(목표.향상도)} > 1 이므로 삼각김밥을 살 때 사이다를 함께 살 확률이 높다 (양의 연관). 신뢰도만 A·B 를 바꾸면 달라질 수 있다.`),
    서술줄('세지표'));
}

// ───────────── 4쪽 Ⅲ 연관 규칙 찾기 (실험실 · 정리표) ─────────────
function 쪽4() {
  const 실 = 기록.get('실험실');
  const 정 = 기록.get('정리표');
  const 도전글 = { lt: '향상도를 1 보다 작게', eq: '향상도를 정확히 1 로', add: '전체 거래 수 바꾸기', rare: '신뢰도 1 · 지지도 0.2 미만 찾기' };
  const 정리표판 = (p, 쌍번호) => {
    const 줄 = (A, B, 열쇠) => {
      const st = 지표(편의점.거래, A, B);
      const 칸 = (이름, 값) => { const v = 정?.칸?.[`${쌍번호}:${열쇠}:${이름}`]; return `${빈글(v)}${v ? (맞는수(v, 값) ? ' ⭕' : ` → ${수글(값)}`) : ` (${수글(값)})`}`; };
      const ox = 정?.칸?.[`${쌍번호}:${열쇠}:ox`], 답 = 향상도판정(st) === '큼' ? 'O' : 'X';
      return [`${A} → ${B}`, 칸('지지도', st.지지도), 칸('신뢰도', st.신뢰도), 칸('향상도', st.향상도), `${ox || '—'}${ox ? (ox === 답 ? ' ⭕' : ` → ${답}`) : ` (${답})`}`];
    };
    return 표(['규칙', '지지도', '신뢰도', '향상도', '연관 규칙'], [줄(p.A, p.B, 'ab'), 줄(p.B, p.A, 'ba')]);
  };
  return 쪽(4,
    제목('Ⅲ', '연관 규칙 찾기'),
    h('h3', null, '🧪 주문 바꾸기 실험실'),
    실 ? h('div', null,
      h('p', null, `마지막 실험: 주문 ${실.거래.length}건, 규칙 ${실.A} → ${실.B} — `, (() => { const st = 지표(실.거래, 실.A, 실.B); return `지지도 ${수글(st.지지도)} · 신뢰도 ${수글(st.신뢰도)} · 향상도 ${수글(st.향상도)}`; })()),
      h('p', null, '도전 과제: ', Object.entries(도전글).map(([k, 글]) => `${실.도전?.includes(k) ? '✔' : '○'} ${글}`).join('   '))) : 안함('「규칙 찾기 › 주문 바꾸기 실험실」'),
    표(['향상도', '뜻', '내 답'], 향상도뜻빈칸.map((b, i) => [b.조건, `${b.앞} ( ${b.답[0]} ) ${b.뒤}`, 빈글(실?.뜻?.[i])])),
    h('h3', null, '📋 실습 정리표 — 편의점 주문 6건'),
    정리표쌍.map((p, i) => (i < 2 || 정?.확인?.[2]) ? h('div', null, h('b', null, p.이름.replace(' 더 해 보기', '')), 정리표판(p, i)) : null),
    h('p', { class: 'p-note' }, '⭕ = 맞게 쓴 칸 · → 뒤 = 정답 · ( ) = 비워 둔 칸의 답. 지지도·향상도는 방향을 바꿔도 같고 신뢰도만 달라진다. 향상도 > 1 이면 연관 규칙 O.'),
    서술줄('발견규칙'));
}

// ───────────── 5쪽 Ⅲ 탐색기 · 좋은 규칙 ─────────────
function 산점도(거래, 품목, 최소지지도, 최소신뢰도, 고른) {
  const rs = 규칙목록(거래, 품목);
  const W = 460, H = 330, pad = { l: 46, r: 12, t: 12, b: 36 }, iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const x최대 = Math.max(0.3, ...rs.map(r => r.지지도)) * 1.1;
  const sx = v => pad.l + (v / x최대) * iw, sy = v => pad.t + ih - (v / 1.05) * ih;
  const 통과 = r => r.지지도 >= 최소지지도 - 1e-9 && r.신뢰도 >= 최소신뢰도 - 1e-9;
  const 눈금x = []; for (let v = 0; v <= x최대 + 1e-9; v += x최대 > 0.6 ? 0.2 : 0.1) 눈금x.push(Math.round(v * 100) / 100);
  return s('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H },
    s('rect', { x: pad.l, y: pad.t, width: iw, height: ih, fill: '#fff', stroke: '#d6cfe0' }),
    s('rect', { x: sx(최소지지도), y: sy(1.05), width: Math.max(0, sx(x최대) - sx(최소지지도)), height: Math.max(0, sy(최소신뢰도) - sy(1.05)), fill: 'rgba(39,174,96,.12)' }),
    눈금x.map(v => [s('line', { x1: sx(v), x2: sx(v), y1: pad.t, y2: pad.t + ih, class: 'grid' }), s('text', { x: sx(v), y: pad.t + ih + 15, 'text-anchor': 'middle', class: 'tick' }, v)]),
    [0, 0.2, 0.4, 0.6, 0.8, 1].map(v => [s('line', { x1: pad.l, x2: pad.l + iw, y1: sy(v), y2: sy(v), class: 'grid' }), s('text', { x: pad.l - 6, y: sy(v) + 4, 'text-anchor': 'end', class: 'tick' }, v)]),
    s('line', { x1: sx(최소지지도), x2: sx(최소지지도), y1: pad.t, y2: pad.t + ih, stroke: '#27ae60', 'stroke-dasharray': '6 4', 'stroke-width': 2 }),
    s('line', { x1: pad.l, x2: pad.l + iw, y1: sy(최소신뢰도), y2: sy(최소신뢰도), stroke: '#27ae60', 'stroke-dasharray': '6 4', 'stroke-width': 2 }),
    s('text', { x: pad.l + iw, y: H - 3, 'text-anchor': 'end', class: 'axis-name' }, '지지도 →'),
    s('text', { x: 4, y: 11, class: 'axis-name' }, '↑ 신뢰도'),
    rs.map(r => {
      const 판 = 향상도판정(r);
      const 골 = 고른 && 고른[0] === r.A && 고른[1] === r.B;
      return s('circle', { cx: sx(r.지지도), cy: sy(r.신뢰도), r: 골 ? 9 : 3.5 + Math.min(r.향상도, 4) * 1.4, fill: 판 === '큼' ? '#27ae60' : 판 === '같음' ? '#8f95a3' : '#d64545', opacity: 통과(r) ? 0.9 : 0.3, stroke: 골 ? '#1f2433' : '#fff', 'stroke-width': 골 ? 3 : 1.2 });
    }));
}
function 쪽5() {
  const 탐 = 기록.get('탐색기');
  const 좋 = 기록.get('좋은규칙');
  const 답들 = 규칙목록(편의점40.거래, 편의점40.품목).filter(r => 좋은규칙(r, 0.2, 0.6)).sort((a, b) => b.향상도 - a.향상도);
  const 판목록 = 판정규칙.map(([A, B]) => ({ A, B, ...지표(편의점40.거래, A, B) }));
  const 조건이름 = ['지지도≥0.2', '신뢰도≥0.6', '향상도>1'];
  return 쪽(5,
    제목('Ⅲ', '연관 규칙 탐색기와 좋은 규칙'),
    h('div', { class: 'p-row' },
      그림(산점도(편의점40.거래, 편의점40.품목, 0.2, 0.6, 탐?.고른), 400),
      h('div', { class: 'p-col' },
        h('h3', null, '🔭 편의점 40건 · 최소 지지도 0.2 · 최소 신뢰도 0.6'),
        h('p', null, '점 하나 = 규칙 하나, 크기 = 향상도, 초록 = 향상도 > 1, 빨강 = < 1. 연한 초록 영역이 두 조건을 모두 넘는 곳이다.'),
        탐 ? h('ul', null,
          h('li', null, `① 좋은 규칙의 수: 내 답 ${빈글(탐.답수)} ${탐.문제?.[0] ? '⭕' : ''} (정답 ${답들.length}개)`),
          h('li', null, `② 향상도가 가장 높은 좋은 규칙: ${탐.문제?.[1] ? '찾음 ⭕' : '—'} (${답들[0].A} → ${답들[0].B}, 향상도 ${수글(답들[0].향상도)})`),
          h('li', null, `③ 향상도 때문에 탈락한 규칙: ${탐.문제?.[2] ? '찾음 ⭕' : '—'} (삼각김밥 → 생수, 신뢰도 0.625 이지만 향상도 ${수글(지표(편의점40.거래, '삼각김밥', '생수').향상도)})`))
          : 안함('「규칙 찾기 › 연관 규칙 탐색기」'),
        h('p', { class: 'p-note' }, '좋은 규칙: ' + 답들.map(r => `${r.A}→${r.B}(${수글(r.향상도)})`).join(', ')))),
    h('h3', null, '🏅 좋은 규칙 고르기 — 내 판정'),
    표(['규칙', '지지도', '신뢰도', '향상도', '내 판정 (✓/✗)', '결과'], 판목록.map((r, i) => {
      const 정 = [r.지지도 >= 0.2 - 1e-9, r.신뢰도 >= 0.6 - 1e-9, 향상도판정(r) === '큼'];
      const 내 = 좋?.표시?.[i] || [null, null, null];
      const 맞 = 내.every((v, k) => v === 정[k]);
      return [`${r.A} → ${r.B}`, `${수글(r.지지도)} (${r.nAB}/${r.N})`, 수글(r.신뢰도), 수글(r.향상도),
        내.map((v, k) => `${v === true ? '✓' : v === false ? '✗' : '?'}${조건이름[k]}`).join(' '),
        h('span', null, 정.every(Boolean) ? '좋은 규칙' : '탈락', ' ', 내.some(v => v !== null) ? 맞음표(맞) : '')];
    })),
    서술줄('거르기'),
    서술줄('활용'));
}

// ───────────── 6쪽 Ⅳ Apriori ─────────────
function 쪽6() {
  const 폭 = 기록.get('폭발');
  const 항 = 기록.get('항목집합');
  const ap = 기록.get('apriori');
  const 햄 = 기록.get('햄버거');
  const 거래 = ap?.거래 || 알파.거래, 최소 = ap?.최소 || 2;
  const 단계들 = apriori단계(거래, 알파.품목, 최소);
  const 본단계 = ap ? Math.floor((ap.단계 + 1) / 2) : 0;   // 확정까지 간 F 단계 수
  const st = 지표(햄버거.거래, '햄버거', '콜라'), 역 = 지표(햄버거.거래, '콜라', '햄버거');
  const 햄문항 = [['sup', '지지도(햄버거, 콜라)', st.지지도], ['c1', '신뢰도(햄버거 → 콜라)', st.신뢰도], ['c2', '신뢰도(콜라 → 햄버거)', 역.신뢰도], ['lift', '향상도(햄버거, 콜라)', st.향상도]];
  return 쪽(6,
    제목('Ⅳ', 'Apriori 알고리즘'),
    h('p', null, '모든 경우를 탐색하면 계산 비용이 급증하므로, 빈발 항목만 고려해 연관 규칙을 만드는 Apriori 알고리즘을 쓴다. ① 거래 데이터 준비 → ② 최소 지지도를 만족하는 빈발 k-항목 집합 구하기 → ③ 향상도·신뢰도를 구하고 연관 규칙 정리.'),
    표(['상품 종류 n', '6', '10', '20', '30'], [
      ['항목 집합 수 2ⁿ − 1', ...[6, 10, 20, 30].map(n => 집합수(n).toLocaleString('ko-KR'))],
      ['연관 규칙 수', ...[6, 10, 20, 30].map(n => 규칙수(n).toLocaleString('ko-KR'))],
    ]),
    폭 ? h('p', null, `▸ 내가 살펴본 상품 종류 수: ${폭.본.sort((a, b) => a - b).join(', ')} · 우산 문제(드문 항목을 품은 조합은 더 드물다): ${폭.퀴즈 === 0 ? '⭕' : '—'}`) : 안함('「Apriori › 왜 Apriori?」'),
    서술줄('최소지지도'),
    h('p', null, '▸ 트랜잭션 = 한 번의 거래(영수증) · 항목 집합 = 항목끼리의 조합 · k-항목 후보 집합 = 항목이 k 개인 집합. ',
      항 ? `가장 자주 함께 나온 2-항목 집합 {햄버거, 콜라} ${항.최고쌍 ? '⭕' : '—'} · 3-항목 집합의 최대 횟수 ${빈글(항.셋답)} ${항.셋맞음 ? '⭕' : ''}` : ''),
    h('h3', null, `🪜 단계별 빈번 집합 — 거래 ${거래.length}건 · 최소 지지도 ${최소}/${거래.length}${ap?.가지치기 ? ' · 가지치기 켬' : ''}`),
    h('p', { class: 'p-note' }, '거래: ' + 거래.map((t, i) => `${i + 1}{${t.join(',')}}`).join('  ')),
    ap && 본단계 ? 표(['단계', '후보 집합 (등장 횟수)', '빈번 집합'], 단계들.slice(0, 본단계).map(단 => [
      `C${단.k} → F${단.k}`,
      단.후보.map(c => `${집합글(c.집합)} ${c.횟수}${c.통과 ? '○' : '×'}${c.잘림 ? '✂' : ''}`).join('  '),
      단.빈번.map(f => 집합글(f.집합)).join(', ') || '없음'])) : 안함('「Apriori › 단계별 시뮬레이터」'),
    h('h3', null, '🍔 햄버거 가게 주문 10건의 연관 규칙'),
    표(['지표', '내 답', '정답'], 햄문항.map(([k, 글, 값]) => [글, `${빈글(햄?.입력?.[k])} ${햄?.입력?.[k] && 맞는수(햄.입력[k], 값) ? '⭕' : ''}`, 수글(값)])),
    h('p', { class: 'p-note' }, '햄버거 → 콜라 (선행 햄버거, 후행 콜라) 신뢰도 0.8 / 콜라 → 햄버거 신뢰도 0.571 — 같은 빈발 집합이라도 방향에 따라 신뢰도가 다르다. 향상도 1.143 > 1.'),
    서술줄('전략'));
}

// ───────────── 7쪽 확인 문제 · 핵심 정리 ─────────────
function 쪽7() {
  const 결과 = 기록.get('퀴즈', 확인문제.map(() => null));
  const 정 = 기록.get('정리', 정리빈칸.map(() => ''));
  return 쪽(7,
    제목('📝', `확인 문제 — 한 번에 맞힌 문제 ${결과.filter(x => x === true).length} / ${확인문제.length}`),
    표(['번', '물음', '결과', '정답 · 해설'], 확인문제.map((q, i) => [
      i + 1, q.물음,
      결과[i] === true ? '⭕' : 결과[i] === false ? '🔁' : '—',
      `${'①②③④⑤'[q.답]} ${q.보기[q.답]} — ${q.해설}`])),
    h('p', { class: 'p-note' }, '⭕ 한 번에 맞힘 · 🔁 다시 풀어 맞힘 · — 풀지 않음'),
    제목('🔑', '핵심 정리'),
    h('ol', null, 정리빈칸.map((b, i) => h('li', null, b.앞, h('b', { class: 정[i] === b.답 ? 'p-fill' : 'p-blank' }, 정[i] === b.답 ? b.답 : `( ${b.답} )`), b.뒤))),
    h('p', { class: 'p-note' }, '괄호 속 낱말은 앱에서 채우지 않은 빈칸의 답이다.'));
}

const PDF모양 = `
.p-wrap{position:fixed;left:-12000px;top:0;width:794px;font-family:'NanumSquareRound','Malgun Gothic','맑은 고딕','Apple SD Gothic Neo',sans-serif;color:#1f2433}
.p-page{width:794px;height:1123px;background:#fff;display:flex;flex-direction:column;box-sizing:border-box}
.p-head{display:flex;justify-content:space-between;align-items:center;padding:14px 40px;background:#6a3d9a;color:#fff;font-size:13px}
.p-head b{font-size:16px}
.p-body{flex:1;padding:14px 40px 6px;font-size:12.5px;line-height:1.5;overflow:hidden}
.p-body p{margin:4px 0}.p-body ul,.p-body ol{margin:3px 0;padding-left:20px}
.p-foot{display:flex;justify-content:space-between;padding:9px 40px;font-size:11px;color:#857d93;border-top:1px solid #e6ddef}
.p-h2{font-size:18px;color:#6a3d9a;margin:10px 0 5px;display:flex;gap:8px;align-items:center;border-bottom:2px solid #e2d4f0;padding-bottom:3px}
.p-h2 span{background:#6a3d9a;color:#fff;border-radius:8px;padding:0 8px;font-size:14px;min-width:22px;text-align:center}
.p-body h3{font-size:14px;margin:8px 0 3px}
.p-table{border-collapse:collapse;font-size:11.5px;margin:3px 0;width:100%}
.p-table th,.p-table td{border:1px solid #ddd5e6;padding:3px 6px;vertical-align:top}
.p-table th{background:#f2ecf8;white-space:nowrap}
.p-mtx{width:auto}.p-mtx td,.p-mtx th{text-align:center;min-width:44px}
.p-dash{color:#c5bfcf}.p-cell-ok{background:#e1f5e8;color:#145c33;font-weight:700}.p-cell-no{background:#fdf1e6;color:#a3530a}
.p-row{display:flex;gap:14px;align-items:flex-start}.p-col{flex:1;min-width:0}
.p-note{color:#5d6475;font-size:11.5px}
.p-none{background:#f4f4f4;border:1px dashed #bbb;border-radius:8px;padding:6px 10px;color:#888;margin:3px 0}
.p-grid2{display:grid;grid-template-columns:1fr 1fr;gap:2px 18px;font-size:12px}
.p-ok{color:#1e8e4e;font-weight:700}.p-no{color:#a0a6b0}.p-bad{color:#c0392b}
.p-tip{margin-top:12px;background:#fff6d6;border:1px solid #f0dd9a;border-radius:8px;padding:7px 12px}
.p-cover{text-align:center;padding:26px 0 14px;border-bottom:2px solid #e2d4f0;margin-bottom:6px}
.p-cart{font-size:46px}
.p-cover h1{font-size:32px;margin:8px 0 6px;color:#6a3d9a}
.p-sub{font-size:16px;color:#5d6475}.p-date{margin-top:10px;font-size:13.5px}
.p-name{margin-top:16px;font-size:15px;letter-spacing:1px}
.p-essay{border:1px solid #e2d4f0;border-radius:8px;padding:5px 9px;margin:5px 0;background:#fcfaff}
.p-q{font-weight:800;font-size:12.5px}
.p-mine{background:#fff;border:1px solid #ddd5e6;border-radius:6px;padding:4px 8px;margin:3px 0;white-space:pre-wrap}
.p-ex{font-size:11.5px;color:#4b3a63}.p-ex b{color:#6a3d9a}
.p-fill{color:#1e8e4e}.p-blank{color:#b36b00}`;

/** PDF 만들기 — 진행 알림(지금쪽, 전체쪽) 을 받아 막대를 채운다 */
export async function PDF만들기(진행, { 미리보기 = false } = {}) {
  const 모양 = h('style', null, PDF모양);
  const 틀 = h('div', { class: 'p-wrap' });
  document.head.append(모양);
  document.body.append(틀);
  try {
    const 만들개 = [쪽1, 쪽2, 쪽3, 쪽4, 쪽5, 쪽6, 쪽7];
    쪽수 = 만들개.length;
    const 쪽들 = 만들개.map(f => f());
    틀.append(...쪽들);
    await Promise.all([...틀.querySelectorAll('img')].map(img => (img.complete ? null : new Promise(r => { img.onload = img.onerror = r; }))));
    if (document.fonts?.ready) await document.fonts.ready;
    const 넘침 = 쪽들.map(p => { const b = p.querySelector('.p-body'); return b.scrollHeight - b.clientHeight; });
    if (미리보기 === '넘침') return { 넘침 };
    const 그림들 = [];
    const 문서 = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
    문서.setProperties({ title: '연관 분석 모델의 개념 — 학습 정리', author: '연관 분석 실험실 (© 2026 티쳐무)', subject: '데이터 과학 연관 분석' });
    for (let i = 0; i < 쪽들.length; i++) {
      const 캔버스 = await html2canvas(쪽들[i], { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
      if (i) 문서.addPage();
      const 자료 = 캔버스.toDataURL('image/jpeg', 0.9);
      그림들.push(자료);
      문서.addImage(자료, 'JPEG', 0, 0, 210, 297);
      진행?.(i + 1, 쪽들.length);
    }
    if (미리보기) return { 그림들, 크기: 문서.output('blob').size, 넘침 };   // 점검용: 파일로 저장하지 않는다
    문서.save('연관분석_학습정리.pdf');
  } finally {
    틀.remove(); 모양.remove();
  }
}
