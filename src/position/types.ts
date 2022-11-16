export type Position = { x: number; y: number; z: number };

export type GeographicLocation = {
  longitude: number;
  latitude: number;
};

export interface CameraParams extends GeographicLocation {
  height: number;
  heading: number;
  pitch: number;
  roll: number;
}

export type ViewInfo = {
  camera: CameraParams;
  viewCenter: Position;
};
