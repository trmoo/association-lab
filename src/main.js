/*! 연관 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  학교 수업 목적으로만 이용해 주세요. 무단 배포·상업적 이용을 금합니다. */
// 앱의 뼈대 — 1280×720 무대를 창 크기에 맞춰 늘이고 줄인다(스크롤 없음).
// 입장 페이지에서 차시를 고르면 → 그 차시의 탭(대단원) → 카드(화면 하나 = 활동 하나) 차례로 넘긴다.
import './style.css';
import { h, 채우기, 화면수명, 대화상자 } from './lib/ui.js';
import { 이어하기저장, 시작확인 } from './lib/resume.js';
import { 기록 } from './lib/store.js';
import { 탭들 } from './tabs/index.js';
import { 차시들, 차시보기, 차시찾기 } from './sessions.js';

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
const 차시칩 = h('button', { class: 'session-chip', title: '입장 페이지로 돌아가 차시를 다시 골라요', onClick: () => 입장으로() });
const 앞단추 = h('button', { class: 'nav-btn', title: '이전 (←)', 'aria-label': '이전 카드', onClick: () => 넘기기(-1) }, '◀');
const 뒤단추 = h('button', { class: 'nav-btn', title: '다음 (→)', 'aria-label': '다음 카드', onClick: () => 넘기기(1) }, '▶');
const 이어단추 = h('button', { class: 'btn sm sub-act', title: '지금까지 한 활동을 HTML 파일로 내려받아요', onClick: () => 이어하기저장(location.hash) }, '💾 다음 시간에 이어하기');
const 완료단추 = h('button', { class: 'btn sm primary sub-act', title: '전체 학습 내용을 PDF 로 내려받아요', onClick: () => 완료하기() }, '🏁 실험실 완료');
const 지우기단추 = h('button', {
  class: 'foot-clear', title: '이 컴퓨터에 남은 활동 기록을 모두 지워요 (다른 반 수업 전에)',
  onClick: () => 대화상자('🧹 활동 기록을 모두 지울까요?',
    '이 컴퓨터에 남은 활동 기록(내가 쓴 답·계산·확인 문제·완료 표시)이 모두 지워지고 처음 화면(입장 페이지)으로 돌아가요. 다른 반 수업이나 다음 학생이 쓰기 전에 누르세요. 되돌릴 수 없어요.', [
      { 글: '그만두기' },
      { 글: '모두 지우기', 주: true, 할일: () => { 기록.지우기(); history.replaceState(null, '', location.pathname + location.search); location.reload(); } }]),
}, '🧹 내 기록 모두 지우기');
const 할일줄 = h('div', { class: 'sub-acts' }, 이어단추, 완료단추);
무대.append(
  h('header', { class: 'top' },
    h('button', { class: 'brand', title: '입장 페이지', onClick: () => 입장으로() }, h('span', { class: 'cart' }, '🛒'), '연관 분석 실험실'),
    차시칩,
    탭줄),
  h('div', { class: 'subbar' }, 앞단추, 카드줄, 할일줄, 뒤단추),
  본문,
  h('footer', { class: 'foot' },
    h('span', null, '「데이터 과학」 연관 분석 모델의 개념 · ← → 키로 넘기기'),
    지우기단추,
    h('span', null, '© 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요')),
);

// 차시 0 = 입장 페이지. 탭·카드 번호는 그 차시에 보이는 것(보기) 안에서 센다.
let 지금 = { 차시: 0, 탭: 0, 카드: 0 };
let 보기 = [];
let 수명 = null;

const 열쇠 = (탭, 카드) => `${탭.id}/${카드.id}`;
/** 차시마다 할 활동 — 「PDF 내려받기」 카드는 활동이 아니라 마무리라 세지 않는다 */
const 활동들 = 번호 => 차시보기(탭들, 번호).flatMap(v => v.카드.filter(c => c.id !== 'pdf').map(c => ({ 탭: v.탭, 카드: c, 열쇠: 열쇠(v.탭, c) })));

