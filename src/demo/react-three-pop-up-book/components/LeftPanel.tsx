import type { RefObject } from 'react';
import type { ThreeBook } from '@objectifthunes/react-three-pop-up-book';
import type { DemoParams } from '../state';
import {
  SectionTitle,
  Slider,
  ColorPicker,
  Checkbox,
  Select,
  FONT_OPTIONS,
} from '@objectifthunes/react-three-book/demo-kit';

interface LeftPanelProps {
  params: DemoParams;
  bookRef: RefObject<ThreeBook | null>;
  onParamChange: <K extends keyof DemoParams>(key: K, value: DemoParams[K]) => void;
  onPageCountChange: (count: number) => void;
  onRebuild: () => void;
}

export default function LeftPanel({
  params,
  bookRef,
  onParamChange,
  onPageCountChange,
  onRebuild,
}: LeftPanelProps) {
  return (
    <>
      <SectionTitle text="Page Paper" />

      <Slider label="Width"     min={1}     max={5}    step={0.1}   value={params.pageWidth}     onChange={(v) => onParamChange('pageWidth', v)} />
      <Slider label="Height"    min={1}     max={5}    step={0.1}   value={params.pageHeight}    onChange={(v) => onParamChange('pageHeight', v)} />
      <Slider label="Thickness" min={0.005} max={0.1}  step={0.001} value={params.pageThickness} onChange={(v) => onParamChange('pageThickness', v)} />
      <Slider label="Stiffness" min={0}     max={1}    step={0.01}  value={params.pageStiffness} onChange={(v) => onParamChange('pageStiffness', v)} />
      <Slider
        label="Count"
        min={2} max={40} step={1}
        value={params.pageCount}
        onChange={(v) => onPageCountChange(Math.max(2, Math.floor(v)))}
      />
      <ColorPicker label="Page Color" value={params.pageColor} onChange={(v) => onParamChange('pageColor', v)} />
      <Select
        label="Book Font"
        value={params.bookFont}
        options={FONT_OPTIONS.map((f) => ({ value: f, label: f }))}
        onChange={(v) => onParamChange('bookFont', v)}
      />

      <SectionTitle text="Cover Paper" />

      <Slider label="Width"     min={1}     max={5}    step={0.1}   value={params.coverWidth}     onChange={(v) => onParamChange('coverWidth', v)} />
      <Slider label="Height"    min={1}     max={5}    step={0.1}   value={params.coverHeight}    onChange={(v) => onParamChange('coverHeight', v)} />
      <Slider label="Thickness" min={0.005} max={0.15} step={0.001} value={params.coverThickness} onChange={(v) => onParamChange('coverThickness', v)} />
      <Slider label="Stiffness" min={0}     max={1}    step={0.01}  value={params.coverStiffness} onChange={(v) => onParamChange('coverStiffness', v)} />
      <ColorPicker label="Cover Color" value={params.coverColor} onChange={(v) => onParamChange('coverColor', v)} />

      <SectionTitle text="Book" />

      <Select
        label="Direction"
        value={params.direction}
        options={[
          { value: 'left-to-right', label: 'Left to Right' },
          { value: 'right-to-left', label: 'Right to Left' },
          { value: 'up-to-down',    label: 'Up to Down' },
          { value: 'down-to-up',    label: 'Down to Up' },
        ]}
        onChange={(v) => onParamChange('direction', v as DemoParams['direction'])}
      />

      <Slider
        label="Open Progress"
        min={0} max={1} step={0.01}
        value={params.openProgress}
        onChange={(v) => {
          onParamChange('openProgress', v);
          bookRef.current?.setOpenProgress(v);
        }}
      />

      <Checkbox label="Cast Shadows"       value={params.castShadows}    onChange={(v) => onParamChange('castShadows', v)} />
      <Checkbox label="Align To Ground"    value={params.alignToGround}  onChange={(v) => onParamChange('alignToGround', v)} />
      <Checkbox label="Hide Binder"        value={params.hideBinder}     onChange={(v) => onParamChange('hideBinder', v)} />
      <Checkbox label="Reduce Shadows"     value={params.reduceShadows}  onChange={(v) => onParamChange('reduceShadows', v)} />
      <Checkbox label="Reduce Sub Meshes"  value={params.reduceSubMeshes} onChange={(v) => onParamChange('reduceSubMeshes', v)} />
      <Checkbox label="Reduce Overdraw"    value={params.reduceOverdraw} onChange={(v) => onParamChange('reduceOverdraw', v)} />
      <Checkbox
        label="Interactive Turning"
        value={params.interactive}
        onChange={(v) => onParamChange('interactive', v)}
      />

      <button
        onClick={onRebuild}
        className="demo-btn--rebuild"
      >
        Force Rebuild
      </button>

      <SectionTitle text="Lighting" />

      <Slider label="Sun Intensity"     min={0} max={6}   step={0.1}  value={params.sunIntensity}     onChange={(v) => onParamChange('sunIntensity', v)} />
      <Slider label="Ambient Intensity" min={0} max={2}   step={0.05} value={params.ambientIntensity} onChange={(v) => onParamChange('ambientIntensity', v)} />
      <Slider label="Sun X"             min={-12} max={12} step={0.1} value={params.sunX}             onChange={(v) => onParamChange('sunX', v)} />
      <Slider label="Sun Y"             min={1}   max={20} step={0.1} value={params.sunY}             onChange={(v) => onParamChange('sunY', v)} />
      <Slider label="Sun Z"             min={-12} max={12} step={0.1} value={params.sunZ}             onChange={(v) => onParamChange('sunZ', v)} />
    </>
  );
}
