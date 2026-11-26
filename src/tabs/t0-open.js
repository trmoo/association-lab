/*! 연관 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유 */
// 탭 1 생각 열기 — 추천의 비밀 · 연관 분석이란? · 어디에 쓰일까? · 연관 규칙의 표현
import { h, 채우기, 알림, 서술칸, 다듬기, 대화상자, 을, 이 } from '../lib/ui.js';
import { 기록 } from '../lib/store.js';
import { 추천, 세기, 수글 } from '../lib/assoc.js';
import { 영수증들 } from '../lib/views.js';
import { 쇼핑몰, 그림, 궁금증, 정의빈칸, 사례, 규칙문장 as 문장문제, 서술, 힌트글자 } from '../data.js';

const 퍼센트 = v => Math.round(v * 100) + '%';
const 칩글 = x => (그림[x] ? 그림[x] + ' ' : '') + x;

// ───────────────────────── 1. 추천의 비밀 (가상 쇼핑몰) ─────────────────────────
function 추천의비밀(el, 수명, 도구) {
  const 상태 = 기록.get('추천', { 장바구니: [], 담아본: [] });
  const 저장 = () => 기록.set('추천', 상태);
  const 진열 = h('div', { class: 'prods' });
  const 장바구니칸 = h('div', { class: 'row', style: { minHeight: '34px' } });
  const 추천칸 = h('div', { class: 'col', style: { gap: '6px' } });
  const 근거칸 = h('div', { class: 'tip small' });
  const 거래 = 쇼핑몰.거래, N = 거래.length;
  let 끝냄 = false;
  const 끝확인 = () => {
    const 글 = (기록.get('서술', {}).추천 || '').replace(/\s/g, '');
    if (!끝냄 && 상태.담아본.length >= 3 && 글.length >= 힌트글자) { 끝냄 = true; 도구.완료(); }
  };

  function 담기(x) {
    const i = 상태.장바구니.indexOf(x);
    if (i >= 0) 상태.장바구니.splice(i, 1);
    else { 상태.장바구니.push(x); if (!상태.담아본.includes(x)) 상태.담아본.push(x); }
    저장(); 그리기(); 끝확인();
  }

  function 그리기() {
    const 결과 = 추천(거래, 쇼핑몰.품목, 상태.장바구니);
    const 윗셋 = 결과.목록.slice(0, 3);
    채우기(진열, 쇼핑몰.품목.map(x => h('button', {
      class: 'prod' + (상태.장바구니.includes(x) ? ' in' : '') + (윗셋.some(r => r.상품 === x) ? ' reco' : ''),
      onClick: () => 담기(x), title: 상태.장바구니.includes(x) ? '장바구니에서 빼기' : '장바구니에 담기',
    }, h('span', { class: 'em' }, 그림[x]), h('span', { class: 'nm' }, x), h('span', { class: 'pr' }, 쇼핑몰.가격[x] + '원'))));
    채우기(장바구니칸, 상태.장바구니.length
      ? 상태.장바구니.map(x => h('button', { class: 'chip on', onClick: () => 담기(x), title: '빼기' }, 칩글(x), ' ✕'))
      : h('span', { class: 'muted' }, '아직 비어 있어요. 왼쪽 상품을 눌러 담아 보세요.'));
    if (!상태.장바구니.length) {
      채우기(추천칸, h('div', { class: 'muted' }, '상품을 담으면 여기에 「함께 사면 좋은 상품」 이 떠요.'));
      채우기(근거칸, '💡 상품을 여러 가지로 바꿔 담아 보며, 추천이 무엇을 보고 바뀌는지 찾아보세요.');
      return;
    }
    채우기(추천칸, 윗셋.length
      ? 윗셋.map((r, k) => h('button', { class: 'reco-row', style: { border: 'none', textAlign: 'left' }, onClick: () => 담기(r.상품), title: '눌러서 담기' },
        h('span', { class: 'em' }, 그림[r.상품]),
        h('span', null, h('b', null, `${k + 1}. ${r.상품}`), h('div', { class: 'meter' }, h('i', { style: { width: 퍼센트(r.신뢰도) } }))),
        h('b', { style: { textAlign: 'right', color: 'var(--brand)' } }, 퍼센트(r.신뢰도))))
      : h('div', { class: 'muted' }, '함께 산 상품이 없어요.'));
    const 첫 = 윗셋[0];
    const 기준글 = 결과.기준.join('·');
    const 인기 = 쇼핑몰.품목.filter(x => !상태.장바구니.includes(x)).map(x => [x, 세기(거래, [x])]).sort((p, q) => q[1] - p[1]).slice(0, 3);
    // 조사는 이름에 맞춰 고른다 (스마트폰이 / 카메라가)
    const 기준꼴 = 결과.기준.length > 1 ? `「${기준글}」${을(기준글).slice(기준글.length)} 모두 담은` : `「${기준글}」${이(기준글).slice(기준글.length)} 든`;
    채우기(근거칸,
      결과.대신 ? h('div', { style: { color: '#9a5b00', marginBottom: '3px' } }, `⚠ 담은 상품을 모두 함께 산 주문이 없어서, 마지막에 담은 「${결과.기준[0]}」 하나로만 찾았어요.`) : null,
      첫 ? h('div', { html: `📊 <b>근거</b> — 주문 ${N}건 가운데 ${기준꼴} 주문은 <b>${결과.기준수}건</b>, 그중 <b>${첫.함께}건</b>에 「${첫.상품}」도 있었어요 → ${첫.함께} ÷ ${결과.기준수} = <b>${퍼센트(첫.신뢰도)}</b>` }) : null,
      h('div', { class: 'muted', style: { marginTop: '3px' } }, `참고: 그냥 가장 많이 팔린 상품은 ${인기.map(([x, n]) => `${x}(${n}건)`).join(', ')} — 추천 차례와 같나요?`));
  }

  const 기록보기 = () => 대화상자(`📋 ${쇼핑몰.이름}`,
    h('div', null,
      h('p', { class: 'muted', style: { margin: '0 0 6px' } }, 상태.장바구니.length ? '파랑 = 장바구니에 담은 상품, 초록 테두리 = 담은 상품이 모두 든 주문' : '상품을 담으면 그 상품이 든 주문이 칠해져요.'),
      영수증들(거래, { A: 상태.장바구니, 열: 4, 흐리게: 상태.장바구니.length ? 'none' : null })));

  el.append(h('div', { class: 'split' },
    h('div', { class: 'col', style: { flex: '1.35' } },
      h('h2', null, '🛒 추천의 비밀 — 쇼핑몰은 어떻게 알았을까?'),
      h('p', { class: 'lead' }, '「별빛 마켓」에서 상품을 눌러 장바구니에 담아 보세요. 오른쪽 추천이 어떻게 바뀌는지 살펴봅니다.'),
      h('div', { class: 'panel fill' }, 진열,
        h('div', { class: 'row', style: { marginTop: 'auto' } },
          h('button', { class: 'btn sm', onClick: 기록보기 }, `📋 다른 손님들의 주문 기록 ${N}건 보기`),
          h('span', { class: 'muted' }, '추천은 이 기록에서 나와요.')))),
    h('div', { class: 'col', style: { flex: '1' } },
      h('div', { class: 'panel' }, h('h3', null, '🧺 내 장바구니'), 장바구니칸),
      h('div', { class: 'panel' }, h('h3', null, '🎯 이 상품을 담은 손님이 함께 산 상품'), 추천칸),
      근거칸,
      서술칸({ 키: '추천', ...서술.추천, 줄: 2, 힌트글자, 다씀: 끝확인 }))));
  그리기();
}