function 그리기() {
  수명?.끝();
  수명 = 화면수명();
  뿌리.classList.toggle('entry', 지금.차시 === 0);
  if (지금.차시 === 0) { 입장그리기(); return; }

  const 칸 = 보기[지금.탭], 카드 = 칸.카드[지금.카드];
  채우기(차시칩, h('b', null, `${지금.차시}차시`), h('span', null, '↩ 차시 고르기'));
  채우기(탭줄, 보기.map((v, i) => h('button', {
    class: 'tab' + (i === 지금.탭 ? ' on' : ''), onClick: () => 가기(i, 0),
  }, h('span', { class: 'tab-ico' }, v.탭.아이콘), h('span', { class: 'tab-name' }, v.탭.이름))));
  채우기(카드줄, 칸.카드.map((c, i) => h('button', {
    class: 'pill' + (i === 지금.카드 ? ' on' : '') + (기록.완료됨(열쇠(칸.탭, c)) ? ' done' : ''),
    onClick: () => 가기(지금.탭, i),
  }, `${i + 1}. ${c.제목}`)));
  // 1차시에는 PDF 를 받지 않는다 — 1차시가 끝나면 「다음 시간에 이어하기」 로 기록을 들고 2차시로 간다
  완료단추.style.display = 지금.차시 === 1 ? 'none' : '';
  requestAnimationFrame(() => {
    // 휴대폰에서는 탭·카드 줄이 옆으로 밀리므로 지금 고른 것이 보이게 끌어 온다
    for (const el of [탭줄.querySelector('.tab.on'), 카드줄.querySelector('.pill.on')]) {
      if (!el) continue;
      const 줄 = el.parentElement, 위치 = el.getBoundingClientRect(), 판 = 줄.getBoundingClientRect();
      if (줄.scrollWidth > 줄.clientWidth) 줄.scrollLeft += (위치.left + 위치.width / 2) - (판.left + 판.width / 2);
    }
    if (뿌리.classList.contains('phone')) scrollTo(0, 0);
  });
  const 마지막 = 지금.탭 === 보기.length - 1 && 지금.카드 === 칸.카드.length - 1;
  앞단추.disabled = 지금.탭 === 0 && 지금.카드 === 0;
  뒤단추.disabled = 마지막 && 지금.차시 === 차시들.length;   // 1차시 마지막 카드의 ▶ 는 「1차시 끝」 안내를 연다
  뒤단추.title = 마지막 && 지금.차시 < 차시들.length ? `${지금.차시}차시 마치기` : '다음 (→)';
  // 카드 본문 — 앞 화면의 타이머·이벤트는 위에서 걷어 냈다
  const 틀 = h('section', { class: 'card', 'data-card': 열쇠(칸.탭, 카드) });
  채우기(본문, 틀);
  try {
    카드.그리기(틀, 수명, { 완료: () => { 기록.완료(열쇠(칸.탭, 카드)); 카드줄그리기(); } });
  } catch (e) {
    채우기(틀, h('div', { class: 'fb bad' }, '화면을 그리다가 문제가 생겼어요: ' + e.message));
    console.error(e);
  }
}
function 카드줄그리기() {
  if (!지금.차시) return;
  const 칸 = 보기[지금.탭];
  [...카드줄.children].forEach((b, i) => b.classList.toggle('done', 기록.완료됨(열쇠(칸.탭, 칸.카드[i]))));
}

// ── 입장 페이지 — 차시 고르기 ──
function 입장그리기() {
  채우기(탭줄);
  채우기(차시칩);
  const 카드들 = 차시들.map(s => {
    const 목록 = 활동들(s.번호);
    const 마친 = 목록.filter(x => 기록.완료됨(x.열쇠)).length;
    const 시작 = 마친 === 0 ? `▶ ${s.번호}차시 시작하기` : 마친 === 목록.length ? `↺ ${s.번호}차시 다시 보기` : `▶ ${s.번호}차시 이어서 하기`;
    return h('div', { class: 'entry-card s' + s.번호 },
      h('div', { class: 'entry-num' }, `${s.번호}차시`),
      h('h2', null, s.제목),
      h('div', { class: 'entry-goal' }, '🎯 ', s.목표),
      h('ul', { class: 'entry-list' }, 차시보기(탭들, s.번호).map(v => h('li', null,
        h('b', null, `${v.탭.아이콘} ${v.탭.이름}`),
        h('span', null, v.카드.map(c => c.제목).join(' · '))))),
      h('div', { class: 'entry-prog' },
        h('div', { class: 'meter' }, h('i', { style: { width: (마친 / 목록.length) * 100 + '%' } })),
        h('span', null, `활동 ${마친} / ${목록.length}`)),
      h('button', { class: 'btn primary entry-go', onClick: () => 차시시작(s.번호) }, 시작));
  });
  채우기(본문, h('section', { class: 'card entry' },
    h('div', { class: 'entry-head' },
      h('h1', null, '🛒 연관 분석 실험실'),
      h('p', null, '「데이터 과학」 연관 분석 모델의 개념 — 오늘 할 차시를 고르세요.')),
    h('div', { class: 'entry-cards' }, 카드들),
    h('div', { class: 'tip entry-tip', html:
      '💾 <b>1차시를 마치면</b> 위쪽의 [다음 시간에 이어하기] 로 파일을 받아 두세요. ' +
      '2차시에 그 파일을 열면 1차시 기록이 이어져, 마지막에 <b>두 차시를 모두 담은 PDF</b> 를 받을 수 있어요.' })));
}

