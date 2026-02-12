export type RuneFrameRow = [text: string, colors: string[]];

export type RuneFrame = RuneFrameRow[];

export interface RuneGenerationSettings {
  thresholdLow: number;
  thresholdHigh: number;
  chars: string;
  fontRatio: number;
}

export interface RuneMeta {
  name: string;
  fps: number;
  columns: number;
  rows: number;
  frameCount: number;
  colored: boolean;
  generatedWith: RuneGenerationSettings;
}

export interface RuneAnimation {
  version: 1;
  meta: RuneMeta;
  frames: RuneFrame[];
}
