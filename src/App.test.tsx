import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { WORKSPACE_STORAGE_KEY } from './utils/workspaceStorage';

vi.mock('./components/LivePreview', () => ({
  LivePreview: () => <div data-testid="live-preview" />,
}));

describe('App workspace persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ envKeys: { anthropic: false, google: false } }),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('저장된 provider와 생성 컴포넌트 목록을 새로고침 후 복원한다', () => {
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

    render(<App />);

    expect(screen.getByLabelText('Provider')).toHaveValue('anthropic');
    expect(screen.getByText('프로필 카드')).toBeInTheDocument();
  });

  it('생성 요청에 사용한 프롬프트를 localStorage 히스토리에 기록한다', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve(
      url === '/api/config'
        ? { json: () => Promise.resolve({ envKeys: { anthropic: false, google: true } }) }
        : { ok: true, json: () => Promise.resolve({ code: 'render(<div />);' }) },
    )));
    const user = userEvent.setup();

    render(<App />);

    await user.type(screen.getByRole('textbox'), '대시보드');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(WORKSPACE_STORAGE_KEY)!)).toMatchObject({
        promptHistory: ['대시보드'],
      });
    });
  });

  it('선택한 provider를 localStorage에 기록한다', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(WORKSPACE_STORAGE_KEY)!)).toMatchObject({
        provider: 'anthropic',
      });
    });
  });
});