/** 그 차시에서 아직 안 한 첫 카드로 — 다 했으면 첫 카드로 */
function 차시시작(번호) {
  const 목록 = 활동들(번호);
  const 다음 = 목록.find(x => !기록.완료됨(x.열쇠)) || 목록[0];
  location.hash = `#${다음.열쇠}`;
}
function 입장으로() { if (location.hash !== '#start') location.hash = '#start'; else { 주소읽기(); 그리기(); } }

function 가기(탭, 카드) {
  지금 = { 차시: 지금.차시, 탭, 카드 };
  const 주소 = `#${열쇠(보기[탭].탭, 보기[탭].카드[카드])}`;
  if (location.hash !== 주소) history.replaceState(null, '', 주소);
  기록.위치(주소);
  그리기();
}
function 넘기기(방향) {
  if (!지금.차시) return;
  let { 탭, 카드 } = 지금;
  카드 += 방향;
  if (카드 < 0) { if (탭 === 0) return; 탭--; 카드 = 보기[탭].카드.length - 1; }
  else if (카드 >= 보기[탭].카드.length) {
    if (탭 === 보기.length - 1) { if (지금.차시 < 차시들.length) 차시끝(); return; }
    탭++; 카드 = 0;
  }
  가기(탭, 카드);
}
/** 1차시 마지막 카드에서 ▶ — 기록을 들고 다음 차시로 가는 길을 알려 준다 */
function 차시끝() {
  const 번호 = 지금.차시, 목록 = 활동들(번호);
  const 남음 = 목록.filter(x => !기록.완료됨(x.열쇠)).length;
  대화상자(`🎉 ${번호}차시 끝!`,
    h('div', { html:
      (남음 ? `아직 끝내지 않은 활동이 <b>${남음}개</b> 있어요. 위쪽 카드 줄에서 ✔ 가 없는 카드를 찾아보세요.<br><br>` : `${번호}차시 활동을 모두 마쳤어요.<br><br>`) +
      `다음 시간에 이어서 하려면 <b>💾 이어하기 파일</b>을 받아 두세요. ${번호 + 1}차시에 그 파일을 열면 지금까지의 기록이 이어져요.` }),
    [
      { 글: '닫기' },
      { 글: `${번호 + 1}차시로 가기`, 할일: () => 차시시작(번호 + 1) },
      // 받은 파일을 다음 시간에 열면 입장 페이지에서 시작한다 — 두 차시의 진행 막대를 보고 다음 차시를 고른다
      { 글: '💾 이어하기 파일 받기', 주: true, 할일: () => 이어하기저장('#start') },
    ]);
}
function 주소읽기() {
  const [t, c] = location.hash.slice(1).split('/');
  const 번호 = 차시찾기(탭들, t, c);
  if (!번호) { 지금 = { 차시: 0, 탭: 0, 카드: 0 }; 보기 = []; return; }
  보기 = 차시보기(탭들, 번호);
  const ti = Math.max(0, 보기.findIndex(v => v.탭.id === t));
  const ci = Math.max(0, 보기[ti].카드.findIndex(x => x.id === c));
  지금 = { 차시: 번호, 탭: ti, 카드: ci };
}

addEventListener('keydown', e => {
  if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
  if (document.querySelector('.modal-bg')) return;
  if (e.key === 'ArrowRight') 넘기기(1);
  if (e.key === 'ArrowLeft') 넘기기(-1);
});
addEventListener('hashchange', () => { 주소읽기(); 기록.위치(location.hash); 그리기(); });

/** 「실험실 완료」 — 덜 한 활동이 있으면 알려 주고, 전체 학습 내용(두 차시)을 PDF 로 내려받는다 */
export function 완료하기(진행단추 = 완료단추) {
  const 전부 = 차시들.flatMap(s => 활동들(s.번호).map(x => ({ 글: `${s.번호}차시 · ${x.탭.이름} · ${x.카드.제목}`, 끝: 기록.완료됨(x.열쇠) })));
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
      h('p', { style: { margin: '0 0 6px' } }, '하지 않은 활동은 PDF 에 「아직 하지 않은 활동」으로 찍혀요. 1차시 기록은 1차시에 받은 「이어하기 파일」을 열면 이어져요.'),
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
