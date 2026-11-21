/*! 연관 분석 실험실 (association-lab)
 *  © 2026 티쳐무 · 모든 권리 보유
 *  학교 수업 목적으로만 이용해 주세요. 자세한 내용은 LICENSE 파일을 보세요.
 */
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// 빌드 결과에 남길 저작권 배너. `/*!` 로 시작해야 압축해도 지워지지 않는다.
const 배너 = `/*! 연관 분석 실험실 — © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포·상업적 이용을 금합니다. */`;

// 함께 묶은 라이브러리의 MIT 고지 — 압축하면 라이브러리 머리 주석(@license)이 지워지므로 여기서 다시 붙인다
const 라이브러리고지 = `/*! 함께 묶은 라이브러리 (MIT License)
 * html2canvas — Copyright (c) 2012 Niklas von Hertzen
 * jsPDF — Copyright (c) 2010-2025 James Hall, https://github.com/MrRio/jsPDF; (c) 2015-2025 yWorks GmbH
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE. */`;

export default defineConfig({
  base: './',                       // GitHub Pages 하위 경로에서도 열리도록 상대 경로
  plugins: [viteSingleFile()],      // dist/index.html 한 파일로 묶어 더블클릭 실행
  // ⚠ 이 폴더에는 참고용 다른 웹앱(orange3-association-theory-main)이 함께 있다 — 의존성 훑기가 그 html 을 읽지 않게 한다
  optimizeDeps: { entries: ['index.html'] },
  server: { watch: { ignored: ['**/orange3-association-theory-main/**', '**/*.pdf'] } },
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 4000,
    rollupOptions: { output: { postBanner: `${배너}\n${라이브러리고지}` } },   // ⚠ Vite 8 에서 banner 는 압축에서 지워진다 — postBanner 는 압축 뒤에 붙는다
  },
});
