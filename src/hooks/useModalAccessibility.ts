import { useEffect } from 'react';

/**
 * Custom hook to enhance modal dialog accessibility.
 * Listens for the 'Escape' key and invokes the onClose callback.
 *
 * @param isOpen Whether the modal dialog is currently mounted/visible
 * @param onClose Callback to dismiss the modal dialog
 */
export function useModalAccessibility(isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
}
