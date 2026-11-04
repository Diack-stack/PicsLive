import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { getFaceEngine } from "@/lib/engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const evenementId = searchParams.get("evenementId");
    const photos = dbService.getAllPhotos(evenementId || undefined);

    return NextResponse.json({
      success: true,
      photos,
      count: photos.length,
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, photographeNom, evenementId } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: "Photo URL is required" }, { status: 400 });
    }

    const event = dbService.getEvent(evenementId);
    const engine = getFaceEngine();

    // 1. Sauvegarder la photo
    const newPhoto = dbService.addPhoto({
      evenementId: event.id,
      photographeNom: photographeNom || "Photographe SFTP",
      url,
      statut: "traitée",
      visagesDetectes: 0,
    });

    // 2. Indexation faciale automatique
    const detectedFaces = await engine.indexPhoto(
      event.collectionMoteur,
      newPhoto.id,
      url
    );

    newPhoto.visagesDetectes = detectedFaces.length;
    newPhoto.statut = "indexée";

    return NextResponse.json({
      success: true,
      photo: newPhoto,
      detectedFaces,
    });
  } catch (error) {
    console.error("Error adding photo:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

