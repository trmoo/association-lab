/*! 연관 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  학교 수업 목적으로만 이용해 주세요. 무단 배포·상업적 이용을 금합니다. */
// 앱의 뼈대 — 1280×720 무대를 창 크기에 맞춰 늘이고 줄인다(스크롤 없음).
// 탭(대단원) → 카드(화면 하나 = 활동 하나) 차례로 넘긴다.
import './style.css';
import { h, 화면수명, 대화상자 } from './lib/ui.js';
import { 이어하기저장, 시작확인 } from './lib/resume.js';
import { 기록 } from './lib/store.js';
import { 탭들 } from './tabs/index.js';

const 무대 = document.getElementById('stage');
const 뿌리 = document.documentElement;

// ── 무대 크기 맞추기 ──
// 무대는 언제나 창을 꽉 채운다 — 위아래·좌우에 검은 띠를 남기지 않는다(화면 분할로 창 비율이 바뀌어도).
//  · 배율 = 1280×720 이 창에 다 들어가는 크기. 남는 쪽(세로나 가로)은 무대를 그만큼 더 길게 늘여 채운다.
//  · 세로로 긴 창(화면을 좌우로 나눈 경우 등)은 너비 1280 을 지키고 높이만 늘린다 — 칸은 나란히 두고 늘어난 높이를 그래프 칸이 나눠 갖는다(html.tall).
//  · 휴대폰 세로 화면은 줄이지 않고 화면 너비 그대로 두어 페이지를 세로로 스크롤한다(html.phone).
// ⚠ 폰 판정은 innerWidth 가 아니라 clientWidth — 1280 무대가 깔려 있으면 휴대폰 브라우저가 페이지를 축소해
//   innerWidth 가 1280 으로 나온다. clientWidth 는 기기 너비(예: 390)를 그대로 준다.
const 폰인가 = () => { const { clientWidth: w, clientHeight: hh } = 뿌리; return w < hh && w <= 820; };
function 맞추기() {
  const 폰 = 폰인가();
  뿌리.classList.toggle('phone', 폰);
  if (폰 && 할일줄.parentElement?.classList.contains('subbar')) 무대.querySelector('.foot')?.before(할일줄);
  if (!폰 && 할일줄.parentElement && !할일줄.parentElement.classList.contains('subbar')) 뒤단추.before(할일줄);
  if (폰) {
    for (const k of ['width', 'height', 'transform', 'left', 'top']) 무대.style[k] = '';
    뿌리.classList.remove('tall', 'wide');
    return;
  }
  const W = 뿌리.clientWidth || innerWidth, H = 뿌리.clientHeight || innerHeight;
  // 세로로 긴 창이면 무대 너비를 1280 → 1120 까지 줄여 글자를 키운다(늘어난 높이가 줄바꿈을 받아 준다)
  const 기준폭 = H / W > 0.95 ? 1120 : 1280;
  const 배율 = Math.min(W / 기준폭, H / 720);
  const 폭 = W / 배율, 높이 = H / 배율;
  무대.style.width = 폭 + 'px';
  무대.style.height = 높이 + 'px';
  무대.style.transform = `scale(${배율})`;
  무대.style.left = '0px';
  무대.style.top = '0px';
  뿌리.classList.toggle('tall', 높이 >= 1000);     // 세로로 긴 창 — 글자를 조금 키운다
  뿌리.classList.toggle('wide', 폭 >= 1560);       // 가로로 긴 창 — 내용은 가운데에 모으고 바탕만 넓힌다
}
addEventListener('resize', 맞추기);

