/*! 연관 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유 */
// 화면을 만드는 작은 도구 모음 (외부 라이브러리 없이 DOM 을 만든다)
import { 기록 } from './store.js';

const SVGNS = 'http://www.w3.org/2000/svg';

function 속성넣기(el, a) {
  if (!a) return;
  for (const [k, v] of Object.entries(a)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.setAttribute('class', v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
}
function 자식넣기(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}

/** HTML 요소 만들기: h('div', {class:'x'}, '글자', 다른요소) */
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  속성넣기(el, attrs); 자식넣기(el, kids);
  return el;
}
/** SVG 요소 만들기 */
export function s(tag, attrs, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  속성넣기(el, attrs); 자식넣기(el, kids);
  return el;
}

/** 요소의 자식을 통째로 바꾼다 — null·false·배열을 알아서 걸러 준다 */
export function 채우기(el, ...kids) {
  el.replaceChildren();
  자식넣기(el, kids);
}

/** 피드백 상자에 글 넣기 — kind: ok / bad / info */
export function 알림(el, 글, kind = 'info') {
  el.className = 'fb ' + kind;
  el.innerHTML = 글;
}

/**
 * 한 화면(카드)의 수명 관리.
 * 카드를 떠날 때 타이머·이벤트를 한꺼번에 걷어 내야 쌓이지 않는다.
 */
export function 화면수명() {
  const 치울것 = [];
  return {
    interval(fn, ms) { const id = setInterval(fn, ms); 치울것.push(() => clearInterval(id)); return id; },
    timeout(fn, ms) { const id = setTimeout(fn, ms); 치울것.push(() => clearTimeout(id)); return id; },
    on(target, ev, fn, opt) { target.addEventListener(ev, fn, opt); 치울것.push(() => target.removeEventListener(ev, fn, opt)); },
    치우기(fn) { 치울것.push(fn); },
    끝() { while (치울것.length) { try { 치울것.pop()(); } catch { /* 무시 */ } } },
  };
}

/** 앱 안의 대화상자 (브라우저 기본 alert 대신). 꼭고르기: 바깥을 눌러 닫지 못하게 */
export function 대화상자(제목, 내용, 단추 = [{ 글: '닫기' }], { 꼭고르기 = false } = {}) {
  const 배경 = h('div', { class: 'modal-bg' });
  const 닫기 = () => 배경.remove();
  const 상자 = h('div', { class: 'modal' },
    h('h3', null, 제목),
    h('div', { class: 'modal-body' }, 내용),
    h('div', { class: 'modal-btns' }, 단추.map(b => h('button', {
      class: 'btn ' + (b.주 ? 'primary' : ''),
      onClick: () => { 닫기(); b.할일?.(); },
    }, b.글))),
  );
  배경.append(상자);
  if (!꼭고르기) 배경.addEventListener('click', e => { if (e.target === 배경) 닫기(); });
  document.getElementById('stage').append(배경);
  return 닫기;
}

/** 단추 여러 개 중 하나 고르기 (분절 단추) */
export function 고르기단추(목록, 처음, onPick, cls = '') {
  const 묶음 = h('div', { class: 'seg ' + cls });
  const 그리기 = 값 => { [...묶음.children].forEach((b, i) => b.classList.toggle('on', 목록[i].값 === 값)); };
  목록.forEach(항목 => 묶음.append(h('button', {
    class: 'seg-b', onClick: () => { 그리기(항목.값); onPick(항목.값); },
  }, 항목.글)));
  그리기(처음);
  묶음.설정 = 그리기;
  return 묶음;
}

/** 슬라이더 + 값 표시 */
export function 슬라이더({ 이름, min, max, step = 1, 값, 글 = v => v, onInput, onChange }) {
  const 표시 = h('b', null, 글(값));
  const 입력 = h('input', { type: 'range', min, max, step, value: 값 });
  입력.addEventListener('input', () => { 표시.textContent = 글(Number(입력.value)); onInput?.(Number(입력.value)); });
  입력.addEventListener('change', () => onChange?.(Number(입력.value)));
  const el = h('label', { class: 'slider' }, h('span', null, 이름, ' ', 표시), 입력);
  el.입력 = 입력;
  el.값 = v => { 입력.value = v; 표시.textContent = 글(v); };
  return el;
}

// ── 조사 붙이기 — 이름이 자료에서 오므로 문장을 미리 정할 수 없다(「을(를)」 처럼 쓰지 않는다) ──
// 알파벳은 읽는 소리로 가른다: L·M·N·R 만 받침이 있다(엘·엠·엔·알). 숫자도 읽는 소리(1 일, 3 삼, 6 육, 7 칠, 8 팔, 0 영).
export function 받침(단어) {
  const c = String(단어).replace(/[\s)\]}'"」』]+$/, '').slice(-1);
  const k = c.charCodeAt(0);
  if (k >= 0xac00 && k <= 0xd7a3) { const j = (k - 0xac00) % 28; return j === 0 ? 0 : j === 8 ? 'ㄹ' : 1; }
  if (/[LMNR]/i.test(c)) return /[L]/i.test(c) ? 'ㄹ' : 1;
  if (/[13678]/.test(c)) return /[178]/.test(c) ? 'ㄹ' : 1;
  if (/0/.test(c)) return 1;
  return 0;
}
export const 을 = w => w + (받침(w) ? '을' : '를');
export const 이 = w => w + (받침(w) ? '이' : '가');
export const 은 = w => w + (받침(w) ? '은' : '는');
export const 과 = w => w + (받침(w) ? '과' : '와');
export const 으로 = w => w + (받침(w) && 받침(w) !== 'ㄹ' ? '으로' : '로');

