/*! 연관 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유 */
// 탭 5 정리 — 확인 문제 · 핵심 정리 빈칸 · 전체 학습 내용 PDF 내려받기
import { h, 채우기, 알림 } from '../lib/ui.js';
import { 기록 } from '../lib/store.js';
import { 확인문제, 정리빈칸, 정리낱말 } from '../data.js';
import { 탭들 } from './index.js';
import { 차시들, 차시보기 } from '../sessions.js';

const 번호 = '①②③④⑤';

// ───────────────────────── 1. 확인 문제 ─────────────────────────
function 퀴즈(el, 수명, 도구) {
  const 결과 = 기록.get('퀴즈', 확인문제.map(() => null));   // true(첫 시도 정답) / false / null(아직)
  const 푼 = 기록.get('퀴즈푼', 확인문제.map(() => false));
  let 번 = Math.max(0, 푼.indexOf(false));
  const 점들 = h('div', { class: 'qdots' });
  const 본문 = h('div', { class: 'col grow', style: { justifyContent: 'center', gap: '14px' } });
  const 점수 = h('div', { class: 'row' });

  function 그리기() {
    const q = 확인문제[번];
    const 피드백 = h('div', { class: 'fb', style: { fontSize: '17px' } });
    const 보기들 = q.보기.map((t, i) => h('button', {
      class: 'opt' + (푼[번] && i === q.답 ? ' ok' : ''),
      onClick: e => {
        if (푼[번]) return;
        if (i === q.답) {
          if (결과[번] == null) 결과[번] = true;
          푼[번] = true;
          e.currentTarget.classList.add('ok');
          알림(피드백, '⭕ 정답! ' + q.해설, 'ok');
        } else {
          결과[번] = false;
          e.currentTarget.classList.add('bad');
          알림(피드백, '❌ 다시 골라 보세요. 💡 ' + q.힌트, 'bad');
        }
        기록.set('퀴즈', 결과); 기록.set('퀴즈푼', 푼);
        점그리기();
      },
    }, `${번호[i]} ${t}`));
    채우기(본문,
      h('h2', { style: { fontSize: '24px', color: 'var(--ink)' } }, `Q${번 + 1}. ${q.물음}`),
      h('div', { class: 'opts' }, 보기들),
      h('div', { class: 'row' },
        h('button', { class: 'btn sm', onClick: () => 알림(피드백, '💡 ' + q.힌트, 'info') }, '💡 힌트'),
        h('button', { class: 'btn sm', disabled: 번 === 0, onClick: () => { 번--; 그리기(); } }, '◀ 이전 문제'),
        h('button', { class: 'btn sm primary', disabled: 번 === 확인문제.length - 1, onClick: () => { 번++; 그리기(); } }, '다음 문제 ▶')),
      피드백);
    if (푼[번]) 알림(피드백, '⭕ ' + q.해설, 'ok');
    점그리기();
  }
  function 점그리기() {
    채우기(점들, 확인문제.map((_, i) => h('button', {
      class: 'qdot' + (i === 번 ? ' on' : '') + (결과[i] === true ? ' ok' : 결과[i] === false ? ' bad' : ''),
      onClick: () => { 번 = i; 그리기(); },
    }, i + 1)));
    const 바로 = 결과.filter(x => x === true).length;
    채우기(점수, h('span', { class: 'badge' }, `푼 문제 ${푼.filter(Boolean).length}/${확인문제.length}`), h('span', { class: 'badge ok' }, `한 번에 맞힌 문제 ${바로}`));
    if (푼.every(Boolean)) 도구.완료();
  }
  el.append(h('div', { class: 'col grow' },
    h('div', { class: 'row nw', style: { justifyContent: 'space-between' } }, h('div', { class: 'row nw' }, h('b', null, '📝 확인 문제'), 점들), 점수),
    h('div', { class: 'panel fill', style: { padding: '16px 22px' } }, 본문)));
  그리기();
}

