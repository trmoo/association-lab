/*! 연관 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유 */
// 연관 분석 계산 모음 — 화면(DOM) 없이 숫자만 다룬다. node 시험(test/run.mjs)이 그대로 부른다.
//
// 거래(트랜잭션) 하나 = 한 번에 함께 산 상품 이름의 배열   예) ['삼각김밥', '사이다', '껌']
// 집합 = 상품 이름의 배열 (순서는 상관없다)                예) ['햄버거', '콜라']

/** 거래 하나가 집합의 상품을 모두 담고 있는가 */
export const 포함 = (거래, 집합) => 집합.every(x => 거래.includes(x));

/** 집합의 상품이 모두 들어 있는 거래 수 */
export const 세기 = (거래들, 집합) => 거래들.filter(t => 포함(t, 집합)).length;

const 배열로 = x => (Array.isArray(x) ? x : [x]);

/**
 * 규칙 A → B 의 세 지표
 *  지지도 = P(A∩B)             : 전체 거래 중 A 와 B 가 함께 있는 비율
 *  신뢰도 = P(A∩B) ÷ P(A)      : A 를 산 거래 중 B 도 산 비율
 *  향상도 = 신뢰도 ÷ P(B)      : B 를 산 비율이 A 를 샀을 때 몇 배가 되었나 (1 이면 서로 관계없음)
 */
export function 지표(거래들, A, B) {
  const a = 배열로(A), b = 배열로(B);
  const N = 거래들.length;
  const nA = 세기(거래들, a), nB = 세기(거래들, b), nAB = 세기(거래들, [...a, ...b]);
  return {
    N, nA, nB, nAB,
    pA: N ? nA / N : 0, pB: N ? nB / N : 0,
    지지도: N ? nAB / N : 0,
    신뢰도: nA ? nAB / nA : 0,
    // 향상도 = (nAB/N) ÷ ((nA/N)·(nB/N)) = nAB·N ÷ (nA·nB) — 정수로 계산해 1 과 정확히 견줄 수 있게 한다
    향상도: nA && nB ? (nAB * N) / (nA * nB) : 0,
    향상도분자: nAB * N, 향상도분모: nA * nB,
  };
}

/** 향상도를 1 과 견주기 — 정수로 비교해 소수 오차 없이 = 1 을 가린다 */
export function 향상도판정(s) {
  if (!s.nA || !s.nB) return '없음';
  if (s.향상도분자 === s.향상도분모) return '같음';
  return s.향상도분자 > s.향상도분모 ? '큼' : '작음';
}

/** 동시 구매표 — 표[i][j] = 품목 i 와 j 가 함께 들어 있는 거래 수 (대각선은 그 품목이 들어 있는 거래 수) */
export function 동시구매표(거래들, 품목) {
  return 품목.map(a => 품목.map(b => 세기(거래들, a === b ? [a] : [a, b])));
}

/** 한 품목 → 한 품목 규칙 전부 (함께 팔린 적이 있는 것만) */
export function 규칙목록(거래들, 품목) {
  const 목록 = [];
  for (const a of 품목) for (const b of 품목) {
    if (a === b) continue;
    const s = 지표(거래들, a, b);
    if (s.nAB > 0) 목록.push({ A: a, B: b, ...s });
  }
  return 목록;
}

/** 좋은 규칙인가 — 최소 지지도·최소 신뢰도를 넘고 향상도가 1 보다 크다 */
export const 좋은규칙 = (r, 최소지지도, 최소신뢰도) =>
  r.지지도 >= 최소지지도 - 1e-9 && r.신뢰도 >= 최소신뢰도 - 1e-9 && 향상도판정(r) === '큼';

