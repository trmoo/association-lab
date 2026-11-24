/*! 연관 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유 */
// 탭 2 세 가지 지표 — 세 질문 · 주문 6건과 동시 구매표 · P(A) 구하기 · P(A∩B) 와 벤 다이어그램 · 지지도 · 신뢰도 · 향상도
import { h, s, 채우기, 알림, 서술칸, 대화상자, 을, 이, 과 } from '../lib/ui.js';
import { 기록 } from '../lib/store.js';
import { 지표, 동시구매표, 세기, 분수글, 수글, 맞는수, 향상도판정 } from '../lib/assoc.js';
import { 영수증들, 벤, 분수, 동시구매표판, 쓰이는칸, 값글 } from '../lib/views.js';
import { 편의점, 미리적은칸, 그림, 세질문, 지표뜻, 서술, 힌트글자, 교집합쌍 } from '../data.js';

const 품목 = 편의점.품목, 거래 = 편의점.거래, N = 거래.length;
const 표정답 = 동시구매표(거래, 품목);
const 미리 = (r, c) => 미리적은칸.some(([a, b]) => a === r && b === c);
const 빈칸목록 = [];
for (let r = 0; r < 품목.length; r++) for (let c = 0; c <= r; c++) if (!미리(r, c)) 빈칸목록.push([r, c]);
export { 빈칸목록, 표정답 };
const 칩글 = x => (그림[x] ? 그림[x] + ' ' : '') + x;

// ───────────────────────── 1. 세 가지 질문 ─────────────────────────
function 세가지질문(el, 수명, 도구) {
  const 상태 = 기록.get('세질문', { 짝: [null, null, null], 순서: [] });
  const 저장 = () => 기록.set('세질문', 상태);
  const 이름들 = ['지지도', '신뢰도', '향상도'];
  const 끝확인 = () => {
    const 글 = (기록.get('서술', {}).세지표 || '').replace(/\s/g, '');
    if (상태.짝.every((v, i) => v === 세질문[i].답) && 상태.순서.join() === 이름들.join() && 글.length >= 힌트글자) 도구.완료();
  };
  const 말칸 = h('div', { class: 'col', style: { gap: '8px' } });
  const 짝피드백 = h('div', { class: 'fb' });
  function 말그리기() {
    채우기(말칸, 세질문.map((q, i) => h('div', { class: 'row nw', style: { background: '#faf8fc', borderRadius: '12px', padding: '6px 10px', justifyContent: 'space-between' } },
      h('span', { style: { fontSize: '16px' } }, ['🧑', '👧', '🙋'][i], ' 💬 「', h('b', null, q.말), '」'),
      h('span', { class: 'row nw', style: { gap: '4px' } }, 이름들.map(x => h('button', {
        class: 'chip' + (상태.짝[i] === x ? (x === q.답 ? ' ok' : ' bad') : ''),
        onClick: () => {
          상태.짝[i] = x; 저장(); 말그리기(); 끝확인();
          const 다 = 상태.짝.every((v, k) => v === 세질문[k].답);
          알림(짝피드백, 다 ? '⭕ 모두 맞았어요! 지지도 = 얼마나 자주 · 신뢰도 = 얼마나 이어지나 · 향상도 = 우연이 아닌가' : 상태.짝[i] === q.답 ? '⭕ 맞아요.' : '❌ 아래 지표의 뜻을 읽고 다시 골라 보세요.', 다 || 상태.짝[i] === q.답 ? 'ok' : 'bad');
        },
      }, x))))));
  }
  const 순서칸 = h('div', { class: 'chain' });
  const 순서피드백 = h('div', { class: 'fb' });
  function 순서그리기() {
    채우기(순서칸,
      상태.순서.map((x, i) => [i ? h('span', { class: 'arr' }, '→') : null, h('span', { class: 'node done' }, x)]),
      상태.순서.length < 3 ? [상태.순서.length ? h('span', { class: 'arr' }, '→') : null, h('span', { class: 'node' }, '?')] : null);
  }
  const 순서단추 = h('div', { class: 'row' }, 이름들.map(x => h('button', {
    class: 'chip', onClick: () => {
      if (상태.순서.includes(x)) return;
      상태.순서.push(x);
      if (상태.순서.length === 3) {
        const ok = 상태.순서.join() === 이름들.join();
        알림(순서피드백, ok ? '⭕ 지지도 → 신뢰도 → 향상도! (신뢰도는 지지도로, 향상도는 신뢰도로 구해요)' : '❌ 다른 지표를 써서 구하는 지표는 뒤에 와야 해요. 다시 해 보세요.', ok ? 'ok' : 'bad');
        if (!ok) 상태.순서 = [];
      }
      저장(); 순서그리기(); 끝확인();
    },
  }, x)), h('button', { class: 'btn xs', onClick: () => { 상태.순서 = []; 저장(); 순서그리기(); 순서피드백.textContent = ''; 순서피드백.className = 'fb'; } }, '↺'));
  if (상태.순서.length === 3) 알림(순서피드백, '⭕ 지지도 → 신뢰도 → 향상도! (신뢰도는 지지도로, 향상도는 신뢰도로 구해요)', 'ok');

  el.append(h('div', { class: 'col grow' },
    h('div', { class: 'row nw' }, h('h2', null, '📐 규칙이 쓸 만한지 어떻게 알까? — 세 가지 질문')),
    h('div', { class: 'chain', style: { fontSize: '15.5px' } },
      h('span', { class: 'node on' }, '① 데이터 간 규칙 만들기: if A → B'), h('span', { class: 'arr' }, '→'),
      h('span', { class: 'node on' }, '② 규칙이 데이터에 맞는지 기준 정하기: 지지도·신뢰도·향상도'), h('span', { class: 'arr' }, '→'),
      h('span', { class: 'node on' }, '③ 규칙의 효용성 평가하기 (실제 규칙 생성)')),
    h('div', { class: 'split' },
      h('div', { class: 'col', style: { flex: 1.25 } },
        h('div', { class: 'panel' }, h('h3', null, '💬 친구들의 질문에 알맞은 지표는?'), 말칸, 짝피드백),
        h('div', { class: 'row nw', style: { gap: '8px', alignItems: 'stretch', flex: 1 } }, 이름들.map(x => h('div', { class: 'mbox big ' + { 지지도: 'sup', 신뢰도: 'conf', 향상도: 'lift' }[x], style: { flex: 1 } },
          h('h4', null, `${x}`), h('div', { class: 'muted' }, 지표뜻[x].영어), h('div', null, 지표뜻[x].뜻), h('div', { class: 'how' }, 지표뜻[x].식))))),
      h('div', { class: 'col', style: { flex: 1 } },
        h('div', { class: 'panel' }, h('h3', null, '🔢 계산하는 차례대로 누르세요'), 순서단추, 순서칸, 순서피드백),
        h('div', { class: 'panel' }, h('h3', null, '⚖️ 향상도는 1 을 기준으로 판단해요'),
          h('table', { class: 'grid', style: { width: '100%', fontSize: '14.5px', marginTop: '3px' } },
            h('tr', null, h('th', null, '향상도(A, B) > 1'), h('th', null, '향상도(A, B) = 1'), h('th', null, '향상도(A, B) < 1')),
            h('tr', null, h('td', null, 'A, B 가 같이 일어날 확률이 높다'), h('td', null, 'A, B 는 서로 관련이 없다 (독립)'), h('td', null, 'A, B 가 같이 일어날 확률이 낮다')))),
        서술칸({ 키: '세지표', ...서술.세지표, 줄: 2, 힌트글자, 다씀: 끝확인 })))));
  말그리기(); 순서그리기();
}