// ───────────────────────── 2. 연관 분석이란? ─────────────────────────
function 연관분석이란(el, 수명, 도구) {
  const 상태 = 기록.get('정의', { 답: ['', ''], 맞음: false, 뒤집음: [], 단계: 0, 진열: null });
  const 저장 = () => 기록.set('정의', 상태);
  const 끝확인 = () => { if (상태.맞음 && 상태.뒤집음.length >= 4 && 상태.진열 === 0) 도구.완료(); };

  // ① 정의 빈칸
  const 칸들 = 정의빈칸.map((b, i) => {
    const 칸 = h('input', { class: 'fill', style: { width: `${b.답[0].length * 1.25 + 1.2}em` }, value: 상태.답[i], 'aria-label': `빈칸 ${i + 1}` });
    칸.addEventListener('input', () => { 상태.답[i] = 칸.value; 칸.classList.remove('ok', 'bad'); 저장(); });
    return 칸;
  });
  const 정의피드백 = h('div', { class: 'fb' });
  const 확인 = () => {
    let 다 = true;
    정의빈칸.forEach((b, i) => {
      const ok = b.답.some(d => 다듬기(칸들[i].value) === 다듬기(d));
      칸들[i].classList.toggle('ok', ok); 칸들[i].classList.toggle('bad', !ok);
      if (!ok) 다 = false;
    });
    상태.맞음 = 다; 저장();
    알림(정의피드백, 다 ? '⭕ 정답! 연관 분석은 <b>장바구니 분석</b>이라고도 불러요. 한 번에 함께 산 상품(한 장바구니)에서 규칙을 찾기 때문이에요.' : '❌ 빨간 칸을 다시 생각해 보세요. 막히면 [초성 힌트]를 누르세요.', 다 ? 'ok' : 'bad');
    끝확인();
  };
  const 정의판 = h('div', { class: 'panel', style: { fontSize: '17.5px', lineHeight: '2' } },
    h('div', null, h('b', { style: { color: 'var(--brand)' } }, '연관 분석 '), 정의빈칸[0].앞, ' ', 칸들[0], 정의빈칸[0].뒤),
    h('div', null, '· ', 정의빈칸[1].앞, ' ', 칸들[1], ' ', 정의빈칸[1].뒤),
    h('div', { class: 'row' },
      h('button', { class: 'btn sm primary', onClick: 확인 }, '확인'),
      h('button', { class: 'btn sm', onClick: () => 알림(정의피드백, '💡 초성 — ' + 정의빈칸.map((b, i) => `${i + 1}번: ${b.초성}`).join(' · '), 'info') }, '초성 힌트'),
      정의피드백));
  if (상태.맞음) { 칸들.forEach(c => c.classList.add('ok')); }

  // ② 구매 데이터 → 연관 규칙 분석 → 마케팅 전략 (교실에서 눌러 가며 보는 흐름)
  const 바구니 = [['🥓', '🥬', '고객'], ['🥓', '🌿', '고객 A'], ['🥓', '🍃', '고객 B']];
  // 가게 지도 — 빈: 채소 진열대를 놓을 수 있는 빈자리 번호(0 이 정육 코너 옆)
  const 가게칸 = [
    { em: '🥓', 이름: '정육 코너' }, { 빈: 0, 이름: '빈자리 ①' }, { em: '🧃', 이름: '음료 코너' }, { 빈: 1, 이름: '빈자리 ②' },
    { em: '🍪', 이름: '과자 코너' }, { em: '🍞', 이름: '빵 코너' }, { em: '🧴', 이름: '생활용품' }, { 빈: 2, 이름: '빈자리 ③ (계산대 옆)' },
  ];
  const 흐름 = h('div', { class: 'col', style: { gap: '8px' } });
  const 진열피드백 = h('div', { class: 'fb' });
  function 흐름그리기() {
    const 단 = 상태.단계;
    채우기(흐름,
      h('div', { class: 'row nw', style: { alignItems: 'stretch', gap: '6px' } },
        h('div', { class: 'panel', style: { flex: 1.25, padding: '6px', background: 단 >= 1 ? '#f4fbf7' : '#fff', borderColor: 단 >= 1 ? 'var(--ab)' : 'var(--line)' } },
          h('div', { class: 'small center', style: { fontWeight: 800 } }, '구매 데이터'),
          h('div', { class: 'row nw', style: { justifyContent: 'space-around' } }, 바구니.map(([고기, 채소, 누구]) =>
            h('div', { class: 'center' }, h('div', { style: { fontSize: '25px' } }, '🧺'), h('div', { style: { fontSize: '19px' } }, 고기, 채소), h('div', { class: 'muted', style: { fontSize: '12.5px' } }, 누구))))),
        h('div', { style: { alignSelf: 'center', fontSize: '24px', color: 단 >= 2 ? 'var(--brand)' : '#cfc8da' } }, '➜'),
        h('div', { class: 'panel center', style: { flex: 0.8, alignSelf: 'center', transform: 'rotate(0deg)', background: 단 >= 2 ? 'var(--brand-soft)' : '#fff', borderColor: 단 >= 2 ? 'var(--brand)' : 'var(--line)', fontWeight: 800 } }, '◆ 연관 규칙', h('br'), '분석'),
        h('div', { style: { alignSelf: 'center', fontSize: '24px', color: 단 >= 3 ? 'var(--brand)' : '#cfc8da' } }, '➜'),
        h('div', { class: 'panel', style: { flex: 1.5, padding: '6px 9px', fontSize: '14.5px', background: 단 >= 3 ? '#fffaf0' : '#fff', borderColor: 단 >= 3 ? '#e0a400' : 'var(--line)' } },
          h('div', { class: 'small', style: { fontWeight: 800 } }, '마케팅 전략'),
          단 >= 3 ? h('div', null, '💬 아하! 삼겹살을 사는 고객은 채소(상추·쑥갓·깻잎)도 함께 사는구나!', h('br'), '💬 그렇다면 채소를 어디에 둘까?') : h('div', { class: 'muted' }, '?'))),
      단 >= 3
        ? h('div', { class: 'col', style: { gap: '4px' } }, h('b', null, '🥬 가게 지도에서 채소 진열대를 놓을 빈자리를 누르세요.'),
          h('div', { class: 'store' }, 가게칸.map(칸 => 칸.빈 == null
            ? h('div', { class: 'shelf' }, h('span', { class: 'em' }, 칸.em), 칸.이름)
            : h('button', {
              class: 'shelf slot' + (상태.진열 === 칸.빈 ? (칸.빈 === 0 ? ' ok' : ' bad') : ''),
              onClick: () => {
                상태.진열 = 칸.빈; 저장(); 흐름그리기();
                알림(진열피드백, 칸.빈 === 0 ? '⭕ 맞아요! 함께 사는 상품을 가까이 두면 고객은 편하게 사고, 가게는 판매가 늘어요. 이렇게 <b>데이터에서 찾은 규칙</b>을 전략으로 바꾸는 것이 연관 분석의 쓰임이에요.' : '🤔 연관 규칙은 「삼겹살 → 채소」 였어요. 삼겹살을 사러 온 손님 눈에 채소가 보이려면?', 칸.빈 === 0 ? 'ok' : 'bad');
                끝확인();
              },
            }, h('span', { class: 'em' }, 상태.진열 === 칸.빈 ? '🥬' : '➕'), 칸.이름))))
        : h('button', { class: 'btn primary', style: { alignSelf: 'center' }, onClick: () => { 상태.단계 = Math.min(3, 상태.단계 + 1); 저장(); 흐름그리기(); } },
          ['▶ 구매 데이터 살펴보기', '▶ 연관 규칙 분석하기', '▶ 전략 세우기'][단]),
      진열피드백);
    if (상태.진열 === 0 && !진열피드백.textContent) 알림(진열피드백, '⭕ 함께 사는 상품을 가까이 두는 것 — 데이터에서 찾은 규칙을 전략으로 바꾼 거예요.', 'ok');
  }
  흐름그리기();

  // ③ 궁금증을 연관 규칙 꼴로 (뒤집는 카드)
  const 뒤집개 = h('div', { class: 'flips', style: { gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'repeat(3, 1fr)', flex: 1 } },
    궁금증.map((q, i) => {
      const 카드 = h('div', { class: 'flip' + (상태.뒤집음.includes(i) ? ' on done' : '') },
        h('div', { class: 'flip-in' },
          h('div', { class: 'flip-face', style: { fontSize: '14.5px' } }, h('b', null, `❓ ${q.앞}`), h('span', { class: 'muted', style: { fontSize: '12.5px' } }, '눌러서 규칙 꼴로 바꾸기')),
          // 뒷면: 규칙 한 줄(길면 글자처럼 줄바꿈) + 이렇게 쓴 까닭 한 줄
          h('div', { class: 'flip-face flip-back rule-back' },
            h('div', { class: 'rule-line' },
              h('span', { class: 'ra' }, `{${q.A.join(', ')}}`), ' → ', h('span', { class: 'rb' }, `{${q.B.join(', ')}}`)),
            h('div', { class: 'rule-why' }, q.왜))));
      카드.addEventListener('click', () => {
        카드.classList.toggle('on');
        if (!상태.뒤집음.includes(i)) { 상태.뒤집음.push(i); 카드.classList.add('done'); 저장(); 끝확인(); }
      });
      return 카드;
    }));

  el.append(h('div', { class: 'col grow' },
    h('div', { class: 'row nw' }, h('h2', null, '🔗 연관 분석이란?'), h('span', { class: 'muted' }, '빈칸을 채우고, 분석 흐름을 따라가고, 궁금증 카드를 뒤집어 보세요.')),
    정의판,
    h('div', { class: 'split' },
      h('div', { class: 'panel fill', style: { flex: 1.25 } }, h('h3', null, '🧭 데이터에서 규칙을 찾아 전략으로'), 흐름),
      h('div', { class: 'panel fill', style: { flex: 1 } }, h('h3', null, '🃏 궁금증을 「A → B」 규칙 꼴로 바꾸면?'),
        h('div', { class: 'muted', style: { fontSize: '13.5px' } }, h('span', { class: 'ra' }, 'A 파랑'), ' = 조건(먼저 산 것, 선행) · ', h('span', { class: 'rb' }, 'B 주황'), ' = 결과(함께 살 것, 후행)'),
        뒤집개))));
}

