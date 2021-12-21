import { CameraParams } from "./position";

interface PositionHashParams {
  x: string;
  y: string;
  z?: string;
  e?: string;
  a?: string;
}

export function buildPositionHash(pos: CameraParams): PositionHashParams {
  let res: PositionHashParams = {
    x: pos.longitude.toFixed(4),
    y: pos.latitude.toFixed(4),
    z: pos.height.toFixed(0),
  };

  const elevationAngle = Math.round(90 + pos.pitch);
  if (elevationAngle != 0) {
    res.e = elevationAngle.toFixed(0);
  }

  let az = Math.round(pos.heading);
  if (az >= 360) az -= 360;
  if (az < 0) az += 360;
  if (az != 0) res.a = az.toFixed(0);

  return res;
}

type NumberOrNull = number | null;

function getNumbers(
  obj: { [k: string]: string },
  keys: string[]
): NumberOrNull[] {
  return keys.map((d) => {
    const num = parseFloat(obj[d]);
    return isNaN(num) ? null : num;
  });
}

const defaultPos = {
  longitude: -122,
  latitude: 36,
  height: 60000,
  heading: 0,
  pitch: -90,
  roll: 0,
};

export function getInitialPosition(
  hashVals: {
    [key: string]: string;
  },
  defaultPosition: CameraParams = defaultPos
): CameraParams | null {
  console.log(hashVals);
  if (hashVals == null) return defaultPosition;
  const [x, y, z, e, a] = getNumbers(hashVals, ["x", "y", "z", "e", "a"]);
  if (x == null && y == null) return defaultPosition;
  let pos = {
    longitude: x,
    latitude: y,
    height: z ?? 5000,
    heading: a ?? 0,
    pitch: -90 + (e ?? 0),
    roll: 0,
  };
  console.log("Setting initial position from hash: ", pos);
  return pos;
}