// ───────────────────────── 2. 주문 6건과 동시 구매표 ─────────────────────────
function 동시구매표카드(el, 수명, 도구) {
  const 상태 = 기록.get('동시표', { 칸: {}, 확인: false });
  const 저장 = () => 기록.set('동시표', 상태);
  let 고른 = null;   // [행, 열]
  const 영수증칸 = h('div');
  const 안내 = h('div', { class: 'tip small' });
  const 피드백 = h('div', { class: 'fb' });
  const 맞나 = ([r, c]) => String(상태.칸[`${r},${c}`] ?? '').trim() === String(표정답[r][c]);
  const 다맞음 = () => 빈칸목록.every(맞나);
  const 끝확인 = () => {
    const 글 = (기록.get('서술', {}).최고칸 || '').replace(/\s/g, '');
    if (다맞음() && 글.length >= 힌트글자) 도구.완료();
  };
  function 영수증그리기() {
    const 강조 = 고른 ? [...new Set([품목[고른[0]], 품목[고른[1]]])] : [];
    채우기(영수증칸, 영수증들(거래, { 강조, 열: 3, 표시: false }));
    채우기(안내, 고른
      ? (고른[0] === 고른[1]
        ? h('span', { html: `🔍 (${품목[고른[0]]}, ${품목[고른[1]]}) 칸 — 같은 품목이 만나는 칸이에요. <b>노란 ${품목[고른[0]]}</b>이 든 영수증을 세어 보세요.` })
        : h('span', { html: `🔍 (${품목[고른[0]]}, ${품목[고른[1]]}) 칸 — 노랗게 칠한 <b>두 상품이 모두</b> 든 영수증을 세어 보세요.` }))
      : '💡 표의 칸을 누르면 그 칸의 두 상품이 영수증에 노랗게 칠해져요. 함께 든 영수증을 세어 칸에 적으세요.');
  }
  const 입력들 = {};
  const 표 = 동시구매표판(품목, (r, c) => {
    const 열쇠 = `${r},${c}`;
    const td = h('td', { class: (미리(r, c) ? 'given' : '') + (r === c ? ' diag' : '') });
    if (미리(r, c)) td.append(String(표정답[r][c]));
    else {
      const 칸 = h('input', { class: 'num', inputmode: 'numeric', autocomplete: 'off', value: 상태.칸[열쇠] ?? '', 'aria-label': `${품목[r]} × ${품목[c]}` });
      칸.addEventListener('input', () => { 상태.칸[열쇠] = 칸.value.replace(/[^0-9]/g, ''); 칸.value = 상태.칸[열쇠]; 칸.classList.remove('ok', 'bad'); 저장(); 끝확인(); });
      칸.addEventListener('focus', () => 고르기(r, c, td));
      입력들[열쇠] = 칸;
      td.append(칸);
    }
    td.addEventListener('click', () => 고르기(r, c, td));
    return td;
  });
  function 고르기(r, c, td) {
    고른 = [r, c];
    표.querySelectorAll('td.sel').forEach(x => x.classList.remove('sel'));
    td.classList.add('sel');
    영수증그리기();
  }
  const 채점 = () => {
    상태.확인 = true; 저장();
    let 맞은 = 0;
    for (const rc of 빈칸목록) {
      const 칸 = 입력들[rc.join(',')], 값 = String(상태.칸[rc.join(',')] ?? '').trim();
      칸.classList.remove('ok', 'bad');
      if (값 !== '') 칸.classList.add(맞나(rc) ? 'ok' : 'bad');
      if (맞나(rc)) 맞은++;
    }
    알림(피드백, 맞은 === 빈칸목록.length ? '⭕ 15칸 모두 정답! 이제 같은 품목 칸(대각선)을 빼고 가장 큰 수를 찾아보세요.' : `${맞은}/${빈칸목록.length}칸 정답. 빨간 칸을 눌러 영수증에서 다시 세어 보세요.`, 맞은 === 빈칸목록.length ? 'ok' : 'bad');
    끝확인();
  };
  if (상태.확인) queueMicrotask(채점);

  el.append(h('div', { class: 'split' },
    h('div', { class: 'col', style: { flex: 0.95 } },
      h('h2', null, '🧾 편의점 주문 6건 → 동시 구매표'),
      h('p', { class: 'lead', style: { fontSize: '15px' } }, '두 품목이 같은 주문에서 함께 팔린 횟수를 표로 정리해요. 같은 품목 칸(대각선)에는 그 품목이 팔린 횟수를 적어요.'),
      영수증칸, 안내,
      서술칸({ 키: '최고칸', ...서술.최고칸, 줄: 2, 힌트글자, 다씀: 끝확인 })),
    h('div', { class: 'col', style: { flex: 1.05 } },
      h('div', { class: 'panel', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' } },
        h('h3', null, '동시 구매표 — 빈칸 15개를 채우세요 (진한 칸은 미리 적어 둔 값)'),
        표,
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onClick: 채점 }, '정답 확인'), 피드백)))));
  영수증그리기();
}

