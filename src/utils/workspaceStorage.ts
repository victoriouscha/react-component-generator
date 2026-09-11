import type { GeneratedComponent, Provider } from '../types';

export const WORKSPACE_STORAGE_KEY = 'react-component-generator:workspace';

export interface Workspace {
  provider: Provider;
  promptHistory: string[];
  components: GeneratedComponent[];
}

function isProvider(value: unknown): value is Provider {
  return value === 'anthropic' || value === 'google';
}

function isGeneratedComponent(value: unknown): value is Omit<GeneratedComponent, 'createdAt'> & { createdAt: string } {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const component = value as Record<string, unknown>;
  return typeof component.id === 'string'
    && typeof component.prompt === 'string'
    && typeof component.code === 'string'
    && typeof component.createdAt === 'string'
    && !Number.isNaN(Date.parse(component.createdAt));
}

export function loadWorkspace(): Workspace | null {
  try {
    const stored = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const workspace = JSON.parse(stored) as Record<string, unknown>;
    if (!isProvider(workspace.provider)
      || !Array.isArray(workspace.promptHistory)
      || !workspace.promptHistory.every((prompt) => typeof prompt === 'string')
      || !Array.isArray(workspace.components)
      || !workspace.components.every(isGeneratedComponent)) {
      return null;
    }

    return {
      provider: workspace.provider,
      promptHistory: workspace.promptHistory,
      components: workspace.components.map((component) => ({
        ...component,
        createdAt: new Date(component.createdAt),
      })),
    };
  } catch {
    return null;
  }
}

export function saveWorkspace(workspace: Workspace): void {
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
}
