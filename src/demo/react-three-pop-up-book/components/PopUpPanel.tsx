import { useState } from 'react';
import type { PopUpElement } from '@objectifthunes/react-three-pop-up-book';
import { SectionTitle, Slider, Checkbox } from '@objectifthunes/react-three-book/demo-kit';
import { PRIMITIVE_OPTIONS, type PrimitiveType } from '../primitives';

export interface PopUpEntry {
  id: number;
  element: PopUpElement;
  type: PrimitiveType;
  displayName?: string;
  pageIndex: number;
}

interface PopUpPanelProps {
  popUps: PopUpEntry[];
  selectedId: number | null;
  visiblePage: number;
  totalPages: number;
  springEnabled: boolean;
  onSelect: (id: number | null) => void;
  onAdd: (type: PrimitiveType) => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: string, value: number) => void;
  onLoadModel: (file: File) => void;
  onSpringChange: (enabled: boolean) => void;
  onPageChange: (page: number) => void;
  onTurnNext: () => void;
  onTurnPrev: () => void;
  pageWidth: number;
  pageHeight: number;
}

export default function PopUpPanel({
  popUps, selectedId, visiblePage, totalPages,
  springEnabled, onSelect, onAdd, onRemove, onUpdate,
  onLoadModel, onSpringChange, onPageChange, onTurnNext, onTurnPrev,
  pageWidth, pageHeight,
}: PopUpPanelProps) {
  const [addType, setAddType] = useState<PrimitiveType>('cube');
  const pagePopUps = popUps.filter((p) => p.pageIndex === visiblePage);
  const selected = popUps.find((p) => p.id === selectedId);

  return (
    <>
      <div className="demo-page-nav">
        <button className="demo-btn" onClick={() => { if (visiblePage > 0) { onPageChange(visiblePage - 1); onTurnPrev(); } }}>{'\u25C0'} Prev</button>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 12, textAlign: 'center' }}>
          Page {visiblePage + 1} / {totalPages}
        </span>
        <button className="demo-btn" onClick={() => { if (visiblePage < totalPages - 1) { onPageChange(visiblePage + 1); onTurnNext(); } }}>Next {'\u25B6'}</button>
      </div>

      <Checkbox label="Spring Animation" value={springEnabled} onChange={onSpringChange} />

      <SectionTitle text="Add Pop-Up" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <select
          value={addType}
          className="demo-select demo-select--mini"
          style={{ flex: 1 }}
          onChange={(e) => setAddType(e.target.value as PrimitiveType)}
        >
          {PRIMITIVE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button className="demo-btn" style={{ background: 'rgba(137,216,176,0.2)', borderColor: 'rgba(137,216,176,0.4)' }} onClick={() => onAdd(addType)}>+ Add</button>
      </div>

      <SectionTitle text="Or Load 3D Model" />
      <input
        type="file"
        accept=".glb,.gltf"
        className="demo-file-input"
        style={{ display: 'block', marginBottom: 8 }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { onLoadModel(f); e.target.value = ''; }
        }}
      />

      <SectionTitle text={`Pop-Ups on This Page (${pagePopUps.length})`} />
      {pagePopUps.length === 0 && (
        <div style={{ fontSize: 12, color: '#666', padding: '4px 0' }}>No pop-ups on this page. Add one above.</div>
      )}
      {pagePopUps.map((entry) => {
        const isSelected = entry.id === selectedId;
        return (
          <div
            key={entry.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 8px', margin: '2px 0', borderRadius: 4, cursor: 'pointer',
              background: isSelected ? 'rgba(137,216,176,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isSelected ? 'rgba(137,216,176,0.3)' : 'transparent'}`,
            }}
            onClick={() => onSelect(isSelected ? null : entry.id)}
          >
            <span style={{ fontSize: 13 }}>{entry.displayName || entry.type} #{entry.id}</span>
            <span
              style={{ cursor: 'pointer', color: '#888', fontSize: 16, padding: '0 4px' }}
              onClick={(e) => { e.stopPropagation(); onRemove(entry.id); }}
            >&times;</span>
          </div>
        );
      })}

      {selected && (
        <>
          <SectionTitle text={`Selected: ${selected.displayName || selected.type} #${selected.id}`} />
          <Slider label="X Position" min={0} max={pageWidth} step={0.01} value={selected.element.x} onChange={(v) => onUpdate(selected.id, 'x', v)} />
          <Slider label="Z Position" min={0} max={pageHeight} step={0.01} value={selected.element.z} onChange={(v) => onUpdate(selected.id, 'z', v)} />
          <Slider label="Scale" min={0.1} max={3} step={0.05} value={selected.element.scale} onChange={(v) => onUpdate(selected.id, 'scale', v)} />
          <Slider label="Rotation (\u00B0)" min={0} max={360} step={1} value={Math.round((selected.element.rotation * 180) / Math.PI)} onChange={(v) => onUpdate(selected.id, 'rotation', (v * Math.PI) / 180)} />
          <button
            className="demo-btn--rebuild"
            style={{ background: 'rgba(200,50,50,0.2)', borderColor: 'rgba(200,50,50,0.4)', marginTop: 8 }}
            onClick={() => onRemove(selected.id)}
          >Remove Selected</button>
        </>
      )}
    </>
  );
}
