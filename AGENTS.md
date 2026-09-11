# Agent Instructions

## Operational Commands

- 패키지 관리와 스크립트 실행에는 Bun을 사용한다. `npm`, `yarn`, `pnpm`으로 lockfile이나 의존성을 변경하지 않는다.
- 개발 서버: `bun run dev`
- API 서버만 실행: `bun run server`
- 정적 검사: `bun run lint`
- 전체 테스트: `bun run test`
- 프로덕션 빌드: `bun run build`

## TDD Rule

**이 규칙은 Rigid — 상황에 맞게 변형하지 마라.** 하위 디렉토리의 `AGENTS.md`에 별도 TDD 규칙이 있으면 그 규칙을 우선한다. 이 섹션은 전역 기본값(fallback)이다.

### 적용 기준

- **반드시 TDD 적용:** 비즈니스 로직, API, 유틸리티, 버그 수정.
- **TDD 불필요:** 타입 정의, 설정 파일, 순수 UI, SQL.

### RED-GREEN-REFACTOR

1. **RED:** 하나의 동작에 테스트 하나만 작성한다. 반드시 실행해 실패를 확인하고, 실패 이유가 **기능 미구현**인지 검증한다.
2. **GREEN:** 테스트를 통과시키는 최소한의 코드만 작성한다. **YAGNI**를 지키고, 신규 테스트와 기존 테스트가 모두 통과하는지 확인한다.
3. **REFACTOR:** 중복 제거, 이름 개선, 헬퍼 추출만 수행한다. 테스트는 계속 green 상태여야 하며, 새 동작을 추가하지 않는다.
4. **반복:** 다음 동작에 대한 **RED**로 돌아간다.

### 삭제 강제 규칙

- 테스트보다 프로덕션 코드를 먼저 작성했다면 그 코드를 **삭제**하고 RED부터 다시 시작한다.
- 해당 코드를 **참고용**으로 남기는 것도 금지한다.

### 변명 차단표

| 변명 | 반론 |
| --- | --- |
| 너무 단순해서 테스트 불필요 | 단순한 동작도 요구사항을 고정하고 회귀를 막는 테스트가 필요하다. |
| 나중에 추가하겠다 | 구현 직후가 의도를 가장 정확히 검증할 수 있는 시점이다. 지금 RED를 작성한다. |
| 시간이 없다 | 테스트 없는 변경은 재작업 위험을 키운다. 범위를 줄여 RED-GREEN 사이클을 완료한다. |
| 삭제하면 낭비 | 테스트 없이 만든 코드는 검증되지 않은 가설이다. 삭제하고 검증 가능한 RED부터 시작한다. |
| 프로토타입이다 | 프로토타입도 동작 요구사항이 있다. 적용 대상이면 동일한 TDD 규칙을 따른다. |

## Golden Rules

### Immutable

- `/api` 요청은 Vite 프록시의 `http://localhost:3002`와 Bun 서버의 3002 포트가 함께 성립해야 한다. 한쪽의 주소 또는 포트를 바꾸면 다른 쪽도 같은 변경에 포함한다. 근거: `vite.config.ts:8-14`, `server/index.ts:138-140`.
- API 키의 실제 값을 `/api/config` 응답, 클라이언트 상태 외부, 로그, 저장소에 노출하지 않는다. 서버 설정 API는 키 존재 여부만 반환하며, `.env`는 Git에서 제외된다. 근거: `server/index.ts:147-156`, `.gitignore:29`.
- 생성 코드의 정규화 순서인 `stripCodeFences` 후 `ensureRenderCall`을 응답 직전에 유지한다. `react-live`의 `noInline` 미리보기는 `render(...)` 호출을 전제로 한다. 근거: `server/index.ts:188-190`, `server/generator.ts:12-23`, `src/components/LivePreview.tsx:14-18`.

### Do's and Don'ts

- API 키 유무는 클라이언트에서 먼저 안내하더라도 서버에서도 반드시 검증한다. 둘 중 하나를 제거하거나 클라이언트 검증만으로 대체하지 않는다. 근거: `src/App.tsx:33-38`, `server/index.ts:167-180`.
- Google 모델은 선언된 우선순위대로 실패 시 다음 모델을 시도한다. 새 Google 모델을 추가하거나 순서를 바꿀 때는 `withModelFallback`과 테스트 기대값을 함께 검토한다. Anthropic 호출에는 이 폴백이 적용되지 않으므로 공급자별 실패 전략을 명시적으로 결정한다. 근거: `server/index.ts:4-5`, `server/index.ts:134-136`, `server/index.ts:183-186`, `server/fallback.test.ts:15-33`.
- AI 응답 정규화와 모델 폴백은 부수효과 없는 함수로 유지하고, 변경 시 해당 단위 테스트를 함께 갱신한다. 이 두 경계에 테스트가 집중되어 있다. 근거: `server/generator.ts:1-2`, `server/generator.test.ts:4-40`, `server/fallback.test.ts:4-41`.

## Project Context

프롬프트를 React 컴포넌트 코드로 생성하고 즉시 미리보기와 코드 확인을 제공한다.

Tech stack: React 19, TypeScript, Vite, Bun, Vitest, Testing Library, react-live, Anthropic API, Google Gemini API.

## Standards and References

- TypeScript/TSX 변경은 `bun run lint`와 관련 `bun run test`를 실행한 뒤 `bun run build`로 통합을 확인한다.
- 커밋은 변경을 독립적인 논리 단위로 나누고 한국어 Conventional Commit 형식 `feat: 요약`, `fix: 요약`, `refactor: 요약`, `chore: 요약`을 사용한다. 근거: `.agents/skills/commit/SKILL.md:18-29`.
- 요청이 없는 한 `push`, `amend`, rebase를 수행하지 않는다. 근거: `.agents/skills/commit/SKILL.md:8`.
- 이 규칙과 구현 또는 테스트 경계가 달라지면, 근거를 확인해 규칙 갱신을 제안한다.

## Context Map

- **[Bun API, 공급자 연동, 응답 정규화](./server/AGENTS.md)** — API 라우트, AI 공급자, 생성 코드 후처리 변경 시.
- **[React UI, 생성 요청, 런타임 미리보기](./src/AGENTS.md)** — 화면·훅·클라이언트 테스트 변경 시.
