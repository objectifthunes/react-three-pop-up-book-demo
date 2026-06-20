import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Book,
  BookInteraction,
  StapleBookBinding,
  Cover,
  Page,
  Spread,
  Text,
  ThreeBook,
  AutoTurnSettings,
  PopUpBook,
  PopUpScene,
  type PopUpElement,
} from '@objectifthunes/react-three-pop-up-book';
import { toBookDirection, DEMO_SHADOW_COLOR, DEMO_SHADOW_BLUR } from '@objectifthunes/react-three-book/demo-kit';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { DemoParams, ImageSlot, PageTextBlock } from '../state';
import { createPrimitive, type PrimitiveType } from '../primitives';
import type { PopUpEntry } from './PopUpPanel';

interface BookSceneProps {
  params: DemoParams;
  coverSlots: ImageSlot[];
  pageSlots: ImageSlot[];
  pageTextBlocks: PageTextBlock[][];
  coverTextBlocks: PageTextBlock[][];
  spreadPages: Set<number>;
  bookRef: React.MutableRefObject<ThreeBook | null>;
  onBuilt: (book: ThreeBook) => void;
  onError: (err: Error) => void;
  // Pop-up props
  popUps: PopUpEntry[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onPopUpsChange: (popUps: PopUpEntry[]) => void;
  visiblePage: number;
  springEnabled: boolean;
  addRequest: { type: PrimitiveType; key: number } | null;
  onAddComplete: () => void;
  updateRequest: { id: number; field: string; value: number } | null;
  onUpdateComplete: () => void;
  removeRequest: number | null;
  onRemoveComplete: () => void;
  modelFile: File | null;
  onModelComplete: () => void;
  turnRequest: 'next' | 'prev' | null;
  onTurnComplete: () => void;
}

function setHighlight(element: PopUpElement, on: boolean) {
  element.object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh && mesh.material) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.emissive) mat.emissive.set(on ? '#334' : '#000');
    }
  });
}

