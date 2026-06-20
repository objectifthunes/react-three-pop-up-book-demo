import { useCallback } from 'react';
import { drawImageWithFit, loadImage, getSpreadPairs, computeDefaultImageRect } from '@objectifthunes/react-three-pop-up-book';
import type { ImageSlot, ImageFitMode, DemoParams } from '../state';
import { PX_PER_UNIT } from '../state';
import { SectionTitle } from '@objectifthunes/react-three-book/demo-kit';

interface RightPanelProps {
  params: DemoParams;
  coverSlots: ImageSlot[];
  pageSlots: ImageSlot[];
  spreadPages: Set<number>;
  onCoverSlotChange: (index: number, updater: (slot: ImageSlot) => ImageSlot) => void;
  onPageSlotChange: (index: number, updater: (slot: ImageSlot) => ImageSlot) => void;
  onSpreadPagesChange: (next: Set<number>) => void;
}

function renderThumbnail(slot: ImageSlot, color: string, aspectW: number, aspectH: number): string {
  const thumbH = 64;
  const thumbW = Math.round(thumbH * (aspectW / aspectH));
  const canvas = document.createElement('canvas');
  canvas.width = thumbW * 2;
  canvas.height = thumbH * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (slot.useImage && slot.image) {
    const m = slot.fullBleed ? 0 : Math.round(Math.min(canvas.width, canvas.height) * 0.11);
    drawImageWithFit(ctx, slot.image, m, m, canvas.width - m * 2, canvas.height - m * 2, slot.fitMode);
  }
  return canvas.toDataURL();
}

interface TextureCardProps {
  label: string; slot: ImageSlot; bgColor: string;
  aspectW: number; aspectH: number;
  onFitModeChange: (mode: ImageFitMode) => void;
  onFullBleedChange: (v: boolean) => void;
  onClear: () => void;
  onFileChange: (file: File | null) => void;
}

function TextureCard({ label, slot, bgColor, aspectW, aspectH, onFitModeChange, onFullBleedChange, onClear, onFileChange }: TextureCardProps) {
  const thumbH = 64;
  const thumbW = Math.round(thumbH * (aspectW / aspectH));
  return (
    <div className="demo-card">
      <div className="demo-card-row">
        <img src={renderThumbnail(slot, bgColor, aspectW, aspectH)} alt={label} className="demo-thumb" style={{ width: thumbW, height: thumbH }} />
        <div className="demo-card-body">
          <div className="demo-card-label">{label}</div>
          <div className="demo-card-controls">
            <select value={slot.fitMode} className="demo-select demo-select--mini" onChange={(e) => onFitModeChange(e.target.value as ImageFitMode)}>
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
              <option value="fill">Fill</option>
            </select>
            <label className="demo-inline-label">
              <input type="checkbox" checked={slot.fullBleed} className="demo-checkbox--sm" onChange={(e) => onFullBleedChange(e.target.checked)} />
              Bleed
            </label>
            <button type="button" className="demo-btn" onClick={onClear}>Clear</button>
          </div>
          <input type="file" accept="image/*" className="demo-file-input" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
        </div>
      </div>
    </div>
  );
}

export default function RightPanel({ params, coverSlots, pageSlots, spreadPages, onCoverSlotChange, onPageSlotChange, onSpreadPagesChange }: RightPanelProps) {
  const coverLabels = ['Front Outer', 'Front Inner', 'Back Inner', 'Back Outer'];

  const canvasDims = useCallback((index: number, onSlotChange: typeof onCoverSlotChange) => {
    const isCover = onSlotChange === onCoverSlotChange;
    const isSpread = !isCover && spreadPages.has(index);
    const w = isCover ? params.coverWidth : params.pageWidth;
    const h = isCover ? params.coverHeight : params.pageHeight;
    const canvasW = Math.round(w * PX_PER_UNIT) * (isSpread ? 2 : 1);
    const canvasH = Math.round(h * PX_PER_UNIT);
    return { canvasW, canvasH };
  }, [params.coverWidth, params.coverHeight, params.pageWidth, params.pageHeight, spreadPages, onCoverSlotChange]);

  const makeHandlers = useCallback((index: number, onSlotChange: (i: number, u: (s: ImageSlot) => ImageSlot) => void, slot: ImageSlot) => ({
    onFitModeChange: (mode: ImageFitMode) => onSlotChange(index, (s) => {
      const updated = { ...s, fitMode: mode };
      if (s.image && s.useImage) {
        const { canvasW, canvasH } = canvasDims(index, onSlotChange);
        updated.imageRect = computeDefaultImageRect(s.image, canvasW, canvasH, mode, s.fullBleed);
      }
      return updated;
    }),
    onFullBleedChange: (fullBleed: boolean) => onSlotChange(index, (s) => {
      const updated = { ...s, fullBleed };
      if (s.image && s.useImage) {
        const { canvasW, canvasH } = canvasDims(index, onSlotChange);
        updated.imageRect = computeDefaultImageRect(s.image, canvasW, canvasH, s.fitMode, fullBleed);
      }
      return updated;
    }),
    onClear: () => {
      if (slot.objectUrl) URL.revokeObjectURL(slot.objectUrl);
      onSlotChange(index, () => ({ ...slot, image: null, objectUrl: null, useImage: false, imageRect: null }));
    },
    onFileChange: async (file: File | null) => {
      const result = await loadImage(file);
      if (!result) return;
      if (slot.objectUrl) URL.revokeObjectURL(slot.objectUrl);
      const { canvasW, canvasH } = canvasDims(index, onSlotChange);
      const imageRect = computeDefaultImageRect(result.image, canvasW, canvasH, slot.fitMode, slot.fullBleed);
      onSlotChange(index, () => ({ ...slot, image: result.image, objectUrl: result.objectUrl, useImage: true, imageRect }));
    },
  }), [canvasDims]);

  const eligibleSpreads = new Set(getSpreadPairs(params.pageCount));

  const pageCards: React.ReactNode[] = [];
  for (let i = 0; i < params.pageCount; i++) {
    const isSpread = spreadPages.has(i);
    const isRightOfSpread = spreadPages.has(i - 1);

    if (isRightOfSpread) continue;

    if (eligibleSpreads.has(i)) {
      pageCards.push(
        <label key={`spread-${i}`} className="demo-spread-toggle">
          <input
            type="checkbox"
            checked={isSpread}
            className="demo-spread-checkbox"
            onChange={(e) => {
              const next = new Set(spreadPages);
              if (e.target.checked) next.add(i); else next.delete(i);
              onSpreadPagesChange(next);
            }}
          />
          Double-page spread: Pages {i + 1}\u2013{i + 2}
        </label>,
      );
    }

    const slot = pageSlots[i];
    const label = isSpread ? `Spread ${i + 1}\u2013${i + 2}` : `Page ${i + 1}`;
    const aspectW = isSpread ? params.pageWidth * 2 : params.pageWidth;
    pageCards.push(
      <TextureCard
        key={`page-${i}`}
        label={label}
        slot={slot}
        bgColor={params.pageColor}
        aspectW={aspectW}
        aspectH={params.pageHeight}
        {...makeHandlers(i, onPageSlotChange, slot)}
      />,
    );
  }

  return (
    <>
      <SectionTitle text="Cover Textures" />
      {coverSlots.map((slot, i) => <TextureCard key={i} label={coverLabels[i]} slot={slot} bgColor={params.coverColor} aspectW={params.coverWidth} aspectH={params.coverHeight} {...makeHandlers(i, onCoverSlotChange, slot)} />)}
      <SectionTitle text="Page Textures" />
      {pageCards}
    </>
  );
}
