"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── the curved row ──────────────────────────────────────────────
 * Scroll Tilted Grid turned on its side, with the tilt drawn as a curve.
 * One row of images streams from right to left around the inside of a
 * cylinder. The centre faces you flat, the ends bend toward you so each
 * end image curves along its length, and the ends fade into the page.
 *
 * Slices: each tile is cut into SLICES vertical strips, each a flat facet
 * of the cylinder showing its share of the image.
 * ─────────────────────────────────────────────────────────────── */

const SLICES = 14;

// Camera distance from the screen, as a multiple of the cylinder's radius.
// Set to 2.2 so tiles NEVER exceed the camera focal plane on mobile or desktop.
const CAMERA = 2.2;

function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

// A tile can be up to 86% of the container width on mobile, perfectly framing the banner
const MAX_WIDTH = 86;

function measure(
  width: number,
  height: number,
  tile: number,
  aspect: number,
  gap: number,
  bend: number,
) {
  const h = Math.min(
    (tile / 100) * height,
    ((MAX_WIDTH / 100) * width) / aspect,
  );
  const radius = width * arc(bend);
  if (!(h > 0) || !(radius > 0))
    return { columns: 3, sweep: 0, unit: 0, limit: 0 };
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const unit = deg(h / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + (aspect * unit) / 2;
  const columns = Math.min(30, Math.max(3, Math.ceil((2 * limit) / pitch)));
  const round = (n: number) => +n.toFixed(4);
  const sweep = round((columns * pitch) / 2);
  return {
    columns,
    sweep,
    unit: round(unit),
    limit: round(Math.min(sweep, limit)),
  };
}

export type TiltedGridImage = {
  src: string;
  alt?: string;
  href?: string;
  title?: string;
};

export type TiltedGridHeroProps = {
  images: TiltedGridImage[];
  speed?: number;
  tileHeight?: number;
  aspectRatio?: number;
  gap?: number;
  axis?: number;
  curve?: number;
  fade?: number;
  onTileClick?: (image: TiltedGridImage) => void;
  children?: React.ReactNode;
  className?: string;
};

export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 80,
  aspectRatio = 2.3,
  gap = 8,
  axis = 50,
  curve = 45,
  fade = 12,
  onTileClick,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & TiltedGridHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = `tgh-o-${id}`;
  const tile = `tgh-t-${id}`;
  const bend = (Math.min(75, Math.max(10, curve)) * Math.PI) / 180;

  const [layout, setLayout] = React.useState<ReturnType<typeof measure> | null>(null);
  const [shown, setShown] = React.useState<Record<number, number>>({});

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) return;
      const next = measure(width, height, tileHeight, aspectRatio, gap, bend);
      setLayout((prev) =>
        prev?.columns === next.columns &&
        prev.sweep === next.sweep &&
        prev.unit === next.unit
          ? prev
          : next,
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tileHeight, aspectRatio, gap, bend]);

  // Preload images
  React.useEffect(() => {
    for (const { src } of images) {
      if (src) {
        const img = new Image();
        img.src = src;
      }
    }
  }, [images]);

  const { columns, sweep, unit, limit } =
    layout ?? measure(390, 185, tileHeight, aspectRatio, gap, bend);

  const u = (n: number) =>
    `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+(
      MAX_WIDTH / aspectRatio
    ).toFixed(4)}cqw))`;

  const r = 100 * arc(bend);
  const radius = `${+r.toFixed(3)}cqw`;
  const turn = (deg: number) =>
    `translateZ(${radius}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${radius})`;

  const rawHide = ((sweep - limit) / (2 * sweep || 1)) * 100;
  const hide = +Math.max(2, Math.min(46, rawHide)).toFixed(4);

  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    `.${tile}{will-change:transform;backface-visibility:hidden;-webkit-backface-visibility:hidden;}` +
    `@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused}}`;

  const share = aspectRatio / SLICES;
  const duration = Math.max(8, columns * speed);
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${
    100 - fade
  }%,transparent)`;

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
      style={{
        containerType: "size",
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        ...props.style
      }}
    >
      <style>{css}</style>

      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: layout ? 1 : 0,
          perspective: `${+(r * CAMERA).toFixed(3)}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
          pointerEvents: 'none'
        }}
      >
        {Array.from({ length: columns }, (_, t) => {
          const first = columns - 1 - t;
          const img = images[(shown[t] ?? first) % Math.max(images.length, 1)];
          const isInteractive = Boolean(onTileClick || img?.href);

          return (
            <div
              key={t}
              className={cn(tile, "absolute")}
              onClick={() => {
                if (img && onTileClick) onTileClick(img);
              }}
              style={{
                left: `calc(50% - ${u(aspectRatio / 2)})`,
                top: `calc(${axis}% - ${u(0.5)})`,
                width: u(aspectRatio),
                height: u(1),
                transformStyle: "preserve-3d",
                animation: `${orbit} ${duration}s linear ${-t * speed}s infinite`,
                cursor: isInteractive ? 'pointer' : 'default',
                pointerEvents: isInteractive ? 'auto' : 'none',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
              onAnimationIteration={(e) => {
                const lap = Math.round(e.elapsedTime / duration);
                setShown((prev) => {
                  const next = lap * columns + first;
                  return prev[t] === next ? prev : { ...prev, [t]: next };
                });
              }}
            >
              {Array.from({ length: SLICES }, (_, k) => (
                <div
                  key={k}
                  className="absolute top-0 overflow-hidden"
                  style={{
                    backgroundColor: '#1f1f23',
                    borderTopLeftRadius: k === 0 ? 16 : 0,
                    borderBottomLeftRadius: k === 0 ? 16 : 0,
                    borderTopRightRadius: k === SLICES - 1 ? 16 : 0,
                    borderBottomRightRadius: k === SLICES - 1 ? 16 : 0,
                    left: u((aspectRatio - share) / 2),
                    width: k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`,
                    height: u(1),
                    transform: turn(
                      (aspectRatio / 2 - (k + 0.5) * share) * unit,
                    ),
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  {img?.src ? (
                    <img
                      src={img.src}
                      alt={k === 0 ? (img.alt ?? "") : ""}
                      draggable={false}
                      className="absolute top-0 max-w-none object-cover"
                      style={{
                        left: u(-k * share),
                        width: u(aspectRatio),
                        height: u(1),
                        display: 'block'
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
}

export default TiltedGridHero;
