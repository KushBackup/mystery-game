import { useLayoutEffect, useState } from 'react';

/**
 * How big a square drawing can be so the rest of the step still fits on one
 * screen: the board's width less `padX`, and the height of the scrolling
 * page (the app body, or the tutorial page) less `reserve`, the room the
 * controls around it need. Clamped to [min, max]. On a 320 × 568 phone this is
 * what keeps the pens and the guess box above the fold.
 */
export function useFit(ref, { reserve, padX = 0, min = 150, max = 300 }) {
  const [size, setSize] = useState(min);
  useLayoutEffect(() => {
    const el = ref.current;
    const page = el?.closest('.os-wt, .os-scroll');
    if (!el || !page) return undefined;
    const fit = () => setSize(Math.round(Math.max(min, Math.min(max, el.clientWidth - padX, page.clientHeight - reserve))));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    ro.observe(page);
    return () => ro.disconnect();
  }, [ref, reserve, padX, min, max]);
  return size;
}