// ───────────────────────── 3. P(A) 구하기 — 영수증을 보며 세기 ─────────────────────────
function P정리(el, 수명, 도구) {
  const 상태 = 기록.get('P표', { 값: {}, 확인: false });
  const 저장 = () => 기록.set('P표', 상태);
  let 고른 = null;                                   // 표에서 누른 상품 — 영수증에 노랗게 칠한다(세는 것은 학생)
  const 영수증칸 = h('div', { class: 'rcpts-big' });
  const 안내 = h('div', { class: 'tip small' });
  // 계산식 — 카드 맨 위에 크게. 상품을 누르면 그 상품 이름으로 바뀐다
  const 식칸 = h('div', { class: 'pform one' });
  function 그리기() {
    채우기(영수증칸, 영수증들(거래, { 강조: 고른 ? [고른] : [], 열: 3, 표시: false }));
    채우기(식칸,
      h('div', { class: 'pform-rule' }, '📌 P(X) = ', 분수('X 의 경우의 수', '전체 경우의 수')),
      h('div', { class: 'pf a' }, h('b', null, 고른 ? `P(${고른}) =` : 'P(A) ='), 분수(고른 ? `${이(고른)} 든 거래 수` : 'A 가 든 거래 수', '전체 거래 수 6')));
    채우기(안내, 고른
      ? h('span', { html: `🔍 노랗게 칠한 <b>${고른}</b>${이(고른).slice(고른.length)} 든 영수증을 세어 보세요. 그 수가 분자, 전체 거래 수 6 이 분모예요.` })
      : '💡 오른쪽 표에서 상품을 누르면 그 상품이 영수증에 노랗게 칠해져요. 칠한 영수증을 세어 P(A) 를 적으세요.');
  }
  const 칸들 = {};
  const 피드백 = h('div', { class: 'fb' });
  const 정답 = x => 세기(거래, [x]) / N;
  const 채점 = (조용히 = false) => {
    let 맞은 = 0;
    for (const x of 품목) {
      const 칸 = 칸들[x];
      칸.classList.remove('ok', 'bad');
      if (String(상태.값[x] ?? '').trim()) { const ok = 맞는수(상태.값[x], 정답(x)); 칸.classList.add(ok ? 'ok' : 'bad'); if (ok) 맞은++; }
    }
    if (!조용히) { 상태.확인 = true; 저장(); }
    알림(피드백, 맞은 === 품목.length ? '⭕ 모두 정답! P(A) 는 「그 상품이 든 거래 수 ÷ 전체 거래 수」예요. 이 값들이 신뢰도·향상도 계산에 쓰여요.' : `${맞은}/${품목.length} 정답 — 분수(2/6)나 소수(0.33)로 적어요.`, 맞은 === 품목.length ? 'ok' : 'bad');
    if (맞은 === 품목.length) 도구.완료();
  };
  const 줄들 = {};
  const 고르기 = x => {
    고른 = x;
    Object.entries(줄들).forEach(([k, tr]) => tr.classList.toggle('sel', k === x));
    그리기();
  };
  const 표 = h('table', { class: 'grid pick-rows', style: { width: '100%', fontSize: '16.5px' } },
    h('tr', null, h('th', null, 'A'), h('th', null, 'P(A)')),
    품목.map(x => {
      const 칸 = h('input', { class: 'num', style: { width: '90px' }, value: 상태.값[x] ?? '', placeholder: '?/6', 'aria-label': `P(${x})` });
      칸.addEventListener('input', () => { 상태.값[x] = 칸.value; 칸.classList.remove('ok', 'bad'); 저장(); });
      칸.addEventListener('focus', () => 고르기(x));
      칸들[x] = 칸;
      const tr = h('tr', { onClick: () => 고르기(x) }, h('td', { class: 'l' }, 칩글(x)), h('td', null, 칸));
      줄들[x] = tr;
      return tr;
    }));
  if (상태.확인) queueMicrotask(() => 채점(true));

  el.append(h('div', { class: 'split' },
    h('div', { class: 'col', style: { flex: 1.45 } },
      h('h2', null, '🧾 P(A) 구하기 — 그 상품이 든 거래의 비율'),
      식칸,
      h('p', { class: 'lead' }, '지표를 계산하기 전에 필요한 값을 정리해요. 편의점 주문 6건에서 상품마다 몇 번 팔렸는지 세어 보세요.'),
      영수증칸, 안내),
    h('div', { class: 'col', style: { flex: 0.75 } },
      h('div', { class: 'panel' }, h('h3', null, '📋 계산 결과 정리 — P(A)'), 표,
        h('div', { class: 'row', style: { marginTop: '6px' } }, h('button', { class: 'btn primary', onClick: () => 채점() }, '정답 확인')), 피드백))));
  그리기();
}

