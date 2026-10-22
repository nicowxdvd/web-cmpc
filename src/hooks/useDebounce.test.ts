import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devuelve el valor inicial de inmediato', () => {
    const { result } = renderHook(() => useDebounce('a', 400));
    expect(result.current).toBe('a');
  });

  it('no actualiza antes de la demora', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 400), { initialProps: { v: 'a' } });
    rerender({ v: 'ab' });
    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(result.current).toBe('a');
  });

  it('actualiza al cumplirse la demora', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 400), { initialProps: { v: 'a' } });
    rerender({ v: 'ab' });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe('ab');
  });

  it('reinicia el temporizador si el valor cambia antes de cumplirse', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 400), { initialProps: { v: 'a' } });
    rerender({ v: 'ab' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    rerender({ v: 'abc' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('a');
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('abc');
  });
});