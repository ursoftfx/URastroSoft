import { ReactNode, useEffect, useRef, useState } from "react";

/** Scales fixed-width A4 content (≈ 210mm / 794px) down to fit narrow screens. */
export const FitToWidth = ({ children, baseWidth = 820 }: { children: ReactNode; baseWidth?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setZoom(Math.min(1, el.clientWidth / baseWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [baseWidth]);
  return (
    <div ref={ref} style={{ width: "100%" }}>
      <div style={{ zoom } as React.CSSProperties}>{children}</div>
    </div>
  );
};
