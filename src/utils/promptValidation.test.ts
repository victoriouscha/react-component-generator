import { describe, expect, it } from 'vitest';
import { isPromptLengthValid, MAX_PROMPT_LENGTH } from './promptValidation';

describe('isPromptLengthValid', () => {
  it('500자 프롬프트를 유효하다고 판단한다', () => {
    expect(isPromptLengthValid('가'.repeat(MAX_PROMPT_LENGTH))).toBe(true);
  });

  it('501자 프롬프트를 유효하지 않다고 판단한다', () => {
    expect(isPromptLengthValid('가'.repeat(MAX_PROMPT_LENGTH + 1))).toBe(false);
  });
});
