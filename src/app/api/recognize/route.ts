import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { getFaceEngine } from "@/lib/engine";
import { formatWhatsAppToE164 } from "@/lib/utils";
import QRCode from "qrcode";

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

    // 2. Recherche faciale par le moteur (AWS Rekognition ou Simulateur)
    const thresholds = {
      sure: event.seuils.sure ?? event.seuils.sur ?? 92,
      probable: event.seuils.probable ?? 82,
    };
    const guestHint = `${nom} ${whatsapp}`;
    const searchResult = await engine.searchFacesBySelfie(
      event.collectionMoteur,
      selfieBase64 || "",
      thresholds,
      guestHint
    );
    const matchedPhotoIds = searchResult.matches.map((m) => m.photoId);

    // 3. Création de la Participation et du jeton de galerie autonome (stateless Vercel)
    const { participation, jetonGalerie } = dbService.createParticipation({
      contactId: contact.id,
      evenementId: event.id,
      nom: nom.trim(),
      matchedPhotoIds,
      selfieUrl: selfieBase64 ? "data:image/jpeg;base64,..." : undefined,
    });

    // 4. Enregistrement légal des Consentements (RGPD / CDP)
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

    // Auto-détection de l'URL réelle (Vercel ou local)
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "pics-live-blue.vercel.app";
    const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
    const galleryUrl = `${appUrl}/galerie/${jetonGalerie}`;

    let qrCode: string | undefined;
    try {
      qrCode = await QRCode.toDataURL(galleryUrl, {
        width: 280,
        margin: 1,
        color: { dark: "#070D18", light: "#FFFFFF" },
      });
    } catch {
      qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=070D18&bgcolor=FFFFFF&margin=10&data=${encodeURIComponent(galleryUrl)}`;
    }

    return NextResponse.json({
      success: true,
      jetonGalerie,
      galleryUrl,
      qrCode,
      matchedSureCount: sureMatches.length,
      matchedProbableCount: probableMatches.length,
      totalCount: searchResult.matches.length,
      engine: searchResult.engineName,
      durationMs: searchResult.durationMs,
    });
  } catch (error: any) {
    console.error("Error in recognize API:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erreur lors du traitement biométrique" },
      { status: 500 }
    );
  }
}