// ───────────────────────── 4. P(A∩B) 와 벤 다이어그램 ─────────────────────────
function P교집합(el, 수명, 도구) {
  const 상태 = 기록.get('PAB표', { 값: {}, 확인: false, A: 교집합쌍[0][0], B: 교집합쌍[0][1] });
  const 저장 = () => 기록.set('PAB표', 상태);
  const 벤칸 = h('div', { class: 'svgbox' });
  // 계산식 — 카드 맨 위에 크게. 색은 벤 다이어그램과 같다(A 파랑 · B 주황 · A∩B 초록)
  const 식칸 = h('div', { class: 'pform' });
  const 고르기칸 = h('div', { class: 'col', style: { gap: '4px' } });
  const 줄들 = [];
  function 벤그리기() {
    채우기(고르기칸,
      h('div', { class: 'row', style: { gap: '4px' } }, h('b', { class: 'ta' }, 'A'), 품목.map(x => h('button', { class: 'chip' + (상태.A === x ? ' a' : ''), onClick: () => { if (x !== 상태.B) { 상태.A = x; 저장(); 벤그리기(); } } }, 칩글(x)))),
      h('div', { class: 'row', style: { gap: '4px' } }, h('b', { class: 'tb' }, 'B'), 품목.map(x => h('button', { class: 'chip' + (상태.B === x ? ' b' : ''), onClick: () => { if (x !== 상태.A) { 상태.B = x; 저장(); 벤그리기(); } } }, 칩글(x)))));
    // 'sup' 모드 — 겹친 곳(초록)과 전체 상자(굵은 테두리)를 함께 칠한다: P(A∩B) = 겹친 곳 ÷ 전체
    채우기(벤칸, 벤(거래, 상태.A, 상태.B, { 모드: 'sup', 가림: true }));
    채우기(식칸,
      h('div', { class: 'pform-rule' }, '📌 P(X) = ', 분수('X 의 경우의 수', '전체 경우의 수')),
      h('div', { class: 'pform-row' },
        h('div', { class: 'pf a' }, h('b', null, 'P(A) ='), 분수(`${이(상태.A)} 든 거래 수`, '전체 거래 수 6')),
        h('div', { class: 'pf b' }, h('b', null, 'P(B) ='), 분수(`${이(상태.B)} 든 거래 수`, '전체 거래 수 6')),
        h('div', { class: 'pf ab' }, h('b', null, 'P(A∩B) ='), 분수('A, B 가 함께 든 거래 수', '전체 거래 수 6'))));
    줄들.forEach(([a, b, tr]) => tr.classList.toggle('sel', (상태.A === a && 상태.B === b) || (상태.A === b && 상태.B === a)));
  }
  const 칸들 = [];
  const 피드백 = h('div', { class: 'fb' });
  const 정답 = ([a, b]) => 세기(거래, [a, b]) / N;
  const 채점 = (조용히 = false) => {
    let 맞은 = 0;
    교집합쌍.forEach((쌍, i) => {
      const 칸 = 칸들[i], v = String(상태.값[i] ?? '').trim();
      칸.classList.remove('ok', 'bad');
      if (v) { const ok = 맞는수(v, 정답(쌍)); 칸.classList.add(ok ? 'ok' : 'bad'); if (ok) 맞은++; }
    });
    if (!조용히) { 상태.확인 = true; 저장(); }
    const 다 = 맞은 === 교집합쌍.length;
    알림(피드백, 다 ? '⭕ 모두 정답! P(A∩B) 는 벤 다이어그램에서 두 원이 겹친 곳의 거래 수 ÷ 전체 거래 수예요. 겹친 곳이 비면 0 이에요. 이 값이 곧 지지도예요.' : `${맞은}/${교집합쌍.length} 정답 — 줄을 누르면 그 두 상품의 벤 다이어그램이 나와요.`, 다 ? 'ok' : 'bad');
    if (다) 도구.완료();
  };
  const 표 = h('table', { class: 'grid pick-rows', style: { width: '100%', fontSize: '16px' } },
    h('tr', null, h('th', null, 'A'), h('th', null, 'B'), h('th', null, 'P(A∩B)')),
    교집합쌍.map(([a, b], i) => {
      const 칸 = h('input', { class: 'num', style: { width: '76px' }, value: 상태.값[i] ?? '', placeholder: '?/6', 'aria-label': `P(${a}∩${b})` });
      칸.addEventListener('input', () => { 상태.값[i] = 칸.value; 칸.classList.remove('ok', 'bad'); 저장(); });
      const 보기 = () => { 상태.A = a; 상태.B = b; 저장(); 벤그리기(); };
      칸.addEventListener('focus', 보기);
      칸들[i] = 칸;
      const tr = h('tr', { onClick: 보기 }, h('td', { class: 'l ta' }, 칩글(a)), h('td', { class: 'l tb' }, 칩글(b)), h('td', null, 칸));
      줄들.push([a, b, tr]);
      return tr;
    }));
  if (상태.확인) queueMicrotask(() => 채점(true));

  el.append(h('div', { class: 'split' },
    h('div', { class: 'col', style: { flex: 1.45 } },
      h('h2', null, '🔵🟠 P(A∩B) 와 벤 다이어그램'),
      식칸,
      h('p', { class: 'lead' }, '두 상품을 골라 보세요. 두 원이 겹친 곳(초록)에 든 주문 번호가 A 와 B 가 함께 든 거래예요.'),
      고르기칸,
      h('div', { class: 'panel fill', style: { padding: '6px' } }, 벤칸)),
    h('div', { class: 'col', style: { flex: 0.75 } },
      h('div', { class: 'panel' }, h('h3', null, '📋 계산 결과 정리 — P(A∩B)'), 표,
        h('div', { class: 'row', style: { marginTop: '6px' } }, h('button', { class: 'btn primary', onClick: () => 채점() }, '정답 확인')), 피드백),
      h('div', { class: 'tip small' }, '💡 P(A∩B) 와 P(B∩A) 는 같아요 — 겹친 곳은 A, B 의 차례와 상관없으니까요.'))));
  벤그리기();
}

