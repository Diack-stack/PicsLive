import { FaceEngine } from "./types";
import { SimulatorFaceEngine } from "./simulator";
import { RekognitionFaceEngine } from "./rekognition";

let activeEngine: FaceEngine | null = null;

export function getFaceEngine(): FaceEngine {
  if (activeEngine) return activeEngine;

  const mode = process.env.FACE_ENGINE_MODE || "SIMULATOR";
  if (mode === "AWS_REKOGNITION" && process.env.AWS_ACCESS_KEY_ID) {
    activeEngine = new RekognitionFaceEngine();
  } else {
    activeEngine = new SimulatorFaceEngine();
  }

  return activeEngine;
}

export * from "./types";

