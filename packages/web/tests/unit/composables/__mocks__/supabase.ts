import { vi } from 'vitest'

export function createMockSupabase() {
  const mockChain = {
    from: vi.fn(() => mockChain),
    select: vi.fn(() => mockChain),
    insert: vi.fn(() => mockChain),
    update: vi.fn(() => mockChain),
    delete: vi.fn(() => mockChain),
    eq: vi.fn(() => mockChain),
    gte: vi.fn(() => mockChain),
    lte: vi.fn(() => mockChain),
    order: vi.fn(() => mockChain),
    limit: vi.fn(() => mockChain),
    single: vi.fn(() => mockChain),
  }

  return mockChain
}

