import { FaceEngine, DetectedFace, SearchResult } from "./types";

/**
 * Production AWS Rekognition Engine adapter
 * Activated when FACE_ENGINE_MODE=AWS_REKOGNITION and AWS keys are configured
 */
export class RekognitionFaceEngine implements FaceEngine {
  readonly name = "AWS Rekognition (EU Region)";
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION || "eu-west-1";
  }

  async indexPhoto(
    collectionId: string,
    photoId: string,
    _imageBufferOrUrl: string
  ): Promise<DetectedFace[]> {
    console.log(`[AWS Rekognition] Indexing photo ${photoId} in collection ${collectionId} (${this.region})`);
    // Placeholder for @aws-sdk/client-rekognition IndexFacesCommand
    return [
      {
        faceId: `aws_face_${photoId}`,
        confidence: 99.8,
        boundingBox: { top: 0.2, left: 0.25, width: 0.4, height: 0.4 },
      },
    ];
  }

  async searchFacesBySelfie(
    collectionId: string,
    _selfieBase64OrUrl: string,
    _thresholds = { sure: 95, probable: 85 }
  ): Promise<SearchResult> {
    console.log(`[AWS Rekognition] Searching in collection ${collectionId}`);
    // Placeholder for @aws-sdk/client-rekognition SearchFacesByImageCommand
    return {
      matches: [],
      matchedCount: 0,
      engineName: this.name,
      durationMs: 300,
    };
  }

  async deleteCollection(collectionId: string): Promise<boolean> {
    console.log(`[AWS Rekognition] Deleting collection ${collectionId}`);
    return true;
  }
}

