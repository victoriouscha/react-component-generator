import { beforeEach, describe, expect, it } from 'vitest';
import { loadWorkspace, saveWorkspace, WORKSPACE_STORAGE_KEY } from './workspaceStorage';

describe('workspaceStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 provider, 프롬프트 히스토리, 컴포넌트를 복원하고 생성 시각은 Date로 변환한다', () => {
    localStorage.setItem(
      WORKSPACE_STORAGE_KEY,
      JSON.stringify({
        provider: 'anthropic',
        promptHistory: ['프로필 카드'],
        components: [
          {
            id: 'component-1',
            prompt: '프로필 카드',
            code: 'render(<div />);',
            createdAt: '2026-09-11T01:02:03.000Z',
          },
        ],
      }),
    );

    expect(loadWorkspace()).toEqual({
      provider: 'anthropic',
      promptHistory: ['프로필 카드'],
      components: [
        {
          id: 'component-1',
          prompt: '프로필 카드',
          code: 'render(<div />);',
          createdAt: new Date('2026-09-11T01:02:03.000Z'),
        },
      ],
    });
  });

  it('workspace 상태를 localStorage에 저장한다', () => {
    saveWorkspace({
      provider: 'google',
      promptHistory: ['대시보드'],
      components: [],
    });

    expect(JSON.parse(localStorage.getItem(WORKSPACE_STORAGE_KEY)!)).toEqual({
      provider: 'google',
      promptHistory: ['대시보드'],
      components: [],
    });
  });
});
