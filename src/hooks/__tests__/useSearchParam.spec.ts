import { useSearchParams } from 'react-router-dom';
import { renderHook } from '@testing-library/react-hooks';
import { mockLocation } from '../../utils/test-utils';
import { useSearchParam, useSearchParamBatch } from '../useSearchParam';

mockLocation();

jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(),
}));

const useSearchParamsMock = useSearchParams as jest.Mock;

describe('useSearchParam', () => {
  let params: URLSearchParams;
  beforeEach(() => {
    params = new URLSearchParams();
    useSearchParamsMock.mockImplementation(() => [
      params,
      (newParams: URLSearchParams) => {
        params = newParams;
        window.location.search = `?${newParams.toString()}`;
      },
    ]);
  });

  it('should set URL search param', () => {
    const { result, rerender } = renderHook(() => useSearchParam('test', 'foo'));
    let [value, set] = result.current;
    expect(params.get('test')).toBeNull();

    set('bar');
    expect(params.get('test')).toBe('bar');
    rerender();
    [value] = result.current;
    expect(value).toBe('bar');
  });

  it('should unset URL search param', () => {
    params.set('test', 'foo');
    const { result, rerender } = renderHook(() => useSearchParam('test'));
    let [value, , unset] = result.current;
    expect(value).toBe('foo');

    unset();
    expect(params.has('test')).toBe(false);
    rerender();
    [value] = result.current;
    expect(value).toBe(null);
  });

  it('should return the same unset value as URLSearchParams', () => {
    const { result } = renderHook(() => useSearchParam('test'));
    const [value] = result.current;
    expect(value).toBe(params.get('test'));
  });

  it('should return the default value when unset', () => {
    const { result, rerender } = renderHook(() => useSearchParam('test', 'default value'));
    let [value, set, unset] = result.current;
    expect(value).toBe('default value');

    set('new value');
    rerender();
    [value, set, unset] = result.current;
    expect(value).toBe('new value');

    unset();
    rerender();
    [value] = result.current;
    expect(value).toBe('default value');
  });

  it('should unset URL search param when set to default value', () => {
    const { result } = renderHook(() => useSearchParam('test', 'default value'));
    const [, set] = result.current;
    set('new value');
    expect(params.get('test')).toBe('new value');
    expect(params.has('test')).toBe(true);
    set('default value');
    expect(params.get('test')).toBe(null);
    expect(params.has('test')).toBe(false);
  });

  it('should not unset URL search param when set to default value', () => {
    const { result } = renderHook(() =>
      useSearchParam('test', 'default value', { unsetWhenDefaultValue: false }),
    );
    const [, set] = result.current;
    set('new value');
    expect(params.get('test')).toBe('new value');
    expect(params.has('test')).toBe(true);
    set('default value');
    expect(params.get('test')).toBe('default value');
    expect(params.has('test')).toBe(true);
  });

  it('should not allow the default value to change', () => {
    const { result, rerender } = renderHook(
      ({ defaultValue }) => useSearchParam('test', defaultValue),
      { initialProps: { defaultValue: 'foo' } },
    );

    let [value] = result.current;
    expect(value).toBe('foo');

    rerender({ defaultValue: 'bar' });
    [value] = result.current;
    expect(value).toBe('foo');
  });
});

describe('useSearchParamBatch', () => {
  let params: URLSearchParams;
  beforeEach(() => {
    params = new URLSearchParams();
    useSearchParamsMock.mockImplementation(() => [
      params,
      (newParams: URLSearchParams) => {
        params = newParams;
        window.location.search = `?${newParams.toString()}`;
      },
    ]);
  });

  it('should set multiple URL search params', () => {
    const { result } = renderHook(() => useSearchParamBatch(['test', 'foo']));
    const [, batchSet] = result.current;
    expect(params.get('test')).toBeNull();
    expect(params.get('foo')).toBeNull();
    expect(params.get('eek')).toBeNull();

    const newValues: Record<string, string> = { test: 'bar', foo: 'baz', eek: 'qux' };

    batchSet(newValues);
    expect(params.get('test')).toBe('bar');
    expect(params.get('foo')).toBe('baz');
    expect(params.get('eek')).toBeNull();
  });

  it('should get specified URL search params', () => {
    const { result } = renderHook(() => useSearchParamBatch(['test', 'foo']));
    const [values] = result.current;
    params.set('test', 'bar');
    params.set('foo', 'baz');

    expect(values('test')).toMatchObject({ test: 'bar' });
    expect(values(['test', 'foo'])).toMatchObject({ test: 'bar', foo: 'baz' });
  });

  it('should get all URL search params', () => {
    const { result } = renderHook(() => useSearchParamBatch(['test', 'foo']));
    const [values] = result.current;
    params.set('test', 'bar');
    params.set('foo', 'baz');
    params.set('eek', 'qux');

    expect(values()).toMatchObject({ test: 'bar', foo: 'baz' });
  });

  it('should unset specified URL search params', () => {
    const { result } = renderHook(() => useSearchParamBatch(['test', 'foo']));
    const [, , batchUnset] = result.current;
    params.set('test', 'bar');
    params.set('foo', 'baz');
    params.set('eek', 'qux');

    batchUnset(['test']);
    expect(params.has('test')).toBe(false);
    expect(params.has('foo')).toBe(true);
    expect(params.has('eek')).toBe(true);
  });

  it('should unset all URL search params', () => {
    const { result } = renderHook(() => useSearchParamBatch(['test', 'foo']));
    const [, , batchUnset] = result.current;
    params.set('test', 'bar');
    params.set('foo', 'baz');
    params.set('eek', 'qux');

    batchUnset();
    expect(params.has('test')).toBe(false);
    expect(params.has('foo')).toBe(false);
    expect(params.has('eek')).toBe(true);
  });

  it('should unset search param when set to empty', () => {
    const { result } = renderHook(() => useSearchParamBatch(['test', 'foo']));
    const [, batchSet] = result.current;
    params.set('test', 'bar');
    params.set('foo', 'baz');

    batchSet({ test: '', foo: 'qux' });
    expect(params.has('test')).toBe(false);
    expect(params.get('foo')).toBe('qux');
  });
});