// ── 틀 만들기 ──
const 탭줄 = h('nav', { class: 'tabs' });
const 카드줄 = h('nav', { class: 'cards' });
const 본문 = h('main', { class: 'area' });
const 앞단추 = h('button', { class: 'nav-btn', title: '이전 (←)', 'aria-label': '이전 카드', onClick: () => 넘기기(-1) }, '◀');
const 뒤단추 = h('button', { class: 'nav-btn', title: '다음 (→)', 'aria-label': '다음 카드', onClick: () => 넘기기(1) }, '▶');
const 이어단추 = h('button', { class: 'btn sm sub-act', title: '지금까지 한 활동을 HTML 파일로 내려받아요', onClick: () => 이어하기저장(location.hash) }, '💾 다음 시간에 이어하기');
const 완료단추 = h('button', { class: 'btn sm primary sub-act', title: '전체 학습 내용을 PDF 로 내려받아요', onClick: () => 완료하기() }, '🏁 실험실 완료');
const 지우기단추 = h('button', {
  class: 'foot-clear', title: '이 컴퓨터에 남은 활동 기록을 모두 지워요 (다른 반 수업 전에)',
  onClick: () => 대화상자('🧹 활동 기록을 모두 지울까요?',
    '이 컴퓨터에 남은 활동 기록(내가 쓴 답·계산·확인 문제·완료 표시)이 모두 지워지고 처음 화면으로 돌아가요. 다른 반 수업이나 다음 학생이 쓰기 전에 누르세요. 되돌릴 수 없어요.', [
      { 글: '그만두기' },
      { 글: '모두 지우기', 주: true, 할일: () => { 기록.지우기(); location.hash = '#open/shop'; location.reload(); } }]),
}, '🧹 내 기록 모두 지우기');
const 할일줄 = h('div', { class: 'sub-acts' }, 이어단추, 완료단추);
무대.append(
  h('header', { class: 'top' },
    h('div', { class: 'brand' }, h('span', { class: 'cart' }, '🛒'), '연관 분석 실험실'),
    탭줄),
  h('div', { class: 'subbar' }, 앞단추, 카드줄, 할일줄, 뒤단추),
  본문,
  h('footer', { class: 'foot' },
    h('span', null, '「데이터 과학」 연관 분석 모델의 개념 · ← → 키로 넘기기'),
    지우기단추,
    h('span', null, '© 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요')),
);

let 지금 = { 탭: 0, 카드: 0 };
let 수명 = null;

function 그리기() {
  const 탭 = 탭들[지금.탭], 카드 = 탭.카드[지금.카드];
  탭줄.replaceChildren(...탭들.map((t, i) => h('button', {
    class: 'tab' + (i === 지금.탭 ? ' on' : ''), onClick: () => 가기(i, 0),
  }, h('span', { class: 'tab-ico' }, t.아이콘), h('span', { class: 'tab-name' }, t.이름))));
  카드줄.replaceChildren(...탭.카드.map((c, i) => h('button', {
    class: 'pill' + (i === 지금.카드 ? ' on' : '') + (기록.완료됨(`${탭.id}/${c.id}`) ? ' done' : ''),
    onClick: () => 가기(지금.탭, i),
  }, `${i + 1}. ${c.제목}`)));
  requestAnimationFrame(() => {
    // 휴대폰에서는 탭·카드 줄이 옆으로 밀리므로 지금 고른 것이 보이게 끌어 온다
    for (const el of [탭줄.querySelector('.tab.on'), 카드줄.querySelector('.pill.on')]) {
      if (!el) continue;
      const 줄 = el.parentElement, 칸 = el.getBoundingClientRect(), 판 = 줄.getBoundingClientRect();
      if (줄.scrollWidth > 줄.clientWidth) 줄.scrollLeft += (칸.left + 칸.width / 2) - (판.left + 판.width / 2);
    }
    if (뿌리.classList.contains('phone')) scrollTo(0, 0);
  });
  앞단추.disabled = 지금.탭 === 0 && 지금.카드 === 0;
  뒤단추.disabled = 지금.탭 === 탭들.length - 1 && 지금.카드 === 탭.카드.length - 1;
  // 카드 본문 — 앞 화면의 타이머·이벤트를 먼저 걷어 낸다
  수명?.끝();
  수명 = 화면수명();
  const 틀 = h('section', { class: 'card', 'data-card': `${탭.id}/${카드.id}` });
  본문.replaceChildren(틀);
  try {
    카드.그리기(틀, 수명, { 완료: () => { 기록.완료(`${탭.id}/${카드.id}`); 카드줄그리기(); } });
  } catch (e) {
    틀.replaceChildren(h('div', { class: 'fb bad' }, '화면을 그리다가 문제가 생겼어요: ' + e.message));
    console.error(e);
  }
}
function 카드줄그리기() {
  const 탭 = 탭들[지금.탭];
  [...카드줄.children].forEach((b, i) => b.classList.toggle('done', 기록.완료됨(`${탭.id}/${탭.카드[i].id}`)));
}

