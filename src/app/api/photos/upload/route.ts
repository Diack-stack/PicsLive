import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename = "upload.jpg", data, photographeNom = "Canon R6 Mark II (SFTP)" } = body;

    if (!data) {
      return NextResponse.json({ success: false, error: "Données image requises" }, { status: 400 });
    }

    // Extraction base64
    let base64Data = data;
    if (data.includes(",")) {
      base64Data = data.split(",")[1];
    }

    const ext = path.extname(filename) || ".jpg";
    const safeName = `photo_${Date.now()}_${Math.floor(Math.random() * 900) + 100}${ext}`;
    
    // Chemin de sauvegarde
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

    const event = dbService.getEvent();
    const newPhoto = dbService.addPhoto({
      evenementId: event.id,
      photographeNom,
      url: `/uploads/${safeName}`,
      statut: "traitée",
      visagesDetectes: Math.floor(Math.random() * 3) + 1,
    });

    return NextResponse.json({ success: true, photo: newPhoto });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}
