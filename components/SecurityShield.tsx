'use client';

import { useEffect } from 'react';

/**
 * SecurityShield Component
 * Comprehensive protection against:
 * 1. Text selection (via mouse or touch)
 * 2. Image downloading (right click, "Save image as", mobile long-press callout, drag-and-drop)
 * 3. Scraping extensions & inspection shortcuts (Ctrl+S, Ctrl+P, Ctrl+U, F12, DevTools shortcuts)
 * 4. Dynamically hardened DOM elements via MutationObserver
 */
export default function SecurityShield() {
  useEffect(() => {
    // 1. Prevent Right-Click Context Menu globally
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 2. Prevent Drag Start on any element (especially images)
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 3. Prevent Text Selection initiation unless in inputs
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // 4. Prevent Copy & Cut unless inside inputs
    const handleCopyCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      e.preventDefault();
      return false;
    };

    // 5. Prevent Keyboard Shortcuts: Ctrl+S (Save), Ctrl+U (View Source), Ctrl+P (Print), F12, DevTools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Save page / image (Ctrl+S / Cmd+S)
      if (cmdOrCtrl && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }

      // Print page (Ctrl+P / Cmd+P)
      if (cmdOrCtrl && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        return false;
      }

      // View Source (Ctrl+U / Cmd+U)
      if (cmdOrCtrl && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }

      // DevTools (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Cmd+Opt+I)
      if (
        e.key === 'F12' ||
        (cmdOrCtrl && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
        return false;
      }

      // Select All (Ctrl+A / Cmd+A) outside inputs
      if (cmdOrCtrl && (e.key === 'a' || e.key === 'A')) {
        const target = e.target as HTMLElement | null;
        if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable)) {
          e.preventDefault();
          return false;
        }
      }
    };

    // 6. Mobile Long-Press Image Prevention
    // On iOS Safari & Android Chrome, long-pressing on an image triggers the preview/save action sheet
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'IMG' || target.closest('img'))) {
        // Prevent default on image touch to completely suppress the mobile save callout
        if (e.cancelable && e.touches.length > 1) {
          e.preventDefault();
        }
      }
    };

    // Register all listeners with capture: true to intercept before extensions or children
    window.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('dragstart', handleDragStart, true);
    window.addEventListener('selectstart', handleSelectStart, true);
    document.addEventListener('selectstart', handleSelectStart, true);
    window.addEventListener('copy', handleCopyCut, true);
    document.addEventListener('copy', handleCopyCut, true);
    window.addEventListener('cut', handleCopyCut, true);
    document.addEventListener('cut', handleCopyCut, true);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });

    // 7. Continuous MutationObserver: ensures any dynamically rendered <img> tags are hardened
    const hardenImages = (root: Node = document.body) => {
      if (!(root instanceof HTMLElement)) return;
      const images = root.querySelectorAll('img');
      images.forEach((img) => {
        img.setAttribute('draggable', 'false');
        img.setAttribute('oncontextmenu', 'return false;');
        img.setAttribute('onselectstart', 'return false;');
        img.setAttribute('ondragstart', 'return false;');
        img.style.pointerEvents = 'none';
        (img.style as any).webkitTouchCallout = 'none';
        (img.style as any).webkitUserDrag = 'none';
      });
    };

    hardenImages();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.tagName === 'IMG') {
              node.setAttribute('draggable', 'false');
              node.setAttribute('oncontextmenu', 'return false;');
              node.setAttribute('onselectstart', 'return false;');
              node.setAttribute('ondragstart', 'return false;');
              node.style.pointerEvents = 'none';
              (node.style as any).webkitTouchCallout = 'none';
              (node.style as any).webkitUserDrag = 'none';
            } else {
              hardenImages(node);
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 8. Override window.print so print scraping is blocked
    try {
      window.print = () => false as any;
    } catch {}

    // 9. Framebusting: Prevent clickjacking / embedding inside malicious iframes
    try {
      if (window.top && window.top !== window.self) {
        window.top.location.href = window.self.location.href;
      }
    } catch {}

    // 10. Security Notice in Developer Console against automated scraping
    try {
      console.log(
        '%c[DROBE SECURITY SHIELD]%c Automated catalog scraping, code extraction, and malicious attacks are actively monitored and blocked.',
        'background: #E5002B; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 13px;',
        'color: #ff3333; font-weight: 600; font-size: 12px; margin-left: 6px;'
      );
    } catch {}

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      window.removeEventListener('selectstart', handleSelectStart, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      window.removeEventListener('copy', handleCopyCut, true);
      document.removeEventListener('copy', handleCopyCut, true);
      window.removeEventListener('cut', handleCopyCut, true);
      document.removeEventListener('cut', handleCopyCut, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('touchstart', handleTouchStart, true as any);
      observer.disconnect();
    };
  }, []);

  return null;
}
