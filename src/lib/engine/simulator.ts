import { FaceEngine, DetectedFace, SearchResult, FaceMatch } from "./types";
import { getDb } from "../db";

export class SimulatorFaceEngine implements FaceEngine {
  readonly name = "Simulator Engine (PicsLive Local Mock)";

  async indexPhoto(
    _collectionId: string,
    photoId: string,
    _imageBufferOrUrl: string
  ): Promise<DetectedFace[]> {
    // Simulate Rekognition indexing latency
    await new Promise((r) => setTimeout(r, 350));

    // Return 1 to 2 detected faces with realistic bounding boxes
    const detected: DetectedFace[] = [
      {
        faceId: `sim_face_${photoId}_01`,
        confidence: 99.2 + Math.random() * 0.7,
        boundingBox: {
          top: 0.18 + Math.random() * 0.05,
          left: 0.28 + Math.random() * 0.05,
          width: 0.35,
          height: 0.42,
        },
      },
    ];

    return detected;
  }

  async searchFacesBySelfie(
    _collectionId: string,
    _selfieBase64OrUrl: string,
    thresholds = { sure: 92, probable: 82 }
  ): Promise<SearchResult> {
    const startTime = Date.now();
    // Simulate real biometric comparison latency
    await new Promise((r) => setTimeout(r, 650));

    const db = getDb();
    const allPhotos = db.photos;

    if (allPhotos.length === 0) {
      return {
        matches: [],
        matchedCount: 0,
        engineName: this.name,
        durationMs: Date.now() - startTime,
      };
    }

    // Select 2 to 4 photos to match
    // To make demo intuitive: if selfie is provided, we pick a realistic subset
    const numToPick = Math.min(allPhotos.length, Math.floor(Math.random() * 2) + 2);
    // Shuffle photos deterministically or randomly
    const shuffled = [...allPhotos].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numToPick);

    const matches: FaceMatch[] = selected.map((photo, index) => {
      // First 1-2 photos are in the "sure" zone (> 92%)
      // Any remaining photo is in the "probable" zone (82% - 92%)
      const isSure = index < Math.max(1, numToPick - 1);
      const similarity = isSure
        ? Number((thresholds.sure + Math.random() * (99.5 - thresholds.sure)).toFixed(1))
        : Number((thresholds.probable + Math.random() * (thresholds.sure - thresholds.probable - 1)).toFixed(1));

      return {
        photoId: photo.id,
        faceId: `face_match_${photo.id}`,
        similarity,
        zone: isSure ? "sure" : "probable",
      };
    });

    return {
      matches,
      matchedCount: matches.length,
      engineName: this.name,
      durationMs: Date.now() - startTime,
    };
  }

  async deleteCollection(_collectionId: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 200));
    return true;
  }
}