// ───────────────────────── 5~7. 지지도 · 신뢰도 · 향상도 ─────────────────────────
const 목표 = { A: '삼각김밥', B: '사이다' };
const 목표인가 = (a, b, 종류) => (a === 목표.A && b === 목표.B) || (종류 !== 'conf' && a === 목표.B && b === 목표.A);
const 지표설정 = {
  sup: {
    이름: '지지도', 영어: 'support', 아이콘: '🟢', 모드: 'sup', 흐리게: 'none',
    정의: '전체 거래에서 두 상품 A, B 가 함께 들어 있는 비율 — 지지도가 클수록 A 와 B 를 함께 산 거래가 많아요.',
    식: () => h('span', null, '(A → B) 지지도 = P(A∩B) = ', 분수('A 와 B 가 함께 든 거래 수', '전체 거래 수')),
    무엇: (a, b) => `전체 거래에서 ${과(a)} ${이(b)} 함께 팔린 비율`,
    계산: st => h('span', null, 'P(A∩B) = ', 분수(st.nAB, st.N), ' = ', 분수글(st.nAB, st.N)),
    값: st => [st.nAB, st.N],
    직접: [
      { 키: 'N', 글: '전체 거래 수', 값: () => N },
      { 키: 'nAB', 글: '삼각김밥과 사이다가 함께 든 거래 수', 값: () => 지표(거래, 목표.A, 목표.B).nAB },
      { 키: 'v', 글: '지지도 = P(A∩B)', 값: () => 지표(거래, 목표.A, 목표.B).지지도, 수: true },
    ],
    OX: { 글: 'A 와 B 의 자리를 바꾸어도(A → B ↔ B → A) 지지도는 늘 같다.', 답: 'O', 해설: '지지도는 「함께 든 거래 수 ÷ 전체 거래 수」라서 A, B 의 차례와 상관없어요.' },
  },
  conf: {
    이름: '신뢰도', 영어: 'confidence', 아이콘: '🟣', 모드: 'conf', 흐리게: 'notA',
    정의: '상품 A 를 산 거래 가운데 B 도 함께 산 비율 — 신뢰도가 클수록 A 를 사면 B 도 많이 사요.',
    식: () => h('span', null, '(A → B) 신뢰도 = P(B|A) = ', 분수('P(A∩B)', 'P(A)'), ' = ', 분수('지지도', 'P(A)')),
    무엇: (a, b) => `${을(a)} 산 거래 가운데 ${b}도 산 비율`,
    계산: st => h('span', null, 분수(분수글(st.nAB, st.N), 분수글(st.nA, st.N)), ' = ', 분수(st.nAB, st.nA), ' = ', 분수글(st.nAB, st.nA)),
    값: st => [st.nAB, st.nA],
    직접: [
      { 키: 'nA', 글: '삼각김밥이 든 거래 수', 값: () => 지표(거래, 목표.A, 목표.B).nA },
      { 키: 'v', 글: '신뢰도 = 지지도 ÷ P(삼각김밥)', 값: () => 지표(거래, 목표.A, 목표.B).신뢰도, 수: true },
    ],
    OX: { 글: 'A 와 B 의 자리를 바꾸어도 신뢰도는 늘 같다.', 답: 'X', 해설: '신뢰도는 A 를 산 거래를 기준(분모 P(A))으로 봐서, 자리를 바꾸면 기준이 P(B) 로 바뀌어 값이 달라질 수 있어요. 예) 아이스크림 → 사이다 = 1, 사이다 → 아이스크림 = 0.5' },
  },
  lift: {
    이름: '향상도', 영어: 'lift', 아이콘: '🟠', 모드: 'lift', 흐리게: 'none',
    정의: 'A 를 샀을 때 B 를 사는 비율(신뢰도)을 평소 B 를 사는 비율 P(B) 와 견줘요. 1 보다 크면 우연이 아니라 서로 관련이 있어요.',
    식: () => h('span', null, '(A → B) 향상도 = ', 분수('P(B|A)', 'P(B)'), ' = ', 분수('P(A∩B)', 'P(A)·P(B)'), ' = ', 분수('신뢰도', 'P(B)')),
    무엇: (a, b) => `${을(a)} 샀을 때 ${을(b)} 살 비율이 평소의 몇 배인가`,
    계산: st => h('span', null, 분수(분수글(st.nAB, st.nA), 분수글(st.nB, st.N)), ' = ', 분수글(st.향상도분자, st.향상도분모)),
    값: st => [st.향상도분자, st.향상도분모],
    직접: [
      { 키: 'nB', 글: '사이다가 든 거래 수', 값: () => 지표(거래, 목표.A, 목표.B).nB },
      { 키: 'pB', 글: 'P(B) = P(사이다)', 값: () => 지표(거래, 목표.A, 목표.B).pB, 수: true },
      { 키: 'v', 글: '향상도 = 신뢰도 ÷ P(사이다)', 값: () => 지표(거래, 목표.A, 목표.B).향상도, 수: true },
    ],
    OX: { 글: 'A 와 B 의 자리를 바꾸어도 향상도는 늘 같다.', 답: 'O', 해설: '향상도 = P(A∩B) ÷ (P(A)·P(B)) — A, B 를 바꾸어도 같아요.' },
  },
};

