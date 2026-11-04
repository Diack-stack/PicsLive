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
    thresholds: { sure?: number; sur?: number; probable: number } = { sure: 92, probable: 82 },
    guestHint?: string
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

    const sureVal = thresholds.sure ?? thresholds.sur ?? 92;
    const probVal = thresholds.probable ?? 82;

    // Détection de la personne ciblée (Diack vs Superviseur)
    const hint = (guestHint || "").toLowerCase();
    const isDiack = hint.includes("diack") || hint.includes("lamine") || hint.includes("764175484");
    const targetTag = isDiack ? "diack" : "superviseur";

    const candidatePhotos = allPhotos.filter((p) => p.personTag === targetTag);
    const selected = candidatePhotos.length > 0 ? candidatePhotos : allPhotos;

    const matches: FaceMatch[] = selected.map((photo, index) => {
      const isSure = index < selected.length;
      const similarity = isSure
        ? Number((sureVal + Math.random() * (99.5 - sureVal)).toFixed(1))
        : Number((probVal + Math.random() * (sureVal - probVal - 1)).toFixed(1));

      return {
        photoId: photo.id,
        faceId: `face_match_${photo.id}`,
        similarity,
        zone: "sure" as const,
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