function 가기(탭, 카드) {
  지금 = { 탭, 카드 };
  const 주소 = `#${탭들[탭].id}/${탭들[탭].카드[카드].id}`;
  if (location.hash !== 주소) history.replaceState(null, '', 주소);
  기록.위치(주소);
  그리기();
}
function 넘기기(방향) {
  let { 탭, 카드 } = 지금;
  카드 += 방향;
  if (카드 < 0) { if (탭 === 0) return; 탭--; 카드 = 탭들[탭].카드.length - 1; }
  else if (카드 >= 탭들[탭].카드.length) { if (탭 === 탭들.length - 1) return; 탭++; 카드 = 0; }
  가기(탭, 카드);
}
function 주소읽기() {
  const [t, c] = location.hash.slice(1).split('/');
  const ti = Math.max(0, 탭들.findIndex(x => x.id === t));
  const ci = Math.max(0, 탭들[ti].카드.findIndex(x => x.id === c));
  지금 = { 탭: ti, 카드: ci };
}

addEventListener('keydown', e => {
  if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
  if (document.querySelector('.modal-bg')) return;
  if (e.key === 'ArrowRight') 넘기기(1);
  if (e.key === 'ArrowLeft') 넘기기(-1);
});
addEventListener('hashchange', () => { 주소읽기(); 기록.위치(location.hash); 그리기(); });

/** 「실험실 완료」 — 덜 한 활동이 있으면 알려 주고, 전체 학습 내용을 PDF 로 내려받는다 */
export function 완료하기(진행단추 = 완료단추) {
  const 전부 = 탭들.flatMap(t => t.카드.filter(c => c.id !== 'pdf').map(c => ({ 글: `${t.이름} · ${c.제목}`, 끝: 기록.완료됨(`${t.id}/${c.id}`) })));
  const 남음 = 전부.filter(x => !x.끝);
  const 원래글 = 진행단추.textContent;
  const 만들기 = async () => {
    진행단추.disabled = true; 진행단추.textContent = '⏳ PDF 만드는 중…';
    try {
      const { PDF만들기 } = await import('./pdf.js');
      await PDF만들기((지금쪽, 전체쪽) => { 진행단추.textContent = `⏳ PDF 만드는 중… ${지금쪽}/${전체쪽}`; });
      기록.완료('wrap/pdf'); 기록.비상지우기(); 카드줄그리기();
      대화상자('🎉 연관 분석 실험실 완료!', h('div', { html: '「연관분석_학습정리.pdf」 를 내려받았어요. 내가 한 활동이 모두 담겨 있어요.<br>브라우저의 <b>내려받기 폴더</b>를 확인하세요.<br><span class="muted">다음 학생을 위해 이 컴퓨터에 남겨 둔 비상 기록은 지웠어요(이 창을 닫기 전까지는 그대로 볼 수 있어요).</span>' }));
    } catch (e) {
      console.error(e);
      대화상자('😢 PDF 를 만들지 못했어요', e.message);
    } finally { 진행단추.disabled = false; 진행단추.textContent = 원래글; }
  };
  if (!남음.length) { 만들기(); return; }
  대화상자(`아직 ${남음.length}개 활동이 남았어요`,
    h('div', null,
      h('p', { style: { margin: '0 0 6px' } }, '하지 않은 활동은 PDF 에 「아직 하지 않은 활동」으로 찍혀요.'),
      h('div', { class: 'muted', style: { fontSize: '14px', maxHeight: '220px', overflow: 'auto' } }, 남음.map(x => h('div', null, '○ ' + x.글)))),
    [{ 글: '돌아가서 마저 하기' }, { 글: '그래도 PDF 만들기', 주: true, 할일: 만들기 }]);
}
globalThis.__연관완료 = 완료하기;   // 정리 탭의 PDF 카드가 같은 흐름을 쓴다

맞추기();
주소읽기();
기록.위치(location.hash);
그리기();
// 실수로 창을 닫았다 다시 열었거나 「다음 시간에 이어하기」 파일을 열었으면 지난 기록을 불러올지 묻는다
시작확인(주소 => { location.hash = 주소 || location.hash; 주소읽기(); 그리기(); });
