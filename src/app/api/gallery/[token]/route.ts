import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ success: false, error: "Token manquant" }, { status: 400 });
    }

    const data = dbService.getGalleryByToken(token);
    if (!data) {
      return NextResponse.json({ success: false, error: "Galerie introuvable ou expirée" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      gallery: {
        nom: data.contact?.nom || "Invité d'honneur",
        evenementNom: data.event?.nom || "Événement",
        date: data.event?.date,
        lieu: data.event?.lieu,
        photos: data.photos,
      },
    });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { action, lienId } = body;

    if (action === "remove_photo" && lienId) {
      const ok = dbService.removePhotoFromParticipation(lienId);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 });
  } catch (error) {
    console.error("Error updating gallery:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

