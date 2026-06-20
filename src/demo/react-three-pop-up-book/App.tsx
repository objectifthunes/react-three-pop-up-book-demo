import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import type { ThreeBook } from '@objectifthunes/react-three-pop-up-book';
import { defaultParams, EMPTY_SLOT, type DemoParams, type ImageSlot, type PageTextBlock } from './state';
import BookScene from './components/BookScene';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import PageEditor from './components/PageEditor';
import PopUpPanel, { type PopUpEntry } from './components/PopUpPanel';
import type { PrimitiveType } from './primitives';

const INITIAL_PAGE_SLOTS = 8;

type Tab = 'book' | 'textures' | 'editor' | 'popups';

export default function App() {
  const [params, setParams] = useState<DemoParams>(defaultParams);
  const [coverSlots, setCoverSlots] = useState<ImageSlot[]>(() => Array.from({ length: 4 }, () => ({ ...EMPTY_SLOT })));
  const [pageSlots, setPageSlots] = useState<ImageSlot[]>(() => Array.from({ length: INITIAL_PAGE_SLOTS }, () => ({ ...EMPTY_SLOT })));
  const [pageTextBlocks, setPageTextBlocks] = useState<PageTextBlock[][]>(() => Array.from({ length: INITIAL_PAGE_SLOTS }, () => []));
  const [coverTextBlocks, setCoverTextBlocks] = useState<PageTextBlock[][]>(() => [[], [], [], []]);
  const [spreadPages, setSpreadPages] = useState<Set<number>>(() => new Set());
  const [status, setStatus] = useState('Building\u2026');
  const [sceneKey, setSceneKey] = useState(0);
  const bookRef = useRef<ThreeBook | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('book');
  const [panelOpen, setPanelOpen] = useState(true);

  // Pop-up state
  const [popUps, setPopUps] = useState<PopUpEntry[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [visiblePage, setVisiblePage] = useState(0);
  const [springEnabled, setSpringEnabled] = useState(true);
  const [addRequest, setAddRequest] = useState<{ type: PrimitiveType; key: number } | null>(null);
  const [updateRequest, setUpdateRequest] = useState<{ id: number; field: string; value: number } | null>(null);
  const [removeRequest, setRemoveRequest] = useState<number | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [turnRequest, setTurnRequest] = useState<'next' | 'prev' | null>(null);
  const addKeyRef = useRef(0);

  const forceRebuild = useCallback(() => {
    setSceneKey((k) => k + 1);
  }, []);

  const setParam = useCallback(<K extends keyof DemoParams>(key: K, value: DemoParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setPageCount = useCallback((count: number) => {
    setParams((prev) => ({ ...prev, pageCount: count }));
    setPageSlots((prev) => {
      if (prev.length >= count) return prev;
      return [...prev, ...Array.from({ length: count - prev.length }, () => ({ ...EMPTY_SLOT }))];
    });
    setPageTextBlocks((prev) => {
      if (prev.length >= count) return prev;
      return [...prev, ...Array.from({ length: count - prev.length }, () => [] as PageTextBlock[])];
    });
  }, []);

  const onBuilt = useCallback((book: ThreeBook) => {
    bookRef.current = book;
    setStatus(`Book built: ${book.paperCount} papers`);
  }, []);

  const onError = useCallback((err: Error) => setStatus(`Error: ${err.message}`), []);

  const onCoverSlotChange = useCallback((i: number, updater: (s: ImageSlot) => ImageSlot) => {
    setCoverSlots((prev) => { const next = [...prev]; next[i] = updater(next[i]); return next; });
  }, []);

  const onPageSlotChange = useCallback((i: number, updater: (s: ImageSlot) => ImageSlot) => {
    setPageSlots((prev) => { const next = [...prev]; next[i] = updater(next[i]); return next; });
  }, []);

  const onPageTextBlocksChange = useCallback((blocks: PageTextBlock[][]) => {
    setPageTextBlocks(blocks);
  }, []);

  const onCoverTextBlocksChange = useCallback((blocks: PageTextBlock[][]) => {
    setCoverTextBlocks(blocks);
  }, []);

  const onSpreadPagesChange = useCallback((next: Set<number>) => {
    setSpreadPages(next);
  }, []);

  useEffect(() => {
    const cleanup = () => {
      for (const slot of pageSlots) {
        if (slot.objectUrl) URL.revokeObjectURL(slot.objectUrl);
      }
      for (const slot of coverSlots) {
        if (slot.objectUrl) URL.revokeObjectURL(slot.objectUrl);
      }
    };
    window.addEventListener('beforeunload', cleanup);
    return () => window.removeEventListener('beforeunload', cleanup);
  });

  useEffect(() => {
    (window as any).__demo = { bookRef };
    return () => { delete (window as any).__demo; };
  }, []);

  return (
    <>
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }} style={{ position: 'fixed', inset: 0 }} gl={{ antialias: true }}>
        <BookScene
          key={sceneKey}
          params={params}
          coverSlots={coverSlots}
          pageSlots={pageSlots}
          pageTextBlocks={pageTextBlocks}
          coverTextBlocks={coverTextBlocks}
          spreadPages={spreadPages}
          bookRef={bookRef}
          onBuilt={onBuilt}
          onError={onError}
          popUps={popUps}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onPopUpsChange={setPopUps}
          visiblePage={visiblePage}
          springEnabled={springEnabled}
          addRequest={addRequest}
          onAddComplete={() => setAddRequest(null)}
          updateRequest={updateRequest}
          onUpdateComplete={() => setUpdateRequest(null)}
          removeRequest={removeRequest}
          onRemoveComplete={() => setRemoveRequest(null)}
          modelFile={modelFile}
          onModelComplete={() => setModelFile(null)}
          turnRequest={turnRequest}
          onTurnComplete={() => setTurnRequest(null)}
        />
      </Canvas>

      {panelOpen ? (
        <div
          className="demo-panel"
          style={{ left: 10, width: 'min(92vw, 380px)' }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="demo-panel-header">
            <div>
              <h1 className="demo-panel-title">react-three-pop-up-book demo</h1>
              <p className="demo-panel-subtitle">
                Drag to turn &middot; right-click + wheel to orbit
              </p>
            </div>
            <button className="demo-close-btn" onClick={() => setPanelOpen(false)} title="Hide panel">
              {'\u2715'}
            </button>
          </div>
          <div className="demo-status">
            {status}
          </div>

          <div className="demo-tab-bar">
            {(['book', 'textures', 'editor', 'popups'] as Tab[]).map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? 'demo-tab demo-tab--active' : 'demo-tab'}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'book' ? 'Book' : tab === 'textures' ? 'Textures' : tab === 'editor' ? 'Editor' : 'Pop-Ups'}
              </button>
            ))}
          </div>

          <div style={{ display: activeTab === 'book' ? 'block' : 'none' }}>
            <LeftPanel params={params} bookRef={bookRef} onParamChange={setParam} onPageCountChange={setPageCount} onRebuild={forceRebuild} />
          </div>
          <div style={{ display: activeTab === 'textures' ? 'block' : 'none' }}>
            <RightPanel params={params} coverSlots={coverSlots} pageSlots={pageSlots} spreadPages={spreadPages} onCoverSlotChange={onCoverSlotChange} onPageSlotChange={onPageSlotChange} onSpreadPagesChange={onSpreadPagesChange} />
          </div>
          <div style={{ display: activeTab === 'editor' ? 'block' : 'none' }}>
            <PageEditor params={params} pageSlots={pageSlots} coverSlots={coverSlots} pageTextBlocks={pageTextBlocks} coverTextBlocks={coverTextBlocks} spreadPages={spreadPages} onPageTextBlocksChange={onPageTextBlocksChange} onCoverTextBlocksChange={onCoverTextBlocksChange} onPageSlotChange={onPageSlotChange} onCoverSlotChange={onCoverSlotChange} />
          </div>
          <div style={{ display: activeTab === 'popups' ? 'block' : 'none' }}>
            <PopUpPanel
              popUps={popUps}
              selectedId={selectedId}
              visiblePage={visiblePage}
              totalPages={params.pageCount}
              springEnabled={springEnabled}
              onSelect={setSelectedId}
              onAdd={(type) => setAddRequest({ type, key: ++addKeyRef.current })}
              onRemove={(id) => setRemoveRequest(id)}
              onUpdate={(id, field, value) => setUpdateRequest({ id, field, value })}
              onLoadModel={setModelFile}
              onSpringChange={setSpringEnabled}
              onPageChange={setVisiblePage}
              onTurnNext={() => setTurnRequest('next')}
              onTurnPrev={() => setTurnRequest('prev')}
              pageWidth={params.pageWidth}
              pageHeight={params.pageHeight}
            />
          </div>
        </div>
      ) : (
        <button className="demo-toggle-btn" onClick={() => setPanelOpen(true)}>
          {'\u2630'} Panel
        </button>
      )}

      <div style={{
        position: 'fixed', bottom: 10, left: '50%', transform: 'translateX(-50%)',
      }} className="demo-info">
        Click + drag pages to turn | Orbit: right-click / scroll | Pop-ups: click to select, drag to move, shift+drag to rotate, wheel to scale
      </div>
    </>
  );
}