export default function BookScene({
  params, coverSlots, pageSlots, pageTextBlocks, coverTextBlocks, spreadPages,
  bookRef, onBuilt, onError,
  popUps, selectedId, onSelect, onPopUpsChange, visiblePage, springEnabled,
  addRequest, onAddComplete, updateRequest, onUpdateComplete,
  removeRequest, onRemoveComplete, modelFile, onModelComplete,
  turnRequest, onTurnComplete,
}: BookSceneProps) {
  const { camera, gl } = useThree();
  const orbitRef = useRef<any>(null);
  const binding = useMemo(() => new StapleBookBinding(), []);
  const popUpBookRef = useRef<PopUpBook | null>(null);
  const interactionGuard = useRef({ enabled: true });
  const [popUpHovered, setPopUpHovered] = useState(false);
  const scenesRef = useRef<Map<number, PopUpScene>>(new Map());
  const nextIdRef = useRef(1);
  const prevSelectedRef = useRef<number | null>(null);
  const popUpsRef = useRef(popUps);
  popUpsRef.current = popUps;
  const [initialised, setInitialised] = useState(false);
  const [coversOpened, setCoversOpened] = useState(false);
  const autoSettingsRef = useRef(new AutoTurnSettings());

  const getOrCreateScene = useCallback((pageIndex: number): PopUpScene => {
    let scene = scenesRef.current.get(pageIndex);
    if (!scene) {
      scene = new PopUpScene({ pageWidth: params.pageWidth, pageHeight: params.pageHeight });
      scenesRef.current.set(pageIndex, scene);
      if (popUpBookRef.current) popUpBookRef.current.setScene(pageIndex, scene);
    }
    return scene;
  }, [params.pageWidth, params.pageHeight]);

  const handleBuilt = useCallback((book: ThreeBook) => {
    bookRef.current = book;
    popUpBookRef.current = new PopUpBook({ book });
    popUpBookRef.current.bindInteraction({
      camera,
      domElement: gl.domElement,
      bookInteraction: interactionGuard.current,
    });
    popUpBookRef.current.onPopUpEnter = () => setPopUpHovered(true);
    popUpBookRef.current.onPopUpLeave = () => setPopUpHovered(false);
    for (const [pi, scene] of scenesRef.current) popUpBookRef.current.setScene(pi, scene);

    if (!initialised) {
      const offset = popUpBookRef.current.contentPageOffset;
      const entries: PopUpEntry[] = [];

      const s0 = getOrCreateScene(offset);
      const c1 = s0.addPopUp({ object: createPrimitive('cube'), x: 0.6, z: 1.0 });
      entries.push({ id: nextIdRef.current++, element: c1, type: 'cube', pageIndex: 0 });
      const t1 = s0.addPopUp({ object: createPrimitive('tree'), x: 1.5, z: 0.7, scale: 1.3 });
      entries.push({ id: nextIdRef.current++, element: t1, type: 'tree', pageIndex: 0 });
      const cn1 = s0.addPopUp({ object: createPrimitive('cone'), x: 1.2, z: 2.2 });
      entries.push({ id: nextIdRef.current++, element: cn1, type: 'cone', pageIndex: 0 });

      const s1 = getOrCreateScene(offset + 1);
      const sp1 = s1.addPopUp({ object: createPrimitive('sphere'), x: 0.8, z: 1.5 });
      entries.push({ id: nextIdRef.current++, element: sp1, type: 'sphere', pageIndex: 1 });
      const st1 = s1.addPopUp({ object: createPrimitive('star'), x: 1.4, z: 1.0, scale: 1.2 });
      entries.push({ id: nextIdRef.current++, element: st1, type: 'star', pageIndex: 1 });
      const cy1 = s1.addPopUp({ object: createPrimitive('cylinder'), x: 0.5, z: 2.0 });
      entries.push({ id: nextIdRef.current++, element: cy1, type: 'cylinder', pageIndex: 1 });

      onPopUpsChange(entries);
      setInitialised(true);
    }

    onBuilt(book);
  }, [bookRef, getOrCreateScene, onBuilt, onPopUpsChange, initialised]);

  // Auto-open past covers + pop-up update loop
  useFrame((_, delta) => {
    const book = bookRef.current;
    if (book && !coversOpened && book.isBuilt && book.isIdle) {
      book.startAutoTurning(0, autoSettingsRef.current, popUpBookRef.current!.frontCoverCount);
      setCoversOpened(true);
    }
    popUpBookRef.current?.update(delta);
  });

  // Page turn
  useEffect(() => {
    if (!turnRequest || !bookRef.current) return;
    bookRef.current.startAutoTurning(turnRequest === 'next' ? 0 : 1, autoSettingsRef.current, 1);
    onTurnComplete();
  }, [turnRequest]);

  // Selection highlight
  useEffect(() => {
    if (prevSelectedRef.current !== null) {
      const prev = popUps.find((p) => p.id === prevSelectedRef.current);
      if (prev) setHighlight(prev.element, false);
    }
    if (selectedId !== null) {
      const sel = popUps.find((p) => p.id === selectedId);
      if (sel) setHighlight(sel.element, true);
    }
    prevSelectedRef.current = selectedId;
  }, [selectedId, popUps]);

  // Add primitive
  useEffect(() => {
    if (!addRequest || !popUpBookRef.current || !bookRef.current) return;
    const pageIndex = visiblePage + popUpBookRef.current.contentPageOffset;
    const scene = getOrCreateScene(pageIndex);
    const element = scene.addPopUp({ object: createPrimitive(addRequest.type), x: params.pageWidth / 2, z: params.pageHeight / 2 });
    element.animated = springEnabled;
    const id = nextIdRef.current++;
    onPopUpsChange([...popUps, { id, element, type: addRequest.type, pageIndex: visiblePage }]);
    onSelect(id);
    onAddComplete();
  }, [addRequest]);

  // Load 3D model
  useEffect(() => {
    if (!modelFile || !popUpBookRef.current || !bookRef.current) return;
    const file = modelFile;
    onModelComplete();
    const loader = new GLTFLoader();
    const url = URL.createObjectURL(file);
    loader.loadAsync(url).then((gltf) => {
      const model = gltf.scene;
      model.traverse((c: any) => { if (c.isMesh) c.castShadow = true; });
      const scene = getOrCreateScene(visiblePage + popUpBookRef.current!.contentPageOffset);
      const element = scene.addPopUp({ object: model, x: params.pageWidth / 2, z: params.pageHeight / 2 });
      const displayName = file.name.replace(/\.(glb|gltf)$/i, '');
      element.animated = springEnabled;
      const id = nextIdRef.current++;
      onPopUpsChange([...popUpsRef.current, { id, element, type: 'cube', displayName, pageIndex: visiblePage }]);
      onSelect(id);
    }).catch((err) => { console.error('GLTF load failed:', err); })
    .finally(() => { URL.revokeObjectURL(url); });
  }, [modelFile]);

  // Update pop-up
  useEffect(() => {
    if (!updateRequest) return;
    const entry = popUps.find((p) => p.id === updateRequest.id);
    if (entry) {
      const { field, value } = updateRequest;
      if (field === 'x') entry.element.x = value;
      else if (field === 'z') entry.element.z = value;
      else if (field === 'scale') entry.element.scale = value;
      else if (field === 'rotation') entry.element.rotation = value;
      onPopUpsChange([...popUps]);
    }
    onUpdateComplete();
  }, [updateRequest]);

  // Remove pop-up
  useEffect(() => {
    if (removeRequest === null) return;
    const entry = popUps.find((p) => p.id === removeRequest);
    if (entry) {
      setHighlight(entry.element, false);
      for (const [, scene] of scenesRef.current) {
        if (scene.popUps.includes(entry.element)) { scene.removePopUp(entry.element); break; }
      }
      onPopUpsChange(popUps.filter((p) => p.id !== removeRequest));
      if (selectedId === removeRequest) onSelect(null);
    }
    onRemoveComplete();
  }, [removeRequest]);

  // Spring toggle
  useEffect(() => {
    for (const entry of popUps) entry.element.animated = springEnabled;
  }, [springEnabled]);

  // Drag interaction for pop-ups in 3D
  const dragging = useRef(false);
  const shiftDrag = useRef(false);
  const dragStartAngle = useRef(0);
  const dragStartRotation = useRef(0);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pagePlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hitPoint = useMemo(() => new THREE.Vector3(), []);
  const getNdc = useCallback((e: PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  }, [gl]);

  useEffect(() => {
    const canvas = gl.domElement;
    const pw = params.pageWidth;
    const ph = params.pageHeight;
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      raycaster.setFromCamera(getNdc(e), camera);
      const meshes: THREE.Object3D[] = [];
      for (const entry of popUpsRef.current) {
        if (!entry.element.pivot.visible) continue;
        entry.element.object.traverse((c) => { if ((c as THREE.Mesh).isMesh) meshes.push(c); });
      }
      const hits = raycaster.intersectObjects(meshes, false);
      if (hits.length > 0) {
        e.stopImmediatePropagation();
        const hitObj = hits[0].object;
        for (const entry of popUpsRef.current) {
          let found = false;
          entry.element.object.traverse((c) => { if (c === hitObj) found = true; });
          if (found) {
            onSelect(entry.id);
            dragging.current = true;
            shiftDrag.current = e.shiftKey;
            if (e.shiftKey) {
              const rect = canvas.getBoundingClientRect();
              dragStartAngle.current = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2);
              dragStartRotation.current = entry.element.rotation;
            }
            if (orbitRef.current) orbitRef.current.enabled = false;
            break;
          }
        }
        return;
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const sel = popUpsRef.current.find((p) => p.id === selectedId);
      if (!sel) return;
      e.stopImmediatePropagation();
      if (shiftDrag.current) {
        const rect = canvas.getBoundingClientRect();
        const angle = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2);
        sel.element.rotation = dragStartRotation.current + (angle - dragStartAngle.current);
        onPopUpsChange([...popUpsRef.current]);
      } else {
        raycaster.setFromCamera(getNdc(e), camera);
        if (raycaster.ray.intersectPlane(pagePlane, hitPoint)) {
          sel.element.x = Math.max(0.1, Math.min(pw - 0.1, hitPoint.x + pw / 2));
          sel.element.z = Math.max(0.1, Math.min(ph - 0.1, hitPoint.z + ph / 2));
          onPopUpsChange([...popUpsRef.current]);
        }
      }
    };
    const onPointerUp = () => { dragging.current = false; shiftDrag.current = false; if (orbitRef.current) orbitRef.current.enabled = true; };
    const onWheel = (e: WheelEvent) => {
      const sel = popUpsRef.current.find((p) => p.id === selectedId);
      if (!sel) return;
      sel.element.scale = Math.max(0.1, Math.min(5, sel.element.scale + (e.deltaY > 0 ? -0.05 : 0.05)));
      onPopUpsChange([...popUpsRef.current]);
      e.preventDefault();
    };
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => { canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointermove', onPointerMove); canvas.removeEventListener('pointerup', onPointerUp); canvas.removeEventListener('wheel', onWheel); };
  }, [selectedId, camera, gl, getNdc, params.pageWidth, params.pageHeight]);

  // Build page elements from state (declarative API)
  const pageElements: React.ReactNode[] = [];
  for (let i = 0; i < params.pageCount; i++) {
    if (spreadPages.has(i)) {
      const s = pageSlots[i];
      const blocks = pageTextBlocks[i] ?? [];
      pageElements.push(
        <Spread
          key={`spread-${i}`}
          image={s.useImage ? s.image ?? undefined : undefined}
          color={params.pageColor}
          fitMode={s.fitMode}
          fullBleed={s.fullBleed}
          imageRect={s.useImage ? s.imageRect : undefined}
        >
          {blocks.filter((b) => b.text).map((b, bi) => (
            <Text key={bi} x={b.x} y={b.y} width={b.width} fontSize={b.fontSize} fontFamily={b.fontFamily || params.bookFont} fontWeight={b.fontWeight} fontStyle={b.fontStyle} color={b.color} textAlign={b.textAlign} shadowColor={DEMO_SHADOW_COLOR} shadowBlur={DEMO_SHADOW_BLUR}>{b.text}</Text>
          ))}
        </Spread>,
      );
      i++;
      continue;
    }

    const s = pageSlots[i];
    const blocks = pageTextBlocks[i] ?? [];
    pageElements.push(
      <Page
        key={`page-${i}`}
        image={s.useImage ? s.image ?? undefined : undefined}
        color={params.pageColor}
        fitMode={s.fitMode}
        fullBleed={s.fullBleed}
        imageRect={s.useImage ? s.imageRect : undefined}
      >
        {blocks.filter((b) => b.text).map((b, bi) => (
          <Text key={bi} x={b.x} y={b.y} width={b.width} fontSize={b.fontSize} fontFamily={b.fontFamily || params.bookFont} fontWeight={b.fontWeight} fontStyle={b.fontStyle} color={b.color} textAlign={b.textAlign} shadowColor={DEMO_SHADOW_COLOR} shadowBlur={DEMO_SHADOW_BLUR}>{b.text}</Text>
        ))}
      </Page>,
    );
  }

  return (
    <>
      <color attach="background" args={[0x1a1a2e]} />
      <ambientLight intensity={params.ambientIntensity} />
      <directionalLight
        intensity={params.sunIntensity}
        position={[params.sunX, params.sunY, params.sunZ]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={0x2a2a4a} />
      </mesh>
      <OrbitControls ref={orbitRef} enableDamping dampingFactor={0.05} target={[0, 0.5, 0]} />

      <Book
        ref={bookRef}
        binding={binding}
        direction={toBookDirection(params.direction)}
        initialOpenProgress={params.openProgress}
        castShadows={params.castShadows}
        alignToGround={params.alignToGround}
        hideBinder={params.hideBinder}
        reduceShadows={params.reduceShadows}
        reduceSubMeshes={params.reduceSubMeshes}
        reduceOverdraw={params.reduceOverdraw}
        pagePaperSetup={{
          width: params.pageWidth, height: params.pageHeight,
          thickness: params.pageThickness, stiffness: params.pageStiffness,
          color: new THREE.Color(1, 1, 1), material: null,
        }}
        coverPaperSetup={{
          width: params.coverWidth, height: params.coverHeight,
          thickness: params.coverThickness, stiffness: params.coverStiffness,
          color: new THREE.Color(1, 1, 1), material: null,
        }}
        onBuilt={handleBuilt}
        onError={onError}
      >
        <BookInteraction enabled={params.interactive && !popUpHovered} orbitControlsRef={orbitRef} />

        {coverSlots.map((s, i) => {
          const blocks = coverTextBlocks[i] ?? [];
          return (
            <Cover
              key={`cover-${i}`}
              image={s.useImage ? s.image ?? undefined : undefined}
              color={params.coverColor}
              fitMode={s.fitMode}
              fullBleed={s.fullBleed}
              imageRect={s.useImage ? s.imageRect : undefined}
            >
              {blocks.filter((b) => b.text).map((b, bi) => (
                <Text key={bi} x={b.x} y={b.y} width={b.width} fontSize={b.fontSize} fontFamily={b.fontFamily || params.bookFont} fontWeight={b.fontWeight} fontStyle={b.fontStyle} color={b.color} textAlign={b.textAlign} shadowColor={DEMO_SHADOW_COLOR} shadowBlur={DEMO_SHADOW_BLUR}>{b.text}</Text>
              ))}
            </Cover>
          );
        })}

        {pageElements}
      </Book>
    </>
  );
}
