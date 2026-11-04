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

    // Détection de Jack (Costume, lunettes, chemise blanche) vs Superviseur
    const hint = (guestHint || "").toLowerCase();
    const isJack =
      hint.includes("jack") ||
      hint.includes("diack") ||
      hint.includes("lamine") ||
      hint.includes("764175484") ||
      hint.includes("4175484");

    // Les 4 photos de Jack sont celles en .JPG (costume, lunettes, chemise blanche)
    // Les 4 photos du superviseur sont celles en .jpg
    let selected: PhotoData[] = [];
    if (isJack) {
      selected = allPhotos.filter(
        (p) => p.url.endsWith(".JPG") || p.personTag === "jack" || p.personTag === "diack"
      );
    } else {
      selected = allPhotos.filter(
        (p) => p.url.endsWith(".jpg") || p.personTag === "superviseur"
      );
    }

    // Sécurité stricte : toujours exactement 4 photos distinctes, JAMAIS 8 photos !
    if (selected.length === 0) {
      selected = isJack ? allPhotos.slice(4) : allPhotos.slice(0, 4);
    } else if (selected.length > 4) {
      selected = selected.slice(0, 4);
    }

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

