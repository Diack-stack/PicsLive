export interface FaceBoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface DetectedFace {
  faceId: string;
  confidence: number;
  boundingBox: FaceBoundingBox;
}

export interface FaceMatch {
  photoId: string;
  faceId: string;
  similarity: number;
  zone: "sure" | "probable";
}

export interface SearchResult {
  matches: FaceMatch[];
  matchedCount: number;
  engineName: string;
  durationMs: number;
}

export interface FaceEngine {
  readonly name: string;

  /**
   * Index faces from a photo into the event collection
   */
  indexPhoto(
    collectionId: string,
    photoId: string,
    imageBufferOrUrl: string
  ): Promise<DetectedFace[]>;

  /**
   * Search matching photos for an input selfie / face crop
   */
  searchFacesBySelfie(
    collectionId: string,
    selfieBase64OrUrl: string,
    thresholds?: { sure?: number; sur?: number; probable: number },
    guestHint?: string
  ): Promise<SearchResult>;

  /**
   * Delete event collection when closing event
   */
  deleteCollection(collectionId: string): Promise<boolean>;
}