function 지표카드(종류) {
  return function (el, 수명, 도구) {
    const 설정 = 지표설정[종류];
    const 상태 = 기록.get('지표.' + 종류, { A: 종류 === 'sup' ? '아이스크림' : '껌', B: '사이다', 입력: {}, 풀림: false, ox: null, 두배: null });
    const 저장 = () => 기록.set('지표.' + 종류, 상태);
    const 끝확인 = () => { if (상태.풀림 && 상태.ox === 설정.OX.답 && (종류 !== 'lift' || 상태.두배 === 0)) 도구.완료(); };
    const 고르기칸 = h('div', { class: 'row nw', style: { gap: '5px', flexWrap: 'wrap' } });
    const 영수증칸 = h('div');
    const 벤칸 = h('div', { class: 'svgbox' });
    const 흐름칸 = h('div', { class: 'row nw', style: { gap: '10px', alignItems: 'stretch' } });
    const 막대칸 = h('div');

    function 고르기그리기() {
      채우기(고르기칸,
        h('b', { class: 'ta' }, 'A'), 품목.map(x => h('button', { class: 'chip' + (상태.A === x ? ' a' : ''), style: { padding: '2px 8px' }, onClick: () => { if (x !== 상태.B) { 상태.A = x; 저장(); 그리기(); } } }, 칩글(x))),
        h('span', { style: { width: '10px' } }),
        h('b', { class: 'tb' }, 'B'), 품목.map(x => h('button', { class: 'chip' + (상태.B === x ? ' b' : ''), style: { padding: '2px 8px' }, onClick: () => { if (x !== 상태.A) { 상태.B = x; 저장(); 그리기(); } } }, 칩글(x))),
        h('button', { class: 'btn sm', onClick: () => { [상태.A, 상태.B] = [상태.B, 상태.A]; 저장(); 그리기(); } }, '⇄ A·B 바꾸기'));
    }
    function 그리기() {
      고르기그리기();
      const a = 상태.A, b = 상태.B, st = 지표(거래, a, b);
      const 가림 = 목표인가(a, b, 종류) && !상태.풀림;
      채우기(영수증칸, 영수증들(거래, { A: a, B: b, 흐리게: 설정.흐리게, 열: 2, 작게: true }));
      채우기(벤칸, 벤(거래, a, b, { 모드: 설정.모드, 가림 }));
      const [분자, 분모] = 설정.값(st);
      채우기(흐름칸, h('div', { class: 'col', style: { flex: '0 0 290px', justifyContent: 'center', gap: '5px' } },
        h('div', { class: 'big-eq', style: { fontSize: '15.5px' } }, '규칙: 만약 ', h('em', { class: 'a' }, a), 을(a).slice(a.length), ' 사면 ', h('em', { class: 'b' }, b), '도 산다'),
        가림 ? h('div', { class: 'tip small' }, '🔒 「삼각김밥 → 사이다」는 오른쪽 아래 [직접 계산하기]에서 구해 보세요. 다른 상품을 고르면 값이 보여요.') : null,
        종류 === 'lift' && !가림 ? h('div', { class: 'small' }, '판정: ', 향상도판정(st) === '큼' ? h('span', { class: 'badge ok' }, '향상도 > 1 → 서로 연관이 있다') : 향상도판정(st) === '같음' ? h('span', { class: 'badge' }, '향상도 = 1 → 서로 독립') : h('span', { class: 'badge bad' }, '향상도 < 1 → 함께 사는 것을 억제')) : null),
        h('div', { class: 'calc3', style: { flex: 1 } },
          h('div', { class: 'box' }, h('span', { class: 'lab' }, '무엇을 구할까?'), h('span', { class: 'small' }, 설정.무엇(a, b))),
          h('span', { class: 'arrow' }, '➜'),
          h('div', { class: 'box' }, h('span', { class: 'lab' }, '계산하기'), 가림 ? h('span', { class: 'qmark', style: { fontSize: '26px', textAlign: 'center' } }, '?') : h('span', { style: { fontSize: '17px' } }, 설정.계산(st))),
          h('span', { class: 'arrow' }, '➜'),
          h('div', { class: 'box res' }, h('span', { class: 'lab' }, 설정.이름), h('span', { class: 'val' }, 가림 ? '?' : 수글(분자 / 분모)))));
      if (종류 === 'lift') 채우기(막대칸, 가림 ? h('div', { class: 'muted small' }, '🔒 막대도 가렸어요.') : 막대그림(st, a, b));
    }

    // 직접 계산하기 (삼각김밥 → 사이다)
    const 직접칸 = h('div', { class: 'col', style: { gap: '4px' } });
    const 직접피드백 = h('div', { class: 'fb' });
    const 입력들 = {};
    채우기(직접칸, 설정.직접.map(d => {
      const 칸 = h('input', { class: 'num', style: { width: '84px' }, value: 상태.입력[d.키] ?? '', 'aria-label': d.글, placeholder: d.수 ? '분수·소수' : '' });
      칸.addEventListener('input', () => { 상태.입력[d.키] = 칸.value; 칸.classList.remove('ok', 'bad'); 저장(); });
      입력들[d.키] = 칸;
      return h('div', { class: 'row nw', style: { justifyContent: 'space-between' } }, h('span', { class: 'small' }, d.글), 칸);
    }));
    const 뜻칸 = 종류 === 'conf' ? (() => {
      const 앞 = h('input', { class: 'fill', style: { width: '2.4em' }, value: 상태.입력.m1 ?? '', 'aria-label': '건수' });
      const 뒤 = h('input', { class: 'fill', style: { width: '2.4em' }, value: 상태.입력.m2 ?? '', 'aria-label': '건수' });
      앞.addEventListener('input', () => { 상태.입력.m1 = 앞.value; 저장(); });
      뒤.addEventListener('input', () => { 상태.입력.m2 = 뒤.value; 저장(); });
      입력들.m1 = 앞; 입력들.m2 = 뒤;
      return h('div', { class: 'small' }, '→ 삼각김밥을 산 거래 ', 앞, '건 가운데 ', 뒤, '건에서 사이다도 샀다.');
    })() : null;
    function 직접채점(조용히 = false) {
      let 다 = true;
      for (const d of 설정.직접) {
        const 칸 = 입력들[d.키], ok = d.수 ? 맞는수(상태.입력[d.키], d.값()) : String(상태.입력[d.키] ?? '').trim() === String(d.값());
        칸.classList.remove('ok', 'bad'); 칸.classList.add(ok ? 'ok' : 'bad');
        if (!ok) 다 = false;
      }
      if (종류 === 'conf') {
        const st = 지표(거래, 목표.A, 목표.B);
        const ok1 = String(상태.입력.m1 ?? '').trim() === String(st.nA), ok2 = String(상태.입력.m2 ?? '').trim() === String(st.nAB);
        입력들.m1.className = 'fill ' + (ok1 ? 'ok' : 'bad'); 입력들.m2.className = 'fill ' + (ok2 ? 'ok' : 'bad');
        if (!ok1 || !ok2) 다 = false;
      }
      const st = 지표(거래, 목표.A, 목표.B);
      if (!조용히 || 다) 알림(직접피드백, 다 ? `⭕ 정답! (삼각김밥 → 사이다) ${설정.이름} = ${값글(...설정.값(st))}${종류 === 'lift' ? ' > 1 — 함께 살 확률이 높다 (양의 연관)' : ''}` : '❌ 빨간 칸을 다시 계산해 보세요. 분수(3/4)나 소수(0.75) 모두 괜찮아요.', 다 ? 'ok' : 'bad');
      if (다 && !상태.풀림) { 상태.풀림 = true; 저장(); 그리기(); }
      끝확인();
    }
    if (상태.풀림) queueMicrotask(() => 직접채점(true));

    // O/X
    const ox칸 = h('div', { class: 'row nw' });
    const ox피드백 = h('div', { class: 'fb' });
    const ox그리기 = () => 채우기(ox칸, h('span', { class: 'small grow' }, 설정.OX.글), ['O', 'X'].map(v => h('button', {
      class: 'chip' + (상태.ox === v ? (v === 설정.OX.답 ? ' ok' : ' bad') : ''), style: { minWidth: '44px', fontSize: '17px' },
      onClick: () => { 상태.ox = v; 저장(); ox그리기(); 알림(ox피드백, (v === 설정.OX.답 ? '⭕ ' : '❌ 위에서 [⇄ A·B 바꾸기]를 눌러 값이 그대로인지 확인해 보세요. ') + (v === 설정.OX.답 ? 설정.OX.해설 : ''), v === 설정.OX.답 ? 'ok' : 'bad'); 끝확인(); },
    }, v)));
    ox그리기();
    if (상태.ox === 설정.OX.답) 알림(ox피드백, '⭕ ' + 설정.OX.해설, 'ok');

    // 향상도 카드만 — 「향상도가 2 라면?」
    let 두배칸 = null;
    if (종류 === 'lift') {
      const 보기 = ['삼겹살을 살 때 콜라를 살 비율이 평소의 2배', '콜라가 2개 팔렸다', '함께 산 거래가 2건'];
      const 칸 = h('div', { class: 'row', style: { gap: '4px' } });
      const fb = h('div', { class: 'fb' });
      const 그 = () => 채우기(칸, 보기.map((t, i) => h('button', {
        class: 'chip' + (상태.두배 === i ? (i === 0 ? ' ok' : ' bad') : ''), style: { textAlign: 'left', fontSize: '14px' },
        onClick: () => { 상태.두배 = i; 저장(); 그(); 알림(fb, i === 0 ? '⭕ 향상도는 「몇 배」를 말해요. 1 보다 크면 A 가 B 를 끌어올린다는 뜻!' : '❌ 향상도는 개수가 아니라 비율을 견준 값이에요.', i === 0 ? 'ok' : 'bad'); 끝확인(); },
      }, t)));
      그();
      두배칸 = h('div', { class: 'panel', style: { padding: '6px 10px' } }, h('b', { class: 'small' }, '❓ (삼겹살 → 콜라) 향상도가 2 라면?'), 칸, fb);
    }

    const 동시표단추 = h('button', { class: 'btn xs', onClick: () => 동시표보기(상태.A, 상태.B, 종류) }, '📋 동시 구매표에서 읽기');
    el.append(h('div', { class: 'col grow' },
      h('div', { class: 'row nw', style: { gap: '12px', alignItems: 'stretch' } },
        h('div', { class: 'col', style: { flex: 1, gap: '2px' } },
          h('h2', { style: { whiteSpace: 'nowrap' } }, `${설정.아이콘} ${설정.이름} (${설정.영어})`),
          h('p', { class: 'lead', style: { fontSize: '14.5px', lineHeight: 1.35 } }, 설정.정의)),
        h('div', { class: 'formula', style: { flex: 1.15, fontSize: '16.5px', padding: '4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, 설정.식())),
      고르기칸,
      흐름칸,
      h('div', { class: 'split' },
        h('div', { class: 'col', style: { flex: 0.95 } }, 영수증칸,
          h('div', { class: 'muted', style: { fontSize: '12.5px' } }, '파랑 = A 가 든 주문 · 주황 = B 가 든 주문 · 초록 = 둘 다', 종류 === 'conf' ? ' · A 가 없는 주문은 흐리게' : ''),
          h('div', { class: 'row', style: { marginTop: 'auto' } }, 동시표단추)),
        h('div', { class: 'col', style: { flex: 0.9 } }, h('div', { class: 'panel fill', style: { padding: '4px' } }, 벤칸), 종류 === 'lift' ? 막대칸 : null, 종류 === 'lift' ? 두배칸 : null),
        h('div', { class: 'col', style: { flex: 1.05 } },
          h('div', { class: 'panel', style: { padding: '7px 11px' } },
            h('div', { class: 'row nw', style: { justifyContent: 'space-between' } }, h('h3', null, '✍️ 직접 계산하기: 삼각김밥 → 사이다'),
              h('button', { class: 'btn xs', onClick: () => { 상태.A = 목표.A; 상태.B = 목표.B; 저장(); 그리기(); } }, '이 규칙 고르기')),
            직접칸, 뜻칸,
            h('div', { class: 'row nw' }, h('button', { class: 'btn sm primary', onClick: () => 직접채점() }, '확인'), 직접피드백)),
          h('div', { class: 'panel', style: { padding: '6px 10px' } }, ox칸, ox피드백)))));
    그리기();
  };
}

/** 향상도 — 신뢰도 막대와 P(B) 막대 견주기 */
function 막대그림(st, a, b) {
  const W = 520, BW = 400;
  const 줄 = (y, 이름, 설명, v, 색) => [
    s('text', { x: 0, y: y + 14, 'font-size': 15, 'font-weight': 800, fill: '#1f2433' }, 이름, s('tspan', { dx: 8, 'font-size': 13, 'font-weight': 400, fill: '#5d6475' }, 설명)),
    s('rect', { x: 0, y: y + 21, width: BW, height: 20, rx: 5, fill: '#eee9f3' }),
    s('rect', { x: 0, y: y + 21, width: Math.max(0, Math.min(1, v)) * BW, height: 20, rx: 5, fill: 색 }),
    s('text', { x: BW + 8, y: y + 37, 'font-size': 16, 'font-weight': 900, fill: '#1f2433' }, 수글(v)),
  ];
  return h('div', { class: 'panel', style: { padding: '6px 10px' } },
    h('b', { class: 'small' }, '📊 신뢰도와 P(B) 견주기 — 향상도 = 위 막대 ÷ 아래 막대'),
    s('svg', { viewBox: `0 0 ${W} 100`, class: 'plot', style: { width: '100%', height: 'auto' } },
      줄(0, '신뢰도', `${을(a)} 산 거래 가운데 ${b}`, st.신뢰도, '#8e44ad'),
      줄(50, 'P(B)', `전체 거래 가운데 ${b}`, st.pB, '#ea7a12')));
}

/** 지표 계산에 쓰이는 동시 구매표 칸 — 학생이 채운 값(또는 ?)으로 보여 준다 */
function 동시표보기(a, b, 종류) {
  const 표상태 = 기록.get('동시표', { 칸: {} });
  const i = 품목.indexOf(a), j = 품목.indexOf(b);
  const 보여줄칸 = (r, c) => 미리(r, c) || String(표상태.칸[`${r},${c}`] ?? '').trim() === String(표정답[r][c]);
  const 쓰는것 = { sup: ['ab'], conf: ['ab', 'a'], lift: ['ab', 'a', 'b'] }[종류];
  const [r0, c0] = i >= j ? [i, j] : [j, i];
  대화상자('📋 동시 구매표에서 읽기', h('div', { class: 'col' },
    쓰이는칸(거래, 품목, a, b, 쓰는것, 보여줄칸),
    h('ul', { class: 'small', style: { margin: 0 } },
      h('li', null, h('span', { class: 'tag ab' }, 'A∩B'), ` (${품목[r0]}, ${품목[c0]}) 칸 = 함께 든 거래 수 → P(A∩B) 의 분자`),
      쓰는것.includes('a') ? h('li', null, h('span', { class: 'tag a' }, 'A'), ` (${a}, ${a}) 칸 = A 가 든 거래 수 → P(A) 의 분자`) : null,
      쓰는것.includes('b') ? h('li', null, h('span', { class: 'tag b' }, 'B'), ` (${b}, ${b}) 칸 = B 가 든 거래 수 → P(B) 의 분자`) : null,
      h('li', null, '모든 P( ) 의 분모 = 전체 거래 수 6')),
    h('p', { class: 'muted', style: { margin: 0 } }, '? 칸은 「동시 구매표」 카드에서 아직 맞게 채우지 않은 칸이에요.')));
}

export default {
  id: 'measure', 이름: '세 가지 지표', 아이콘: '📐',
  카드: [
    { id: 'three', 제목: '세 가지 질문', 그리기: 세가지질문 },
    { id: 'table', 제목: '동시 구매표', 그리기: 동시구매표카드 },
    { id: 'pa', 제목: 'P(A)', 그리기: P정리 },
    { id: 'pab', 제목: 'P(A∩B)', 그리기: P교집합 },
    { id: 'sup', 제목: '지지도', 그리기: 지표카드('sup') },
    { id: 'conf', 제목: '신뢰도', 그리기: 지표카드('conf') },
    { id: 'lift', 제목: '향상도', 그리기: 지표카드('lift') },
  ],
};