// ───────────── 분수와 숫자 ─────────────
const 최대공약수 = (a, b) => (b ? 최대공약수(b, a % b) : Math.abs(a));
/** 약분 — [분자, 분모] */
export function 약분(n, d) {
  if (!d) return [n, d];
  const g = 최대공약수(n, d) || 1;
  return [n / g, d / g];
}
/** 분수 글자 — 3/6 → '1/2', 4/4 → '1', 0/5 → '0' */
export function 분수글(n, d) {
  if (!d) return '—';
  const [a, b] = 약분(n, d);
  return b === 1 ? String(a) : `${a}/${b}`;
}
/** 소수 글자 — 끝의 0 은 지운다. 0.75 → '0.75', 1.125 → '1.125', 1/3 → '0.333' */
export function 수글(v, 자리 = 3) {
  if (v == null || !Number.isFinite(v)) return '—';
  const t = Number(v).toFixed(자리);
  return t.includes('.') ? t.replace(/\.?0+$/, '') : t;
}

/**
 * 학생이 쓴 값 읽기 — 분수(3/4), 소수(0.75), 백분율(75%), 나눗셈 꼴(3÷4) 을 받는다.
 * 읽을 수 없으면 NaN.
 */
export function 읽은수(글) {
  let t = String(글 ?? '').trim().replace(/\s+/g, '').replace(/[÷]/g, '/').replace(/,/g, '.');
  if (!t) return NaN;
  let 퍼센트 = false;
  if (t.endsWith('%')) { 퍼센트 = true; t = t.slice(0, -1); }
  let v;
  if (/^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/.test(t)) {
    const [a, b] = t.split('/').map(Number);
    v = b ? a / b : NaN;
  } else if (/^-?(\d+\.?\d*|\.\d+)$/.test(t)) v = Number(t);
  else return NaN;
  return 퍼센트 ? v / 100 : v;
}
/**
 * 학생 답이 값과 같은가. 소수로 반올림해 적은 답(0.33, 0.333, 1.14, 1.143)도 받는다.
 * 허용 오차는 「소수 둘째 자리 반올림」 만큼 — 0.005 를 조금 넘게 둔다.
 */
export function 맞는수(글, 값, 허용 = 0.0051) {
  const v = 읽은수(글);
  return Number.isFinite(v) && Math.abs(v - 값) <= 허용;
}

// ───────────── 조합과 Apriori ─────────────
/** 배열에서 k 개를 고르는 모든 조합 (원래 차례를 지킨다) */
export function 조합(목록, k) {
  const 결과 = [];
  const 고름 = [];
  (function 돌기(시작) {
    if (고름.length === k) { 결과.push([...고름]); return; }
    for (let i = 시작; i < 목록.length; i++) { 고름.push(목록[i]); 돌기(i + 1); 고름.pop(); }
  })(0);
  return 결과;
}

/** 상품 n 종류로 만들 수 있는 항목 집합 수 (공집합 제외) = 2ⁿ − 1 */
export const 집합수 = n => 2 ** n - 1;
/** 상품 n 종류로 만들 수 있는 연관 규칙 수 (A, B 는 겹치지 않는 공집합 아닌 집합) = 3ⁿ − 2ⁿ⁺¹ + 1 */
export const 규칙수 = n => 3 ** n - 2 ** (n + 1) + 1;

/**
 * Apriori 단계 — 수업 자료의 방법을 따른다.
 *  1-항목 후보 집합 C1 = 거래에 나오는 모든 상품 하나씩
 *  k-항목 빈번 집합 Fk = Ck 가운데 최소 지지도(최소 횟수) 이상 나타난 것
 *  (k+1)-항목 후보 집합 = Fk 에 나오는 상품들 가운데 k+1 개를 고르는 모든 조합
 * 가지치기 표시(잘림): 후보의 k-항목 부분 집합 가운데 하나라도 Fk 에 없으면, 세어 보지 않아도 빈번 집합이 될 수 없다
 *  (Apriori 성질 — 드문 조합을 품은 더 큰 조합은 더 드물다).
 * 돌려주는 값: [{ k, 후보: [{집합, 횟수, 통과, 잘림}], 빈번: [{집합, 횟수}] }, …] — 빈번 집합이 하나도 없으면 그 단계에서 멈춘다.
 */
