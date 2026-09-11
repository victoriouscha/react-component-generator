# Client Agent Instructions

## Module Context

React 클라이언트는 공급자·키 입력과 생성 요청을 관리하고, 서버가 정규화한 코드를 `react-live`로 미리보기 한다. 생성 결과의 목록 상태는 `useComponentGenerator`가 소유한다.

## Tech Stack and Constraints

- React 19, TypeScript, Vite, react-live를 사용한다.
- API 요청은 절대 URL이나 3002 포트를 직접 쓰지 말고 `/api` 상대 경로를 사용한다. 개발 프록시가 이를 API 서버로 전달한다. 근거: `hooks/useComponentGenerator.ts:23-27`, `../vite.config.ts:8-14`.
- 생성 코드는 `LiveProvider`의 `noInline` 모드에서 실행되므로 서버가 보장한 `render(...)` 호출을 전제로 한다. 근거: `components/LivePreview.tsx:14-18`, `../server/generator.ts:12-23`.

## Implementation Patterns

- 생성 요청은 훅의 `generate(prompt, apiKey, provider)`를 통해 수행하고, 새 결과는 최신 항목이 앞에 오도록 상태를 갱신한다. 근거: `hooks/useComponentGenerator.ts:18-49`.
- 공급자를 변경하면 직접 입력한 API 키를 비운다. 공급자별 키를 재사용하는 UI로 바꾸려면 별도 상태 모델과 보안 검토를 함께 추가한다. 근거: `App.tsx:41-44`.
- 생성 결과의 `createdAt`은 `Date` 객체로 유지한다. 카드 표시 형식 변경 시 생성 지점과 `toLocaleTimeString` 사용처를 함께 검토한다. 근거: `types/index.ts:3-8`, `hooks/useComponentGenerator.ts:35-40`, `components/ComponentCard.tsx:18-21`.

## Testing Strategy

- UI 변경 뒤에는 `bun run test`를 실행한다.
- `PromptInput` 변경에는 빈 입력 비활성화, 입력 후 생성 호출, 로딩 표시의 테스트를 유지하거나 갱신한다. 근거: `components/PromptInput.test.tsx:6-28`.
- Testing Library 렌더링 테스트는 전역 `afterEach(cleanup)` 설정을 전제로 한다. 테스트 격리를 깨는 수동 DOM 정리를 추가하지 않는다. 근거: `test/setup.ts:5-8`.

## Local Golden Rules

- API 키가 없을 때 생성 요청을 보내지 않고, UI 안내와 서버 400 검증을 모두 유지한다. 근거: `App.tsx:33-38`, `../server/index.ts:167-180`.
- 직접 입력한 API 키는 생성 요청 본문에만 조건부로 담고 브라우저 저장소나 생성 결과에 저장하지 않는다. 현재 요청 본문은 키가 있을 때만 `apiKey`를 포함한다. 근거: `hooks/useComponentGenerator.ts:23-27`, `types/index.ts:3-8`.
- 생성 코드에 import를 추가하거나 `render(...)` 호출을 제거하는 클라이언트 측 변환을 넣지 않는다. 서버의 시스템 프롬프트와 정규화가 `react-live` 실행 조건을 보장한다. 근거: `../server/index.ts:9-20`, `../server/index.ts:188`, `components/LivePreview.tsx:14-18`.
- `Provider`에 값을 추가하거나 바꿀 때는 UI 설정과 서버의 공급자 타입·키 맵을 같은 변경으로 갱신한다. 근거: `types/index.ts:1`, `App.tsx:8-11`, `../server/index.ts:57-66`.
