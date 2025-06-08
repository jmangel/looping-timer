import { renderHook, act } from '@testing-library/react';
import { useQueryParams } from './useQueryParams';

// Mock window.location and history
const mockPushState = jest.fn();
const mockReplaceState = jest.fn();

Object.defineProperty(window, 'location', {
  value: {
    search: '',
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
    pathname: '/',
  },
  writable: true,
});

Object.defineProperty(window, 'history', {
  value: {
    pushState: mockPushState,
    replaceState: mockReplaceState,
  },
  writable: true,
});

describe('useQueryParams', () => {
  beforeEach(() => {
    mockPushState.mockClear();
    mockReplaceState.mockClear();
    window.location.search = '';
  });

  it('should return default values when no query params exist', () => {
    const defaults = {
      loopLength: 30,
      tickInterval: 5,
      isMuted: false,
      useSpeech: false,
    };

    const { result } = renderHook(() => useQueryParams(defaults));

    expect(result.current.values).toEqual(defaults);
  });

  it('should parse existing query params on mount', () => {
    window.location.search =
      '?loopLength=60&tickInterval=10&isMuted=true&useSpeech=true';

    const defaults = {
      loopLength: 30,
      tickInterval: 5,
      isMuted: false,
      useSpeech: false,
    };

    const { result } = renderHook(() => useQueryParams(defaults));

    expect(result.current.values).toEqual({
      loopLength: 60,
      tickInterval: 10,
      isMuted: true,
      useSpeech: true,
    });
  });

  it('should update query params when values change', async () => {
    const defaults = {
      loopLength: 30,
      tickInterval: 5,
      isMuted: false,
      useSpeech: false,
    };

    const { result } = renderHook(() => useQueryParams(defaults));

    act(() => {
      result.current.updateValue('loopLength', 45);
    });

    // URL update happens in useEffect, so we need to wait for it
    expect(result.current.values.loopLength).toBe(45);
    expect(mockReplaceState).toHaveBeenCalledWith(
      null,
      '',
      'http://localhost:3000/?loopLength=45'
    );
  });

  it('should remove query param when value equals default', () => {
    window.location.search = '?loopLength=60&tickInterval=10';

    const defaults = {
      loopLength: 30,
      tickInterval: 5,
      isMuted: false,
      useSpeech: false,
    };

    const { result } = renderHook(() => useQueryParams(defaults));

    act(() => {
      result.current.updateValue('loopLength', 30); // Reset to default
    });

    expect(mockReplaceState).toHaveBeenCalledWith(
      null,
      '',
      'http://localhost:3000/?tickInterval=10'
    );
  });

  it('should handle boolean values correctly', () => {
    const defaults = {
      loopLength: 30,
      tickInterval: 5,
      isMuted: false,
      useSpeech: false,
    };

    const { result } = renderHook(() => useQueryParams(defaults));

    act(() => {
      result.current.updateValue('isMuted', true);
    });

    expect(result.current.values.isMuted).toBe(true);
    expect(mockReplaceState).toHaveBeenCalledWith(
      null,
      '',
      'http://localhost:3000/?isMuted=true'
    );
  });

  it('should clear all query params when all values are defaults', () => {
    window.location.search = '?loopLength=60&isMuted=true';

    const defaults = {
      loopLength: 30,
      tickInterval: 5,
      isMuted: false,
      useSpeech: false,
    };

    const { result } = renderHook(() => useQueryParams(defaults));

    act(() => {
      result.current.updateValue('loopLength', 30);
    });

    act(() => {
      result.current.updateValue('isMuted', false);
    });

    expect(mockReplaceState).toHaveBeenLastCalledWith(
      null,
      '',
      'http://localhost:3000/'
    );
  });
});