/** 글자 답 비교용 — 띄어쓰기·문장 부호를 빼고 견준다 */
export const 다듬기 = t => String(t ?? '').replace(/[\s.,·()「」'"!?~]/g, '').toLowerCase();
/** 띄어쓰기를 뺀 글자 수 */
export const 글자수 = t => String(t ?? '').replace(/\s/g, '').length;

/**
 * 서술형 칸 — 띄어쓰기 빼고 10글자(힌트글자) 이상 쓰면 그 아래에 예시 답이 힌트로 열린다.
 * 쓴 글은 기록의 「서술.키」 에 바로 남는다(PDF 가 읽는다).
 *  { 키, 물음, 예시, 줄 = 3, 힌트글자 = 10, 다씀: () => {} }
 */
export function 서술칸({ 키, 물음, 예시, 줄 = 3, 힌트글자 = 10, 다씀, 작게 = false }) {
  const 쓴글 = 기록.get('서술', {})[키] || '';
  const 칸 = h('textarea', { class: 'note', rows: 줄, placeholder: '여기에 내 생각을 써 보세요.', 'aria-label': 물음 });
  칸.value = 쓴글;
  const 셈 = h('span', { class: 'ex-count' });
  const 예시칸 = h('div', { class: 'ex-hint' }, h('b', null, '💡 예시 답 '), h('span', null, 예시));
  const 열림 = () => 글자수(칸.value) >= 힌트글자;
  function 새로() {
    const n = 글자수(칸.value);
    const 열 = n >= 힌트글자;
    예시칸.classList.toggle('on', 열);
    셈.textContent = 열 ? `✔ ${n}글자 — 아래 예시 답과 견주어 보세요` : `${n}/${힌트글자}글자 — ${힌트글자}글자 이상 쓰면 예시 답이 열려요`;
    셈.classList.toggle('ok', 열);
  }
  칸.addEventListener('input', () => {
    const 모두 = { ...기록.get('서술', {}) };
    모두[키] = 칸.value;
    기록.set('서술', 모두);
    새로();
    if (열림()) 다씀?.();
  });
  새로();
  if (열림()) queueMicrotask(() => 다씀?.());
  return h('div', { class: 'essay' + (작게 ? ' sm' : '') },
    물음 ? h('div', { class: 'essay-q' }, '✍️ ', 물음) : null,
    칸, 셈, 예시칸);
}
