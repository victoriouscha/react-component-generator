# Server Agent Instructions

## Module Context

Bun API 서버는 AI 공급자를 호출해 생성 코드를 정규화한 뒤 클라이언트에 반환한다. 순수 변환과 모델 폴백은 HTTP 처리와 분리되어 있으며 단위 테스트로 보호된다.

## Tech Stack and Constraints

- Bun의 내장 `fetch`, `Bun.serve`, `Response.json`을 사용한다.
- 개발 환경에서 클라이언트는 Vite의 `/api` 프록시로 이 서버에 연결된다. 서버 포트는 3002다. 근거: `../vite.config.ts:8-14`, `index.ts:138-140`.
- Anthropic과 Google의 공급자 값은 클라이언트 타입과 일치해야 한다. 근거: `index.ts:57-62`, `../src/types/index.ts:1`.

## Implementation Patterns

- 공급자 호출 실패는 `Error`로 올리고 라우트에서 상태 코드와 사용자 메시지로 변환한다. 429와 503의 별도 응답을 유지하며, JSON 응답에는 CORS 헤더를 포함한다. 근거: `index.ts:51-55`, `index.ts:191-211`.
- 생성 텍스트는 항상 `stripCodeFences` 다음 `ensureRenderCall`로 처리한 후 `code` 필드로만 반환한다. 근거: `index.ts:188-190`.
- Google 모델 목록의 순서를 폴백 우선순위로 취급한다. 공급자 호출 함수를 추가할 때는 폴백 적용 여부를 명시한다. 근거: `index.ts:4-5`, `index.ts:134-136`.

## Testing Strategy

- 서버의 순수 로직을 수정하면 `bun run test`를 실행한다.
- 코드펜스 제거와 `render(...)` 주입의 입력 변형은 `generator.test.ts`에, 폴백의 성공·중간 실패·전체 실패·빈 목록은 `fallback.test.ts`에 추가한다. 근거: `generator.test.ts:4-40`, `fallback.test.ts:4-41`.

## Local Golden Rules

- 환경 변수 키 또는 요청에서 받은 실제 API 키를 응답과 로그에 포함하지 않는다. `/api/config`은 공급자별 불리언 상태만 노출한다. 근거: `index.ts:59-66`, `index.ts:147-156`.
- 키 검증을 제거하지 않는다. UI의 사전 검증과 별개로 `/api/generate`는 키와 프롬프트가 없을 때 400을 반환해야 한다. 근거: `index.ts:167-181`, `../src/App.tsx:33-38`.
- `noInline` 미리보기에 전달되는 생성 결과는 `render(...)` 호출을 포함해야 한다. 시스템 프롬프트의 출력 제약과 서버 정규화 중 어느 한 쪽만으로 대체하지 않는다. 근거: `index.ts:9-20`, `index.ts:188`, `generator.ts:12-23`, `../src/components/LivePreview.tsx:14-18`.
- Google 전용 모델 폴백을 Anthropic에도 무단으로 일반화하지 않는다. 현재 비대칭은 Google 모델 배열과 직접 Anthropic 호출로 구현되어 있다. 근거: `index.ts:5`, `index.ts:68-96`, `index.ts:134-136`, `index.ts:183-186`.