export function apriori단계(거래들, 품목, 최소횟수) {
  const 단계들 = [];
  let 재료 = 품목.filter(x => 거래들.some(t => t.includes(x)));
  let 앞빈번 = null;
  for (let k = 1; k <= 재료.length; k++) {
    const 후보 = 조합(재료, k).map(집합 => {
      const 횟수 = 세기(거래들, 집합);
      const 잘림 = k > 1 && 조합(집합, k - 1).some(부분 => !앞빈번.some(f => 같은집합(f.집합, 부분)));
      return { 집합, 횟수, 통과: 횟수 >= 최소횟수, 잘림 };
    });
    const 빈번 = 후보.filter(c => c.통과).map(c => ({ 집합: c.집합, 횟수: c.횟수 }));
    단계들.push({ k, 후보, 빈번 });
    if (빈번.length === 0) break;
    재료 = 재료.filter(x => 빈번.some(f => f.집합.includes(x)));
    앞빈번 = 빈번;
    if (재료.length < k + 1) break;
  }
  return 단계들;
}
export const 같은집합 = (a, b) => a.length === b.length && a.every(x => b.includes(x));
export const 집합글 = 집합 => `{${집합.join(', ')}}`;

/** 빈발 항목 집합 전부 (최소 횟수 이상) — 크기 1 부터 차례로 */
export function 빈발집합(거래들, 품목, 최소횟수) {
  const 결과 = [];
  for (let k = 1; k <= 품목.length; k++) {
    const 이번 = 조합(품목, k).map(집합 => ({ 집합, 횟수: 세기(거래들, 집합) })).filter(x => x.횟수 >= 최소횟수);
    if (!이번.length) break;
    결과.push(...이번);
  }
  return 결과;
}

// ───────────── 추천 ─────────────
/**
 * 장바구니에 담은 상품들(장바구니)과 함께 산 상품 추천.
 * 장바구니를 모두 담은 거래가 하나도 없으면 마지막에 담은 상품 하나로만 찾는다(대신 사용).
 * 돌려주는 값: { 기준: [상품…], 기준수, 대신, 목록: [{ 상품, 함께, 신뢰도, 향상도, 인기 }] } — 신뢰도 높은 차례
 */
export function 추천(거래들, 품목, 장바구니) {
  if (!장바구니.length) return { 기준: [], 기준수: 0, 대신: false, 목록: [] };
  let 기준 = [...장바구니];
  let 기준수 = 세기(거래들, 기준);
  let 대신 = false;
  if (!기준수) { 기준 = [장바구니[장바구니.length - 1]]; 기준수 = 세기(거래들, 기준); 대신 = true; }
  const N = 거래들.length;
  const 목록 = 품목.filter(x => !장바구니.includes(x)).map(x => {
    const 함께 = 세기(거래들, [...기준, x]);
    const 인기 = 세기(거래들, [x]) / N;
    const 신뢰도 = 기준수 ? 함께 / 기준수 : 0;
    return { 상품: x, 함께, 신뢰도, 향상도: 인기 ? 신뢰도 / 인기 : 0, 인기 };
  }).filter(x => x.함께 > 0).sort((p, q) => q.신뢰도 - p.신뢰도 || q.향상도 - p.향상도);
  return { 기준, 기준수, 대신, 목록 };
}

// ───────────── 씨앗 고정 난수 ─────────────
export function 난수(씨앗) {
  let a = 씨앗 >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** [횟수, 상품들] 꾸러미 목록을 거래 목록으로 펼친 뒤 씨앗 고정으로 섞는다 */
export function 꾸러미펼치기(꾸러미, 씨앗) {
  const 거래 = [];
  for (const [n, 상품] of 꾸러미) for (let i = 0; i < n; i++) 거래.push([...상품]);
  const r = 난수(씨앗);
  for (let i = 거래.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [거래[i], 거래[j]] = [거래[j], 거래[i]]; }
  // 한 거래 안의 상품 차례도 살짝 섞어 영수증처럼 보이게 한다
  return 거래.map(t => { const u = [...t]; for (let i = u.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [u[i], u[j]] = [u[j], u[i]]; } return u; });
}