// ───────────────────────── 3. 어디에 쓰일까? ─────────────────────────
function 활용사례(el, 수명, 도구) {
  const 상태 = 기록.get('사례', { 맞춤: [] });
  const 저장 = () => 기록.set('사례', 상태);
  const 끝확인 = () => { if (상태.맞춤.length === 사례.length) 도구.완료(); };
  const 맞춘수 = h('span', { class: 'badge' });
  const 수새로 = () => { 맞춘수.textContent = `규칙 완성 ${상태.맞춤.length}/${사례.length}`; 맞춘수.className = 'badge' + (상태.맞춤.length === 사례.length ? ' ok' : ''); };

  const 카드들 = 사례.map((c, i) => {
    let 고른 = [];
    const 맞음 = () => 상태.맞춤.includes(i);
    const 슬롯 = h('div', { class: 'row', style: { justifyContent: 'center', gap: '5px', fontSize: '15px' } });
    const 칩줄 = h('div', { class: 'row', style: { justifyContent: 'center', gap: '4px' } });
    const 쪽지 = h('div', { class: 'small center' });
    // 풀고 나면 상황 글 대신 까닭·활용을 보인다(상황은 앞면에 그대로 있다)
    const 상황줄 = h('div', { class: 'muted center', style: { fontSize: '12.5px' } }, c.상황);
    function 뒤그리기() {
      상황줄.style.display = 맞음() ? 'none' : '';
      const a = 맞음() ? c.A : 고른[0], b = 맞음() ? c.B : 고른[1];
      채우기(슬롯, h('span', { class: 'chip a' }, a || 'A ?'), h('b', null, '→'), h('span', { class: 'chip b' }, b || 'B ?'));
      채우기(칩줄, 맞음() ? null : c.보기.map(x => h('button', {
        class: 'chip' + (고른.includes(x) ? ' on' : ''), style: { fontSize: '13.5px', padding: '2px 8px' },
        onClick: e => {
          e.stopPropagation();
          if (고른.includes(x)) 고른 = 고른.filter(y => y !== x); else if (고른.length < 2) 고른.push(x);
          if (고른.length === 2) {
            if (고른[0] === c.A && 고른[1] === c.B) { 상태.맞춤.push(i); 저장(); 카드.classList.add('done'); 수새로(); 끝확인(); }
            else { 쪽지.innerHTML = `<span style="color:var(--bad)">❌ ${고른[0] === c.B && 고른[1] === c.A ? '차례가 거꾸로예요 — 조건(A)을 먼저 누르세요' : '다시 골라 보세요'}</span>`; 고른 = []; }
          }
          뒤그리기();
        },
      }, x)));
      if (맞음()) 쪽지.innerHTML = `⭕ ${c.왜}<br><b>활용</b>: ${c.활용}`;
      else if (!고른.length && !쪽지.textContent.startsWith('❌')) 쪽지.textContent = 'A(조건) → B(결과) 차례로 누르세요';
    }
    const 카드 = h('div', { class: 'flip' + (맞음() ? ' on done' : '') },
      h('div', { class: 'flip-in' },
        h('div', { class: 'flip-face', style: { alignItems: 'center', textAlign: 'center' } },
          h('div', { class: 'ico', style: { fontSize: '34px' } }, c.아이콘), h('b', null, c.분야), h('div', { class: 'small' }, c.상황),
          h('span', { class: 'muted', style: { fontSize: '12.5px' } }, '눌러서 규칙 만들기 ↻')),
        h('div', { class: 'flip-face flip-back', style: { gap: '4px', justifyContent: 'center', padding: '7px 9px' } },
          h('b', { class: 'center' }, `${c.아이콘} ${c.분야}`), 상황줄, 슬롯, 칩줄, 쪽지)));
    카드.querySelector('.flip-face:not(.flip-back)').addEventListener('click', () => 카드.classList.add('on'));
    카드.querySelector('.flip-back').addEventListener('click', e => { if (e.target.closest('button')) return; 카드.classList.remove('on'); });
    뒤그리기();
    return 카드;
  });
  수새로();

  el.append(h('div', { class: 'col', style: { flex: 1 } },
    h('div', { class: 'row nw' }, h('h2', null, '🌍 연관 분석은 어디에 쓰일까?'), 맞춘수),
    h('p', { class: 'lead' }, '판매를 늘리려고 이웃 상품을 가까이 두거나, 맞춤형 광고·동영상 추천 등에 씁니다. 카드를 눌러 각 사례의 연관 규칙을 완성해 보세요.'),
    h('div', { class: 'flips', style: { gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr 1fr', flex: 1 } }, 카드들)));
}

// ───────────────────────── 4. 연관 규칙의 표현 ─────────────────────────
function 규칙표현(el, 수명, 도구) {
  const 상태 = 기록.get('표현', { 문제: [null, null, null], 방향: null });
  const 저장 = () => 기록.set('표현', 상태);
  const 끝확인 = () => {
    if (상태.문제.every((v, i) => v === 문장문제[i].A) && 상태.방향 === 1) 도구.완료();
  };

  // 문장 속 선행(A) 찾기
  const 문제칸 = h('div', { class: 'col', style: { gap: '6px' } });
  function 문제그리기() {
    채우기(문제칸, 문장문제.map((q, i) => h('div', { class: 'row nw', style: { justifyContent: 'space-between', background: '#faf8fc', borderRadius: '10px', padding: '4px 8px' } },
      h('span', { class: 'small' }, `${i + 1}. ${q.글}`),
      h('span', { class: 'row nw', style: { gap: '4px' } }, q.보기.map((x, k) => h('button', {
        class: 'chip' + (상태.문제[i] === k ? (k === q.A ? ' ok' : ' bad') : ''),
        onClick: () => { 상태.문제[i] = k; 저장(); 문제그리기(); 끝확인(); },
      }, x))))));
  }
  const 방향피드백 = h('div', { class: 'fb' });
  const 방향칸 = h('div', { class: 'row' });
  const 방향그리기 = () => 채우기(방향칸, ['같은 뜻이다', '다른 뜻이다'].map((t, i) => h('button', {
    class: 'chip' + (상태.방향 === i ? (i === 1 ? ' ok' : ' bad') : ''),
    onClick: () => {
      상태.방향 = i; 저장(); 방향그리기(); 끝확인();
      알림(방향피드백, i === 1 ? '⭕ 다른 뜻이에요. 휴대폰을 산 사람은 케이스를 살 가능성이 높지만, 케이스를 산 사람이 휴대폰을 새로 살 가능성은 낮아요(이미 휴대폰이 있으니까요). 그래서 A → B 의 <b>방향</b>이 중요하고, 뒤에서 배울 <b>신뢰도</b>도 방향에 따라 달라져요.' : '🤔 「케이스를 산 사람은 휴대폰도 새로 산다」 — 정말 그럴까요?', i === 1 ? 'ok' : 'bad');
    },
  }, t)));
  방향그리기();
  if (상태.방향 === 1) 알림(방향피드백, '⭕ 다른 뜻이에요 — A → B 는 방향이 있는 규칙이에요.', 'ok');

  el.append(h('div', { class: 'split' },
    h('div', { class: 'col', style: { flex: 1.15 } },
      h('h2', null, '✏️ 연관 규칙은 어떻게 나타낼까?'),
      h('table', { class: 'grid', style: { width: '100%' } },
        h('tr', null, h('th', { style: { width: '80px' } }, '표현'), h('td', { class: 'l' }, h('b', { class: 'ta' }, '(A 상품)'), ' → ', h('b', { class: 'tb' }, '(B 상품)'), h('span', { class: 'muted' }, '   A = 선행(조건) · B = 후행(결과)'))),
        h('tr', null, h('th', null, '해석'), h('td', { class: 'l' }, h('b', null, 'if A then B'), ' — 만약 A 를 구매했다면, B 도 구매할 가능성이 높다.')),
        h('tr', null, h('th', null, '예시'), h('td', { class: 'l small' }, '음료를 구매하는 고객은 과자를 함께 구매한다. / 삼겹살을 구매하는 고객은 상추를 함께 구매한다.'))),
      h('div', { class: 'panel' },
        h('h3', null, '📌 선행과 후행'),
        h('table', { class: 'grid', style: { width: '100%', fontSize: '14.5px', marginTop: '4px' } },
          h('tr', null, h('th', null, '연관 규칙'), h('th', { class: 'l' }, '해석')),
          h('tr', null, h('td', null, h('b', { class: 'ta' }, '햄버거'), ' → ', h('b', { class: 'tb' }, '콜라')), h('td', { class: 'l' }, '햄버거를 산 손님은 콜라를 함께 살 가능성이 높다.')),
          h('tr', null, h('td', null, h('b', { class: 'ta' }, '콜라'), ' → ', h('b', { class: 'tb' }, '햄버거')), h('td', { class: 'l' }, '콜라를 산 손님은 햄버거를 함께 살 가능성이 높다.'))),
        h('div', { class: 'muted', style: { marginTop: '4px' } }, '화살표 앞(파랑)이 ', h('b', { class: 'ta' }, '선행'), ', 뒤(주황)가 ', h('b', { class: 'tb' }, '후행'), '이에요. 같은 두 상품이라도 선행과 후행이 바뀌면 다른 규칙이에요.'))),
    h('div', { class: 'col', style: { flex: 1 } },
      h('div', { class: 'panel' }, h('h3', null, '🔍 문장에서 A(선행)를 찾아 누르세요'), 문제칸),
      h('div', { class: 'panel' },
        h('h3', null, '⇄ 방향을 바꾸면?'),
        h('p', { class: 'small', style: { margin: '4px 0' } }, '「휴대폰 → 휴대폰 케이스」 와 「휴대폰 케이스 → 휴대폰」 은 같은 뜻일까요?'),
        방향칸, 방향피드백))));
  문제그리기();
}

export default {
  id: 'open', 이름: '생각 열기', 아이콘: '💡',
  카드: [
    { id: 'shop', 제목: '추천의 비밀', 그리기: 추천의비밀 },
    { id: 'what', 제목: '연관 분석이란?', 그리기: 연관분석이란 },
    { id: 'cases', 제목: '어디에 쓰일까?', 그리기: 활용사례 },
    { id: 'rule', 제목: '연관 규칙의 표현', 그리기: 규칙표현 },
  ],
};
