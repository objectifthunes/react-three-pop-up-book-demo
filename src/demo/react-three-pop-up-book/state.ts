import { PX_PER_UNIT } from '@objectifthunes/react-three-pop-up-book';

export type { ImageSlot, PageTextBlock, DirectionOption, ImageFitMode, ImageRect } from '@objectifthunes/react-three-book/demo-kit';
export { DEMO_SHADOW_COLOR, DEMO_SHADOW_BLUR, DEFAULT_LINE_HEIGHT, DEFAULT_FONT_SIZE, DEFAULT_TEXT_COLOR, FONT_OPTIONS, createDefaultTextBlock, toBookDirection, EMPTY_SLOT } from '@objectifthunes/react-three-book/demo-kit';

export { PX_PER_UNIT };

export interface DemoParams {
  pageWidth: number;
  pageHeight: number;
  pageThickness: number;
  pageStiffness: number;
  pageCount: number;
  pageColor: string;
  coverWidth: number;
  coverHeight: number;
  coverThickness: number;
  coverStiffness: number;
  coverColor: string;
  direction: 'left-to-right' | 'right-to-left' | 'up-to-down' | 'down-to-up';
  openProgress: number;
  castShadows: boolean;
  alignToGround: boolean;
  hideBinder: boolean;
  reduceShadows: boolean;
  reduceSubMeshes: boolean;
  reduceOverdraw: boolean;
  interactive: boolean;
  sunIntensity: number;
  ambientIntensity: number;
  sunX: number;
  sunY: number;
  sunZ: number;
  bookFont: string;
}

export const defaultParams: DemoParams = {
  pageWidth: 2,
  pageHeight: 3,
  pageThickness: 0.02,
  pageStiffness: 0.2,
  pageCount: 8,
  pageColor: '#f5f5dc',
  coverWidth: 2.1,
  coverHeight: 3.1,
  coverThickness: 0.04,
  coverStiffness: 0.5,
  coverColor: '#ff0000',
  direction: 'left-to-right',
  openProgress: 0,
  castShadows: true,
  alignToGround: true,
  hideBinder: false,
  reduceShadows: false,
  reduceSubMeshes: false,
  reduceOverdraw: false,
  interactive: true,
  sunIntensity: 1.2,
  ambientIntensity: 0.6,
  sunX: 5,
  sunY: 10,
  sunZ: 5,
  bookFont: 'Georgia',
};
