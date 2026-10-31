import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

describe('useModalAccessibility', () => {
  it('calls onClose when Escape key is pressed and modal is open', () => {
    const onClose = vi.fn();
    renderHook(() => useModalAccessibility(true, onClose));

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal is not open', () => {
    const onClose = vi.fn();
    renderHook(() => useModalAccessibility(false, onClose));

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores other keys like Enter or Space', () => {
    const onClose = vi.fn();
    renderHook(() => useModalAccessibility(true, onClose));

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    document.dispatchEvent(enterEvent);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('removes event listener on unmount', () => {
    const onClose = vi.fn();
    const { unmount } = renderHook(() => useModalAccessibility(true, onClose));

    unmount();

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);

    expect(onClose).not.toHaveBeenCalled();
  });
});
