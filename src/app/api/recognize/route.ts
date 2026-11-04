import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { getFaceEngine } from "@/lib/engine";
import { formatWhatsAppToE164 } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      selfieBase64,
      nom,
      whatsapp,
      email,
      isMajeur = true,
      consentPhotos,
      consentMarketing = false,
      consentPartage = false,
      evenementId,
      borneId = "borne_ipad_01",
    } = body;

    if (!nom || !whatsapp) {
      return NextResponse.json(
        { success: false, error: "Nom et numéro WhatsApp requis" },
        { status: 400 }
      );
    }

    if (!consentPhotos) {
      return NextResponse.json(
        { success: false, error: "Le consentement à l'analyse faciale est obligatoire" },
        { status: 400 }
      );
    }

    const event = dbService.getEvent(evenementId);
    const engine = getFaceEngine();
    const whatsappE164 = formatWhatsAppToE164(whatsapp);

    // 1. Enregistrement ou mise à jour du Contact
    const contact = dbService.createOrUpdateContact({
      nom: nom.trim(),
      whatsappE164,
      email: email ? email.trim() : undefined,
      majeur: Boolean(isMajeur),
    });

    // 2. Création de la Participation et du jeton de galerie sécurisé
    const { participation, jetonGalerie } = dbService.createParticipation({
      contactId: contact.id,
      evenementId: event.id,
      nom: nom.trim(),
      selfieUrl: selfieBase64 ? "data:image/jpeg;base64,..." : undefined,
    });

    // 3. Enregistrement légal des Consentements (RGPD / CDP)
    const consentsToRecord: Array<{
      type: "photos" | "marketing" | "partage_organisateur";
      accepte: boolean;
      borneId?: string;
    }> = [
      { type: "photos", accepte: true, borneId },
      { type: "marketing", accepte: Boolean(consentMarketing), borneId },
    ];

    if (event.optionPartageOrganisateur) {
      consentsToRecord.push({
        type: "partage_organisateur",
        accepte: Boolean(consentPartage),
        borneId,
      });
    }

    dbService.recordConsents(participation.id, consentsToRecord);

    // 4. Recherche faciale par le moteur (AWS Rekognition ou Simulateur)
    const searchResult = await engine.searchFacesBySelfie(
      event.collectionMoteur,
      selfieBase64 || "",
      event.seuils
    );

    // 5. Association des photos trouvées à la participation
    if (searchResult.matches.length > 0) {
      dbService.associatePhotos(
        participation.id,
        searchResult.matches.map((m) => ({
          photoId: m.photoId,
          similarite: m.similarity,
          zone: m.zone,
        }))
      );
    }

    const sureMatches = searchResult.matches.filter((m) => m.zone === "sure");
    const probableMatches = searchResult.matches.filter((m) => m.zone === "probable");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const galleryUrl = `${appUrl}/galerie/${jetonGalerie}`;

    return NextResponse.json({
      success: true,
      jetonGalerie,
      galleryUrl,
      matchedSureCount: sureMatches.length,
      matchedProbableCount: probableMatches.length,
      totalCount: searchResult.matches.length,
      engine: searchResult.engineName,
      durationMs: searchResult.durationMs,
    });
  } catch (error) {
    console.error("Error in recognize API:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du traitement biométrique" },
      { status: 500 }
    );
  }
}

