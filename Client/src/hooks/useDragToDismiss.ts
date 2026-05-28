import { useRef, useCallback } from 'react';

const DISMISS_THRESHOLD = 80;
const SLIDE_OUT_DURATION = 220;

export function useDragToDismiss(onDismiss: () => void) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const delta = useRef(0);
  const dragged = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      startY.current = e.clientY;
      delta.current = 0;
      dragged.current = false;

      const sheet = sheetRef.current;
      if (sheet) sheet.style.transition = 'none';

      const onMove = (ev: PointerEvent) => {
        const d = Math.max(0, ev.clientY - startY.current);
        delta.current = d;
        dragged.current = d > 4;
        if (sheet) sheet.style.transform = `translateY(${d}px)`;
      };

      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);

        if (delta.current >= DISMISS_THRESHOLD) {
          // Slide the sheet fully off-screen, then unmount
          if (sheet) {
            sheet.style.transition = `transform ${SLIDE_OUT_DURATION}ms cubic-bezier(0.4, 0, 1, 1)`;
            sheet.style.transform = 'translateY(110%)';
          }
          setTimeout(onDismiss, SLIDE_OUT_DURATION);
        } else {
          // Snap back
          if (sheet) {
            sheet.style.transition = 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)';
            sheet.style.transform = 'translateY(0)';
          }
        }
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [onDismiss],
  );

  const animatedDismiss = useCallback(() => {
    const sheet = sheetRef.current;
    if (sheet) {
      sheet.style.transition = `transform ${SLIDE_OUT_DURATION}ms cubic-bezier(0.4, 0, 1, 1)`;
      sheet.style.transform = 'translateY(110%)';
      setTimeout(onDismiss, SLIDE_OUT_DURATION);
    } else {
      onDismiss();
    }
  }, [onDismiss]);

  return { sheetRef, onPointerDown, animatedDismiss };
}
