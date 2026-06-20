import { useCallback, useEffect, useRef, useState } from 'react';
import { TextBlock, drawImageWithFit } from '@objectifthunes/react-three-pop-up-book';
import type { DemoParams, ImageSlot, PageTextBlock } from '../state';
import { FONT_OPTIONS, createDefaultTextBlock, PX_PER_UNIT, DEMO_SHADOW_COLOR, DEMO_SHADOW_BLUR, DEFAULT_LINE_HEIGHT, DEFAULT_FONT_SIZE, DEFAULT_TEXT_COLOR } from '../state';

interface PageEditorProps {
  params: DemoParams;
  pageSlots: ImageSlot[];
  coverSlots: ImageSlot[];
  pageTextBlocks: PageTextBlock[][];
  coverTextBlocks: PageTextBlock[][];
  spreadPages: Set<number>;
  onPageTextBlocksChange: (blocks: PageTextBlock[][]) => void;
  onCoverTextBlocksChange: (blocks: PageTextBlock[][]) => void;
  onPageSlotChange: (i: number, updater: (s: ImageSlot) => ImageSlot) => void;
  onCoverSlotChange: (i: number, updater: (s: ImageSlot) => ImageSlot) => void;
}

interface DragState {
  type: 'text' | 'image';
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

const DISPLAY_MAX = 360;
const COVER_LABELS = ['Front Cover Outer', 'Front Cover Inner', 'Back Cover Inner', 'Back Cover Outer'];

const _measureCanvas = document.createElement('canvas');
_measureCanvas.width = 1;
_measureCanvas.height = 1;
const measureCtx = _measureCanvas.getContext('2d')!;

export default function PageEditor({
  params, pageSlots, coverSlots, pageTextBlocks, coverTextBlocks, spreadPages,
  onPageTextBlocksChange, onCoverTextBlocksChange, onPageSlotChange, onCoverSlotChange,
}: PageEditorProps) {
  const [currentSurface, setCurrentSurface] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const dragRef = useRef<DragState | null>(null);

  const totalSurfaces = 4 + params.pageCount;
  const surface = Math.min(currentSurface, totalSurfaces - 1);

  const isCover = surface === 0 || surface === 1 || surface === totalSurfaces - 2 || surface === totalSurfaces - 1;
  const coverIdx = surface <= 1 ? surface : surface === totalSurfaces - 2 ? 2 : 3;
  const pageIdx = surface - 2;

  const isSpread = !isCover && spreadPages.has(pageIdx);
  const isRightOfSpread = !isCover && spreadPages.has(pageIdx - 1);
  const effectivePageIdx = isRightOfSpread ? pageIdx - 1 : pageIdx;
  const isSpreadMode = isSpread || isRightOfSpread;

  const blocks = isCover ? (coverTextBlocks[coverIdx] ?? []) : (pageTextBlocks[effectivePageIdx] ?? []);
  const selected = selectedIdx >= 0 && selectedIdx < blocks.length ? blocks[selectedIdx] : null;

  const surfaceWidth = isCover ? params.coverWidth : params.pageWidth;
  const surfaceHeight = isCover ? params.coverHeight : params.pageHeight;
  const widthMultiplier = isSpreadMode ? 2 : 1;
  const canvasW = Math.round(surfaceWidth * PX_PER_UNIT) * widthMultiplier;
  const canvasH = Math.round(surfaceHeight * PX_PER_UNIT);
  const scale = DISPLAY_MAX / Math.max(canvasW, canvasH);
  const displayW = Math.round(canvasW * scale);
  const displayH = Math.round(canvasH * scale);

  const bgColor = isCover ? params.coverColor : params.pageColor;
  const currentSlot = isCover ? coverSlots[coverIdx] : pageSlots[effectivePageIdx];

  const onCurrentSlotChange = useCallback((updater: (s: ImageSlot) => ImageSlot) => {
    if (isCover) {
      onCoverSlotChange(coverIdx, updater);
    } else {
      onPageSlotChange(effectivePageIdx, updater);
    }
  }, [isCover, coverIdx, effectivePageIdx, onCoverSlotChange, onPageSlotChange]);

  const surfaceLabel = (() => {
    if (isCover) return COVER_LABELS[coverIdx];
    if (isSpreadMode) return `Spread ${effectivePageIdx + 1}\u2013${effectivePageIdx + 2}`;
    return `Page ${pageIdx + 1}`;
  })();

  const blockHeight = useCallback((b: PageTextBlock): number => {
    const tb = new TextBlock({
      text: b.text, x: b.x, y: b.y, width: b.width,
      fontFamily: b.fontFamily || params.bookFont,
      fontSize: b.fontSize, fontWeight: b.fontWeight, fontStyle: b.fontStyle,
      lineHeight: DEFAULT_LINE_HEIGHT,
    });
    return Math.max(tb.measureHeight(measureCtx), b.fontSize * DEFAULT_LINE_HEIGHT);
  }, [params.bookFont]);

  const updatePageBlocks = useCallback((pIdx: number, updater: (b: PageTextBlock[]) => PageTextBlock[]) => {
    const next = [...pageTextBlocks];
    next[pIdx] = updater([...(next[pIdx] ?? [])]);
    onPageTextBlocksChange(next);
  }, [pageTextBlocks, onPageTextBlocksChange]);

  const updateCoverBlocks = useCallback((cIdx: number, updater: (b: PageTextBlock[]) => PageTextBlock[]) => {
    const next = [...coverTextBlocks];
    next[cIdx] = updater([...(next[cIdx] ?? [])]);
    onCoverTextBlocksChange(next);
  }, [coverTextBlocks, onCoverTextBlocksChange]);

  const updateBlocks = useCallback((updater: (b: PageTextBlock[]) => PageTextBlock[]) => {
    if (isCover) {
      updateCoverBlocks(coverIdx, updater);
    } else {
      updatePageBlocks(effectivePageIdx, updater);
    }
  }, [isCover, coverIdx, effectivePageIdx, updatePageBlocks, updateCoverBlocks]);

  const updateSelected = useCallback((patch: Partial<PageTextBlock>) => {
    if (selectedIdx < 0) return;
    updateBlocks((arr) => {
      const copy = [...arr];
      copy[selectedIdx] = { ...copy[selectedIdx], ...patch };
      return copy;
    });
  }, [selectedIdx, updateBlocks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const isDraggingImage = () => dragRef.current?.type === 'image';

    function draw() {
      canvas!.width = displayW;
      canvas!.height = displayH;
      ctx.clearRect(0, 0, displayW, displayH);

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, displayW, displayH);

      const slot = currentSlot;
      if (slot?.useImage && slot.image) {
        ctx.save();
        ctx.scale(scale, scale);
        if (slot.imageRect) {
          ctx.drawImage(slot.image, slot.imageRect.x, slot.imageRect.y, slot.imageRect.width, slot.imageRect.height);
        } else {
          const imgW = canvasW;
          const imgH = canvasH;
          const margin = slot.fullBleed ? 0 : Math.round(Math.min(imgW, imgH) * 0.11);
          drawImageWithFit(ctx, slot.image, margin, margin, imgW - margin * 2, imgH - margin * 2, slot.fitMode);
        }
        ctx.restore();
      }

      if (isDraggingImage() && currentSlot?.imageRect) {
        const ir = currentSlot.imageRect;
        ctx.save();
        ctx.strokeStyle = 'rgba(137,216,176,0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(ir.x * scale, ir.y * scale, ir.width * scale, ir.height * scale);
        ctx.restore();
      }

      ctx.save();
      ctx.scale(scale, scale);
      for (const b of blocks) {
        if (!b.text) continue;
        const tb = new TextBlock({
          text: b.text, x: b.x, y: b.y, width: b.width,
          fontFamily: b.fontFamily || params.bookFont,
          fontSize: b.fontSize, fontWeight: b.fontWeight, fontStyle: b.fontStyle,
          color: b.color, textAlign: b.textAlign, lineHeight: DEFAULT_LINE_HEIGHT,
          shadowColor: DEMO_SHADOW_COLOR, shadowBlur: DEMO_SHADOW_BLUR,
        });
        tb.draw(ctx);
      }
      ctx.restore();

      if (isSpreadMode) {
        ctx.save();
        ctx.strokeStyle = 'rgba(236,242,255,0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(displayW / 2, 0);
        ctx.lineTo(displayW / 2, displayH);
        ctx.stroke();
        ctx.restore();
      }

      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const bw = b.width > 0 ? b.width : 200;
        const bh = blockHeight(b);
        const sx = b.x * scale;
        const sy = b.y * scale;
        const sw = bw * scale;
        const sh = bh * scale;

        ctx.save();
        const active = i === selectedIdx;
        ctx.strokeStyle = active ? '#89d8b0' : 'rgba(236,242,255,0.4)';
        ctx.lineWidth = active ? 2 : 1;
        if (!active) ctx.setLineDash([3, 3]);
        ctx.strokeRect(sx, sy, sw, sh);
        ctx.restore();

        ctx.save();
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = active ? '#89d8b0' : 'rgba(236,242,255,0.5)';
        ctx.fillText(`T${i + 1}`, sx + 3, sy + 10);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [blocks, selectedIdx, bgColor, params.bookFont, displayW, displayH, scale, surface, effectivePageIdx, isSpreadMode, isCover, blockHeight, pageSlots, coverSlots, currentSlot, canvasW, canvasH]);

  const toCanvas = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
  }, [scale]);

