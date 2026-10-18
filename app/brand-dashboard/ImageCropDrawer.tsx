'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Crop, 
  Move, 
  Sliders,
  Sparkles,
  Loader2
} from 'lucide-react';
import styles from './brand-dashboard.module.css';

export interface ImageCropDrawerProps {
  isOpen: boolean;
  imageSrc: string | null;
  targetAspect?: number; // e.g. 1 for 1:1, 16/9 for 16:9
  title?: string;
  aspectLabel?: string;
  shape?: 'rect' | 'round';
  onClose: () => void;
  onApplyCrop: (croppedDataUrl: string, blob?: Blob) => void;
}

export default function ImageCropDrawer({
  isOpen,
  imageSrc,
  targetAspect = 1,
  title = 'Adjust & Crop Image',
  aspectLabel = '1:1 Square',
  shape = 'rect',
  onClose,
  onApplyCrop
}: ImageCropDrawerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAspect, setCurrentAspect] = useState(targetAspect);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Sync aspect when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentAspect(targetAspect);
      setScale(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, targetAspect]);

  // Load image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageElementRef.current = img;
    };
  }, [imageSrc]);

  // Mouse / Touch Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Zoom with wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setScale((prev) => Math.min(Math.max(0.6, prev + delta), 3.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Export cropped canvas
  const handleApply = useCallback(async () => {
    if (!imageElementRef.current || !containerRef.current) return;
    setIsProcessing(true);

    try {
      const img = imageElementRef.current;
      const cropBox = containerRef.current.getBoundingClientRect();

      // Output canvas dimensions
      let outWidth = 1000;
      let outHeight = Math.round(1000 / currentAspect);
      if (currentAspect === 1) {
        outWidth = 800;
        outHeight = 800;
      } else if (Math.abs(currentAspect - 16 / 9) < 0.1) {
        outWidth = 1600;
        outHeight = 900;
      }

      const canvas = document.createElement('canvas');
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill background (white for transparency fallback)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outWidth, outHeight);

      // Save context
      ctx.save();

      // Move center of canvas
      ctx.translate(outWidth / 2, outHeight / 2);

      // Rotate
      ctx.rotate((rotation * Math.PI) / 180);

      // Calculate source aspect ratio & layout
      const boxWidth = cropBox.width;
      const boxHeight = cropBox.height;

      // Ratio between export canvas and onscreen preview box
      const ratio = outWidth / boxWidth;

      // Apply offset scaled to export size
      const drawOffsetX = offset.x * ratio;
      const drawOffsetY = offset.y * ratio;

      // Base fitted image size inside the preview box
      const isRotated90or270 = rotation === 90 || rotation === 270;
      const effectiveImgW = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      const effectiveImgH = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

      // Scale to fill box
      const fillScale = Math.max(boxWidth / effectiveImgW, boxHeight / effectiveImgH);
      const drawW = img.naturalWidth * fillScale * scale * ratio;
      const drawH = img.naturalHeight * fillScale * scale * ratio;

      // Account for rotation coordinates
      if (rotation === 90) {
        ctx.drawImage(img, -drawH / 2 + drawOffsetY, -drawW / 2 - drawOffsetX, drawH, drawW);
      } else if (rotation === 180) {
        ctx.drawImage(img, -drawW / 2 - drawOffsetX, -drawH / 2 - drawOffsetY, drawW, drawH);
      } else if (rotation === 270) {
        ctx.drawImage(img, -drawH / 2 - drawOffsetY, -drawW / 2 + drawOffsetX, drawH, drawW);
      } else {
        ctx.drawImage(img, -drawW / 2 + drawOffsetX, -drawH / 2 + drawOffsetY, drawW, drawH);
      }

      ctx.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      canvas.toBlob((blob) => {
        setIsProcessing(false);
        onApplyCrop(dataUrl, blob || undefined);
        onClose();
      }, 'image/jpeg', 0.92);
    } catch (err) {
      console.warn('Canvas crop error:', err);
      setIsProcessing(false);
      if (imageSrc) {
        onApplyCrop(imageSrc);
      }
      onClose();
    }
  }, [currentAspect, rotation, scale, offset, imageSrc, onApplyCrop, onClose]);

  if (!isOpen || !imageSrc) return null;

  // Determine viewport dimensions
  const isLandscape = currentAspect > 1.2;
  const viewportWidth = 320;
  const viewportHeight = Math.round(viewportWidth / currentAspect);

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: '#ffffff',
            borderRadius: '28px 28px 0 0',
            boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '92vh',
            overflow: 'hidden'
          }}
        >
          {/* 1. DRAG HANDLE PILL */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px' }}>
            <div style={{ width: '42px', height: '5px', backgroundColor: '#cbd5e1', borderRadius: '9999px' }} />
          </div>

          {/* 2. DRAWER HEADER */}
          <div style={{
            padding: '12px 20px 14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  {title}
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#2563eb',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {aspectLabel}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                Drag to frame or adjust zoom &amp; rotation
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* 3. INTERACTIVE CROP CANVAS STAGE */}
          <div style={{
            backgroundColor: '#090d16',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '280px'
          }}>
            {/* Viewport Frame Box */}
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              style={{
                width: `${viewportWidth}px`,
                height: `${viewportHeight}px`,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: shape === 'round' && currentAspect === 1 ? '50%' : '16px',
                boxShadow: '0 0 0 9999px rgba(9, 13, 22, 0.75), 0 0 0 2px #38bdf8, 0 8px 30px rgba(0, 0, 0, 0.5)',
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
                userSelect: 'none'
              }}
            >
              {/* Image Transform Layer */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              >
                <img
                  src={imageSrc}
                  alt="Crop preview"
                  draggable={false}
                  style={{
                    maxWidth: 'none',
                    maxHeight: 'none',
                    width: currentAspect >= 1 ? '100%' : 'auto',
                    height: currentAspect < 1 ? '100%' : 'auto',
                    objectFit: 'contain',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              {/* Grid 3x3 Overlay Lines */}
              <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gridTemplateRows: '1fr 1fr 1fr',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.25)', borderBottom: '1px solid rgba(255, 255, 255, 0.25)' }} />
                <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.25)', borderBottom: '1px solid rgba(255, 255, 255, 0.25)' }} />
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.25)' }} />
                <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.25)', borderBottom: '1px solid rgba(255, 255, 255, 0.25)' }} />
                <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.25)', borderBottom: '1px solid rgba(255, 255, 255, 0.25)' }} />
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.25)' }} />
                <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.25)' }} />
                <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.25)' }} />
                <div />
              </div>

              {/* Circular Guide Outline if 1:1 Emblem */}
              {currentAspect === 1 && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '1px dashed rgba(255, 255, 255, 0.45)',
                  pointerEvents: 'none'
                }} />
              )}
            </div>

            {/* Quick Canvas Helper Hint */}
            <div style={{
              marginTop: '12px',
              fontSize: '11px',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Move size={12} />
              <span>Click &amp; drag image to adjust position</span>
            </div>
          </div>

          {/* 4. CONTROLS TOOLBAR */}
          <div style={{ padding: '16px 20px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Zoom Slider Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setScale((prev) => Math.max(0.6, prev - 0.15))}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  cursor: 'pointer'
                }}
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="0.6"
                  max="3"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: '#2563eb',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', width: '36px', textAlign: 'right' }}>
                  {Math.round(scale * 100)}%
                </span>
              </div>

              <button
                type="button"
                onClick={() => setScale((prev) => Math.min(3, prev + 0.15))}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  cursor: 'pointer'
                }}
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
            </div>

            {/* Quick Action Buttons Row */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleRotate}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCw size={13} />
                  <span>Rotate 90°</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <Maximize2 size={13} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Aspect Ratio Presets */}
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentAspect(1);
                    handleReset();
                  }}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: currentAspect === 1 ? '#ffffff' : 'transparent',
                    color: currentAspect === 1 ? '#0f172a' : '#64748b',
                    boxShadow: currentAspect === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  1:1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentAspect(16 / 9);
                    handleReset();
                  }}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: Math.abs(currentAspect - 16 / 9) < 0.1 ? '#ffffff' : 'transparent',
                    color: Math.abs(currentAspect - 16 / 9) < 0.1 ? '#0f172a' : '#64748b',
                    boxShadow: Math.abs(currentAspect - 16 / 9) < 0.1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  16:9
                </button>
              </div>
            </div>
          </div>

          {/* 5. DRAWER BOTTOM ACTION BAR */}
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            gap: '10px',
            backgroundColor: '#ffffff'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: '9999px',
                border: '1.5px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing}
              style={{
                flex: 2,
                padding: '12px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Cropping &amp; Saving...</span>
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  <span>Set &amp; Apply Crop</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
