/*! 연관 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유 */
// 소스 전수 점검 — 시험(test)이 화면 파일(DOM)을 부르지 않으므로 문법과 규칙을 여기서 본다.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const 파일 = [];
(function 훑기(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) 훑기(p);
    else if (/\.(js|mjs)$/.test(f)) 파일.push(p);
  }
})('src');
let 문제 = 0;
const 탓 = (f, 글) => { 문제++; console.log(`✗ ${f}: ${글}`); };
for (const f of 파일) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (e) { 탓(f, '문법 오류\n' + e.stderr.toString()); }
  const t = readFileSync(f, 'utf8');
  const 주석뺀 = t.replace(/\/\/.*$/gm, '');
  if (!t.startsWith('/*!') || !t.slice(0, 200).includes('티쳐무')) 탓(f, '머리 저작권 주석(/*! … 티쳐무)이 없다');
  if (/\b(alert|confirm|prompt)\s*\(/.test(주석뺀)) 탓(f, '브라우저 기본 대화상자 금지 — ui.js 의 대화상자() 를 쓸 것');
  if (/[을은이과와]\([를는가와과]\)/.test(주석뺀)) 탓(f, '「을(를)」 같은 겹 조사 금지 — ui.js 의 을()·이()·과() 를 쓸 것');
  if (f.includes('tabs')) {
    if (/\.replaceChildren\(/.test(t)) 탓(f, 'replaceChildren 대신 채우기() — null 이 「null」 글자로 찍힌다');
    if (/\bsetInterval\(/.test(t)) 탓(f, 'setInterval 대신 수명.interval() — 화면을 떠나도 타이머가 남는다');
    if (/addEventListener\(\s*['"]resize/.test(t)) 탓(f, 'resize 는 main.js 에서만');
  }
  // html2canvas 는 color-mix() 를 못 읽어 PDF 가 통째로 멈춘다
  if (/color-mix\(/.test(t)) 탓(f, 'color-mix() 금지 — PDF(html2canvas)가 읽지 못한다');
}
// ── 선언하지 않은 이름 ─────────────────────────────────────────────
// ⚠ 2026-11-26 — t0-open.js 가 조사 함수 이() 를 가져오지 않은 채 써서, 장바구니에 상품을 하나만
//   담으면 「이 is not defined」 로 카드가 통째로 멈췄다. 문법은 멀쩡하고 시험은 탭 파일을 부르지
//   않으니 아무도 못 잡았다. 그래서 파일마다 「쓰는 이름 ⊂ 선언·가져온 이름 ∪ 전역」 을 맞대어 본다.
//   (범위(scope)까지는 따지지 않는다 — 파일 안 어디에든 선언이 있으면 통과. 빠진 import 를 잡는 것이 목적)
const { parseAst } = await import('rolldown/parseAst');
const 전역 = new Set([...Object.getOwnPropertyNames(globalThis),
  'window', 'document', 'navigator', 'location', 'history', 'sessionStorage', 'localStorage', 'getComputedStyle',
  'matchMedia', 'requestAnimationFrame', 'cancelAnimationFrame', 'Image', 'HTMLElement', 'Node', 'Element', 'Event',
  'KeyboardEvent', 'FileReader', 'DOMParser', 'XMLSerializer', 'CSS', 'innerWidth', 'innerHeight', 'devicePixelRatio',
  'addEventListener', 'removeEventListener', 'scrollTo', 'scrollX', 'scrollY',
  'undefined', 'arguments', 'import']);
function 이름들(패턴, 담을) {     // 선언 자리의 꼴(구조 분해 포함)에서 이름을 모은다
  if (!패턴) return;
  if (패턴.type === 'Identifier') 담을.add(패턴.name);
  else if (패턴.type === 'ObjectPattern') for (const p of 패턴.properties) 이름들(p.type === 'RestElement' ? p.argument : p.value, 담을);
  else if (패턴.type === 'ArrayPattern') for (const p of 패턴.elements) 이름들(p, 담을);
  else if (패턴.type === 'RestElement') 이름들(패턴.argument, 담을);
  else if (패턴.type === 'AssignmentPattern') 이름들(패턴.left, 담을);
}
function 안쓰는자리(부모, 열쇠, 노드) {  // 이름이 「값을 읽는」 자리가 아닌 곳
  if (!부모) return false;
  if ((부모.type === 'MemberExpression') && 열쇠 === 'property' && !부모.computed) return true;
  if ((부모.type === 'Property' || 부모.type === 'MethodDefinition' || 부모.type === 'PropertyDefinition') && 열쇠 === 'key' && !부모.computed) return true;
  if (부모.type === 'LabeledStatement' || 부모.type === 'BreakStatement' || 부모.type === 'ContinueStatement') return true;
  if (/^(Import|Export)/.test(부모.type)) return true;
  return false;
}
function 선언안된이름(코드, 파일이름) {
  const 트리 = parseAst(코드, { sourceType: 'module', lang: 'js' }, 파일이름);
  const 선언 = new Set(), 쓰임 = new Map();
  (function 걷기(노드, 부모, 열쇠) {
    if (!노드 || typeof 노드.type !== 'string') return;
    switch (노드.type) {
      case 'ImportSpecifier': case 'ImportDefaultSpecifier': case 'ImportNamespaceSpecifier': 선언.add(노드.local.name); break;
      case 'VariableDeclarator': 이름들(노드.id, 선언); break;
      case 'FunctionDeclaration': case 'FunctionExpression': case 'ArrowFunctionExpression':
        if (노드.id) 선언.add(노드.id.name);
        for (const p of 노드.params) 이름들(p, 선언);
        break;
      case 'ClassDeclaration': case 'ClassExpression': if (노드.id) 선언.add(노드.id.name); break;
      case 'CatchClause': 이름들(노드.param, 선언); break;
      case 'Identifier':
        if (!안쓰는자리(부모, 열쇠, 노드) && !쓰임.has(노드.name)) 쓰임.set(노드.name, 노드.start);
        break;
    }
    for (const [k, v] of Object.entries(노드)) {
      if (k === 'type' || k === 'start' || k === 'end') continue;
      if (Array.isArray(v)) for (const x of v) 걷기(x, 노드, k);
      else if (v && typeof v === 'object') 걷기(v, 노드, k);
    }
  })(트리, null, null);
  return [...쓰임].filter(([이름]) => !선언.has(이름) && !전역.has(이름))
    .map(([이름, 자리]) => `${이름} (${코드.slice(0, 자리).split('\n').length}번째 줄)`);
}
// 점검기가 성한지 먼저 본다 — 한 번도 안 걸리는 검사기는 검사기가 아니다
{
  const 미끼 = 선언안된이름("import { 을 } from './x.js';\nconst f = a => `${을(a)} ${이(a)}`;\nconst o = { 을, b: 1 }; o.c(); 을.d;", '미끼.js');
  if (미끼.length !== 1 || !미끼[0].startsWith('이 ')) 탓('tools/check-syntax.mjs', '선언 안 된 이름 점검기가 미끼를 제대로 못 잡는다: ' + JSON.stringify(미끼));
}
for (const f of 파일) {
  let 없는;
  try { 없는 = 선언안된이름(readFileSync(f, 'utf8'), f); } catch (e) { 탓(f, '구문 분석 실패: ' + e.message); continue; }
  if (없는.length) 탓(f, '선언하지도 가져오지도 않은 이름 — ' + 없는.join(', '));
}

for (const f of ['src/style.css']) if (/color-mix\(/.test(readFileSync(f, 'utf8'))) 탓(f, 'color-mix() 금지 — PDF(html2canvas)가 읽지 못한다');
for (const f of ['index.html', 'vite.config.js', 'LICENSE', 'README.md', 'src/style.css']) {
  try { if (!readFileSync(f, 'utf8').includes('티쳐무')) 탓(f, '저작권 표시가 없다'); } catch { 탓(f, '파일이 없다'); }
}
if (JSON.parse(readFileSync('package.json', 'utf8')).license !== 'UNLICENSED') 탓('package.json', 'license 는 UNLICENSED');
// .gitignore — 교안 PDF 와 다른 분의 웹앱, 개발 기록이 저장소에 들어가면 안 된다
{
  const g = readFileSync('.gitignore', 'utf8');
  for (const 줄 of ['*.pdf', 'orange3-association-theory-main/', 'CLAUDE.md']) if (!g.split(/\r?\n/).includes(줄)) 탓('.gitignore', `「${줄}」 가 빠졌다`);
}
console.log(문제 ? `\n문제 ${문제}개` : `소스 ${파일.length}개 점검 통과 ✔`);
process.exit(문제 ? 1 : 0);