// ───────────────────────── 2. 핵심 정리 빈칸 ─────────────────────────
function 핵심정리(el, 수명, 도구) {
  const 채움 = 기록.get('정리', 정리빈칸.map(() => ''));
  let 고른 = 채움.findIndex((v, j) => v !== 정리빈칸[j].답);
  const 문장칸 = h('div', { class: 'col grow', style: { gap: '7px', fontSize: '18px', justifyContent: 'center' } });
  const 낱말칸 = h('div', { class: 'row', style: { gap: '6px' } });
  const 피드백 = h('div', { class: 'fb' });

  function 그리기() {
    채우기(문장칸, 정리빈칸.map((b, i) => h('div', { class: 'panel', style: { padding: '6px 12px' } },
      h('b', { style: { color: 'var(--brand)' } }, `${i + 1}. `), b.앞,
      h('span', {
        class: 'blank' + (i === 고른 ? ' sel' : '') + (채움[i] ? (채움[i] === b.답 ? ' ok' : ' bad') : ''),
        onClick: () => { if (채움[i] !== b.답) { 고른 = i; 그리기(); } },
      }, 채움[i] || '　?　'),
      b.뒤)));
    채우기(낱말칸, h('b', null, '낱말 상자:'), 정리낱말.map(w => h('button', {
      class: 'chip', style: { fontSize: '16px' }, onClick: () => {
        if (고른 < 0) { 알림(피드백, '먼저 빈칸을 누르세요.', 'info'); return; }
        채움[고른] = w;
        if (w === 정리빈칸[고른].답) { 알림(피드백, '⭕ 맞아요!', 'ok'); 고른 = 채움.findIndex((v, j) => v !== 정리빈칸[j].답); }
        else 알림(피드백, '❌ 이 자리에는 다른 낱말이 들어가요. 다시 골라 보세요.', 'bad');
        기록.set('정리', 채움); 그리기();
      },
    }, w)));
    if (채움.every((v, i) => v === 정리빈칸[i].답)) { 알림(피드백, '🎉 핵심 정리 완성! 마지막 카드에서 전체 학습 내용을 PDF 로 내려받아 보세요.', 'ok'); 도구.완료(); }
  }
  el.append(h('div', { class: 'col grow' },
    h('div', { class: 'row nw' }, h('h2', null, '🔑 핵심 정리 — 빈칸 채우기'), h('span', { class: 'muted' }, '빈칸을 누르고 낱말 상자에서 알맞은 낱말을 고르세요. (쓰이지 않는 낱말도 있어요)')),
    문장칸, 낱말칸, 피드백));
  그리기();
}

// ───────────────────────── 3. PDF 내려받기 ─────────────────────────
function PDF(el, 수명, 도구) {
  // 두 차시의 활동을 모두 센다 — 1차시 기록은 「이어하기 파일」을 열면 이어진다
  const 전체 = 차시들.flatMap(s => 차시보기(탭들, s.번호).flatMap(v => v.카드.filter(c => c.id !== 'pdf').map(c => ({ 차시: s.번호, 탭: v.탭, c, 열쇠: `${v.탭.id}/${c.id}` }))));
  const 마친 = 전체.filter(x => 기록.완료됨(x.열쇠)).length;
  const 단추 = h('button', { class: 'btn primary', style: { fontSize: '22px', padding: '14px 26px', alignSelf: 'flex-start' } }, '📄 전체 학습 내용 PDF 내려받기');
  단추.addEventListener('click', () => globalThis.__연관완료?.(단추));

  el.append(
    h('div', { class: 'col', style: { flex: 1 } },
      h('h2', null, '📋 내 활동 현황'),
      h('div', { class: 'row' }, h('span', { style: { fontSize: '30px', fontWeight: 900, color: 'var(--brand)' } }, `${마친} / ${전체.length}`), h('span', { class: 'muted' }, '활동 완료')),
      h('div', { class: 'meter' }, h('i', { style: { width: (마친 / 전체.length) * 100 + '%' } })),
      h('div', { class: 'panel progress-list grow scroll-y' }, 전체.map(x => h('div', { class: 기록.완료됨(x.열쇠) ? 'ok' : 'no' }, (기록.완료됨(x.열쇠) ? '✔ ' : '○ ') + `${x.차시}차시 · ${x.탭.이름} · ${x.c.제목}`)))),
    h('div', { class: 'col', style: { flex: 1 } },
      h('h2', null, '📄 전체 학습 내용 PDF'),
      h('div', { class: 'panel', html: 'A4 여러 쪽으로 정리해 드려요.<br>① 표지·학습 목표·활동 현황 — <b>1차시와 2차시를 모두 담아요</b><br>② 생각 열기 — <b>내 장바구니 추천 실험</b>·정의·활용 사례·규칙 표현<br>③ 세 가지 지표 — <b>내 동시 구매표</b>·P(A)·지지도·신뢰도·향상도 계산<br>④ 연관 규칙 찾기 — <b>실습 정리표</b>(1차시)·탐색기·좋은 규칙 판정(2차시)<br>⑤ Apriori — 조합 폭발·<b>단계별 빈번 집합</b>·햄버거 가게 계산<br>⑥ 내가 쓴 서술형 답과 예시 답 · 확인 문제 결과 · 핵심 정리' }),
      h('div', { class: 'tip', html: '💡 아직 하지 않은 활동은 PDF 에 「아직 하지 않은 활동」으로 표시돼요. 이름·학번은 앱에 넣지 않아요 — 표지의 빈칸에 출력한 뒤 손으로 적으세요.' }),
      단추),
  );
  if (마친 === 전체.length) 도구.완료;   // 완료 표시는 PDF 를 받은 뒤 main.js 가 한다
}

export default {
  id: 'wrap', 이름: '정리', 아이콘: '📄',
  카드: [
    { id: 'quiz', 제목: '확인 문제', 그리기: 퀴즈 },
    { id: 'summary', 제목: '핵심 정리', 그리기: 핵심정리 },
    { id: 'pdf', 제목: 'PDF 내려받기', 그리기: PDF },
  ],
};
