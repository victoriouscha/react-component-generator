import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';

describe('useComponentGenerator', () => {
  it('초기 컴포넌트 목록을 받아 복원한다', () => {
    const component = {
      id: 'component-1',
      prompt: '프로필 카드',
      code: 'render(<div />);',
      createdAt: new Date('2026-09-11T01:02:03.000Z'),
    };

    const { result } = renderHook(() => useComponentGenerator([component]));

    expect(result.current.components).toEqual([component]);
  });
});