  const hitTest = useCallback((cx: number, cy: number): number => {
    for (let i = blocks.length - 1; i >= 0; i--) {
      const b = blocks[i];
      const bw = b.width > 0 ? b.width : 200;
      const bh = blockHeight(b);
      if (cx >= b.x && cx <= b.x + bw && cy >= b.y && cy <= b.y + bh) return i;
    }
    return -1;
  }, [blocks, blockHeight]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const cv = toCanvas(e);
    const hit = hitTest(cv.x, cv.y);
    if (hit >= 0) {
      setSelectedIdx(hit);
      const b = blocks[hit];
      dragRef.current = { type: 'text', startX: cv.x, startY: cv.y, originX: b.x, originY: b.y };
      canvasRef.current!.style.cursor = 'grabbing';
      canvasRef.current?.setPointerCapture(e.pointerId);
      e.stopPropagation();
      return;
    }
    setSelectedIdx(-1);
    const slot = currentSlot;
    if (slot?.useImage && slot.image && slot.imageRect) {
      const ir = slot.imageRect;
      dragRef.current = { type: 'image', startX: cv.x, startY: cv.y, originX: ir.x, originY: ir.y };
      canvasRef.current!.style.cursor = 'grabbing';
      canvasRef.current?.setPointerCapture(e.pointerId);
    }
    e.stopPropagation();
  }, [toCanvas, hitTest, blocks, currentSlot]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (drag) {
      const cv = toCanvas(e);
      const dx = cv.x - drag.startX;
      const dy = cv.y - drag.startY;
      if (drag.type === 'image') {
        const newX = drag.originX + dx;
        const newY = drag.originY + dy;
        onCurrentSlotChange((s) => {
          if (!s.imageRect) return s;
          return { ...s, imageRect: { ...s.imageRect, x: newX, y: newY } };
        });
      } else if (drag.type === 'text' && selectedIdx >= 0) {
        updateSelected({
          x: Math.max(-canvasW + 40, Math.min(canvasW - 40, drag.originX + dx)),
          y: Math.max(-canvasH + 40, Math.min(canvasH - 40, drag.originY + dy)),
        });
      }
    } else {
      const cv = toCanvas(e);
      const hit = hitTest(cv.x, cv.y);
      if (hit >= 0) {
        canvasRef.current!.style.cursor = 'grab';
        return;
      }
      if (currentSlot?.useImage && currentSlot.image && currentSlot.imageRect) {
        canvasRef.current!.style.cursor = 'move';
        return;
      }
      canvasRef.current!.style.cursor = 'default';
    }
  }, [toCanvas, selectedIdx, canvasW, canvasH, updateSelected, onCurrentSlotChange, hitTest, currentSlot]);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'default';
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function onWheel(e: WheelEvent) {
      const slot = currentSlot;
      if (!slot?.useImage || !slot.image || !slot.imageRect) return;
      e.preventDefault();
      const rect = canvas!.getBoundingClientRect();
      const cursorX = (e.clientX - rect.left) / scale;
      const cursorY = (e.clientY - rect.top) / scale;
      const factor = e.deltaY > 0 ? 0.90 : 1.10;
      onCurrentSlotChange((s) => {
        if (!s.imageRect) return s;
        const ir = s.imageRect;
        const newW = ir.width * factor;
        const newH = ir.height * factor;
        const newX = cursorX - (cursorX - ir.x) * factor;
        const newY = cursorY - (cursorY - ir.y) * factor;
        return { ...s, imageRect: { x: newX, y: newY, width: newW, height: newH } };
      });
    }
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [currentSlot, onCurrentSlotChange, scale]);

  useEffect(() => {
    setSelectedIdx(-1);
  }, [surface]);

  return (
    <>
      <div className="demo-page-nav">
        <button className="demo-btn" onClick={() => { if (surface > 0) setCurrentSurface(surface - 1); }}>{'\u25C0'}</button>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 12, textAlign: 'center' }}>
          {surfaceLabel} <span className="demo-page-count">({surface + 1}/{totalSurfaces})</span>
        </span>
        <button className="demo-btn" onClick={() => { if (surface < totalSurfaces - 1) setCurrentSurface(surface + 1); }}>{'\u25B6'}</button>
      </div>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
        <select
          value={selected?.fontFamily ?? ''}
          className="demo-select demo-select--mini"
          style={{ flex: 1, minWidth: 0 }}
          onChange={(e) => updateSelected({ fontFamily: e.target.value })}
          disabled={!selected}
        >
          <option value="">Book default</option>
          {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <input
          type="number" min={8} max={120}
          value={selected?.fontSize ?? DEFAULT_FONT_SIZE}
          className="demo-select demo-select--mini"
          style={{ width: 52 }}
          onChange={(e) => updateSelected({ fontSize: parseInt(e.target.value, 10) || DEFAULT_FONT_SIZE })}
          disabled={!selected}
        />
      </div>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 8 }}>
        <button
          className={selected?.fontWeight === 'bold' ? 'demo-btn demo-btn--active' : 'demo-btn'}
          style={{ fontWeight: 'bold', width: 32, padding: '4px 0' }}
          onClick={() => updateSelected({ fontWeight: selected?.fontWeight === 'bold' ? 'normal' : 'bold' })}
          disabled={!selected}
        >B</button>
        <button
          className={selected?.fontStyle === 'italic' ? 'demo-btn demo-btn--active' : 'demo-btn'}
          style={{ fontStyle: 'italic', width: 32, padding: '4px 0' }}
          onClick={() => updateSelected({ fontStyle: selected?.fontStyle === 'italic' ? 'normal' : 'italic' })}
          disabled={!selected}
        >I</button>
        <div style={{ width: 32, height: 28, borderRadius: 6, border: '1px solid rgba(236,242,255,0.22)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)' }}>
          <input
            type="color" value={selected?.color ?? DEFAULT_TEXT_COLOR}
            style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer', margin: -6 }}
            onChange={(e) => updateSelected({ color: e.target.value })}
            disabled={!selected}
          />
        </div>
        <div style={{ width: 1, height: 20, background: 'rgba(236,242,255,0.12)', margin: '0 2px' }} />
        {(['left', 'center', 'right'] as const).map((a) => (
          <button
            key={a}
            className={selected?.textAlign === a ? 'demo-btn demo-btn--active' : 'demo-btn'}
            style={{ width: 32, padding: '4px 0' }}
            onClick={() => updateSelected({ textAlign: a })}
            disabled={!selected}
            title={a}
          >
            {a === 'left' ? '\u2190' : a === 'center' ? '\u2194' : '\u2192'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          className="demo-btn"
          style={{ padding: '4px 8px', fontSize: 11, opacity: selectedIdx < 0 ? 0.35 : 1 }}
          disabled={selectedIdx < 0}
          onClick={() => {
            updateBlocks((arr) => arr.filter((_, j) => j !== selectedIdx));
            setSelectedIdx(-1);
          }}
        >{'\u2715'}</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <canvas
          ref={canvasRef}
          width={displayW}
          height={displayH}
          className="demo-editor-canvas"
          style={{ maxWidth: '100%' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button
          className="demo-btn demo-btn--block"
          onClick={() => {
            const w = isCover ? params.coverWidth : (isSpreadMode ? params.pageWidth * 2 : params.pageWidth);
            const h = isCover ? params.coverHeight : params.pageHeight;
            updateBlocks((arr) => [...arr, createDefaultTextBlock(w, h)]);
            setSelectedIdx(blocks.length);
          }}
        >+ Add Text</button>
      </div>

      <textarea
        rows={3}
        placeholder="Select a text block, then type here\u2026"
        value={selected?.text ?? ''}
        disabled={!selected}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '6px 8px',
          borderRadius: 6, border: '1px solid rgba(236,242,255,0.18)',
          background: 'rgba(255,255,255,0.06)', color: '#eef4ff',
          fontFamily: 'inherit', fontSize: 12, resize: 'vertical',
          opacity: !selected ? 0.4 : 1,
        }}
        onChange={(e) => updateSelected({ text: e.target.value })}
      />
    </>
  );
}
