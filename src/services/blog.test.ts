import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { incrementBlogViewCount } from './blog';

const invokeMock = vi.fn();

vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(() => Promise.resolve({
    functions: {
      invoke: invokeMock,
    },
  })),
}));

describe('incrementBlogViewCount', () => {
  beforeEach(() => {
    invokeMock.mockResolvedValue({ data: { success: true }, error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls increment-blog-view edge function with slug', async () => {
    await incrementBlogViewCount('my-post');

    expect(invokeMock).toHaveBeenCalledWith('increment-blog-view', {
      body: { slug: 'my-post' },
    });
  });

  it('returns false when edge function fails', async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error('failed') });
    await expect(incrementBlogViewCount('my-post')).resolves.toBe(false);
  });
});
