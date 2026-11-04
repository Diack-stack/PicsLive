import fs from "fs";
import path from "path";
import { DatabaseSchema, EventData, PhotoData, VisageData, ContactData, ParticipationData, ConsentementData, LienPhotoData } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const INITIAL_DB: DatabaseSchema = {
  events: [
    {
      id: "evt_dakar_gala_2026",
      nom: "Gala d'Excellence CreatifPics Dakar",
      type: "Gala & Soirée Privée",
      lieu: "King Fahd Palace, Dakar",
      date: "2026-11-15",
      statut: "en_cours",
      codeUnique: "GALA-2026",
      collectionMoteur: "picslive_gala_2026",
      banniereUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      fenetreJours: 7,
      modeJeunesse: false,
      optionPartageOrganisateur: true,
      langues: ["fr", "en"],
      seuils: {
        sur: 92,
        sure: 92,
        probable: 82,
      },
      clientNom: "CreatifPics Events",
    },
  ],
  photos: [
    {
      id: "photo_1793814422_93",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:02Z",
      url: "/uploads/photo_1793814422_105.jpg",
      statut: "indexée",
      visagesDetectes: 1,
    },
    {
      id: "photo_1793814422_42",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:02Z",
      url: "/uploads/photo_1793814422_636.jpg",
      statut: "indexée",
      visagesDetectes: 3,
    },
    {
      id: "photo_1793814422_62",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:02Z",
      url: "/uploads/photo_1793814422_715.jpg",
      statut: "indexée",
      visagesDetectes: 1,
    },
    {
      id: "photo_1793814422_63",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:02Z",
      url: "/uploads/photo_1793814422_135.jpg",
      statut: "indexée",
      visagesDetectes: 3,
    },
    {
      id: "photo_1793814422_82",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:02Z",
      url: "/uploads/photo_1793814421_101.JPG",
      statut: "indexée",
      visagesDetectes: 2,
    },
    {
      id: "photo_1793814421_28",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:01Z",
      url: "/uploads/photo_1793814421_653.JPG",
      statut: "indexée",
      visagesDetectes: 2,
    },
    {
      id: "photo_1793814421_58",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:01Z",
      url: "/uploads/photo_1793814420_156.JPG",
      statut: "indexée",
      visagesDetectes: 1,
    },
    {
      id: "photo_1793814420_68",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:00Z",
      url: "/uploads/photo_1793814420_594.JPG",
      statut: "indexée",
      visagesDetectes: 1,
    },
  ],
  visages: [
    {
      id: "face_01",
      faceIdMoteur: "mock_face_id_01",
      photoId: "photo_01",
      evenementId: "evt_dakar_gala_2026",
      cadre: { top: 0.2, left: 0.3, width: 0.4, height: 0.4 },
      confidence: 99.8,
    },
    {
      id: "face_02",
      faceIdMoteur: "mock_face_id_02",
      photoId: "photo_02",
      evenementId: "evt_dakar_gala_2026",
      cadre: { top: 0.15, left: 0.35, width: 0.38, height: 0.45 },
      confidence: 99.4,
    },
    {
      id: "face_03",
      faceIdMoteur: "mock_face_id_03",
      photoId: "photo_03",
      evenementId: "evt_dakar_gala_2026",
      cadre: { top: 0.18, left: 0.3, width: 0.4, height: 0.42 },
      confidence: 99.1,
    },
  ],
  contacts: [],
  participations: [],
  consentements: [],
  liensPhotos: [],
};

function ensureDbFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2), "utf-8");
    }
  } catch (_err) {
    // Environnement serverless en lecture seule (Vercel)
  }
}

export function getDb(): DatabaseSchema {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error("Error reading database:", err);
    return INITIAL_DB;
  }
}

export function saveDb(data: DatabaseSchema): void {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export const dbService = {
  getEvent(codeOrId?: string): EventData {
    const db = getDb();
    if (!codeOrId) return db.events[0];
    const event = db.events.find(
      (e) => e.id === codeOrId || e.codeUnique.toUpperCase() === codeOrId.toUpperCase()
    );
    return event || db.events[0];
  },

  getAllPhotos(evenementId?: string): PhotoData[] {
    const db = getDb();
    if (!evenementId) return db.photos;
    return db.photos.filter((p) => p.evenementId === evenementId);
  },

  addPhoto(photo: Omit<PhotoData, "id" | "priseLe">): PhotoData {
    const db = getDb();
    const newPhoto: PhotoData = {
      ...photo,
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      priseLe: new Date().toISOString(),
    };
    db.photos.unshift(newPhoto);
    saveDb(db);
    return newPhoto;
  },

  createOrUpdateContact(data: { nom: string; whatsappE164: string; email?: string; majeur: boolean }): ContactData {
    const db = getDb();
    let contact = db.contacts.find((c) => c.whatsappE164 === data.whatsappE164);
    if (!contact) {
      contact = {
        id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        nom: data.nom,
        whatsappE164: data.whatsappE164,
        email: data.email,
        majeur: data.majeur,
        creeLe: new Date().toISOString(),
      };
      db.contacts.push(contact);
    } else {
      contact.nom = data.nom;
      if (data.email) contact.email = data.email;
      contact.majeur = data.majeur;
    }
    saveDb(db);
    return contact;
  },

  createParticipation(params: {
    contactId: string;
    evenementId: string;
    nom?: string;
    selfieUrl?: string;
  }): { participation: ParticipationData; jetonGalerie: string } {
    const db = getDb();
    // Unique secure random gallery token
    const jetonGalerie = `pl_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const participation: ParticipationData = {
      id: `part_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contactId: params.contactId,
      evenementId: params.evenementId,
      jetonGalerie,
      nom: params.nom,
      reconnuLe: new Date().toISOString(),
      nbPhotos: 0,
      statutRecuperation: "en_attente",
      selfieUrl: params.selfieUrl,
    };
    db.participations.push(participation);
    saveDb(db);
    return { participation, jetonGalerie };
  },

  recordConsents(participationId: string, consents: Array<{ type: "photos" | "marketing" | "partage_organisateur"; accepte: boolean; borneId?: string }>): void {
    const db = getDb();
    for (const c of consents) {
      db.consentements.push({
        id: `cst_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        participationId,
        type: c.type,
        accepte: c.accepte,
        versionTexte: "v2.1",
        horodatage: new Date().toISOString(),
        borneId: c.borneId || "borne_ipad_01",
      });
    }
    saveDb(db);
  },

  associatePhotos(participationId: string, matches: Array<{ photoId: string; similarite: number; zone: "sure" | "probable" }>): void {
    const db = getDb();
    for (const match of matches) {
      db.liensPhotos.push({
        id: `lnk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        participationId,
        photoId: match.photoId,
        similarite: match.similarite,
        zone: match.zone,
        statut: "actif",
      });
    }

    // Update count in participation
    const part = db.participations.find((p) => p.id === participationId);
    if (part) {
      part.nbPhotos = matches.filter((m) => m.zone === "sure").length;
    }
    saveDb(db);
  },

  getGalleryByToken(token: string) {
    const db = getDb();
    const participation = db.participations.find((p) => p.jetonGalerie === token);
    if (!participation) return null;

    const contact = db.contacts.find((c) => c.id === participation.contactId);
    const event = db.events.find((e) => e.id === participation.evenementId);
    const liens = db.liensPhotos.filter((l) => l.participationId === participation.id && l.statut === "actif");

    const matchedPhotos = liens
      .map((lien) => {
        const photo = db.photos.find((p) => p.id === lien.photoId);
        if (!photo) return null;
        return {
          ...photo,
          similarite: lien.similarite,
          zone: lien.zone,
          lienId: lien.id,
        };
      })
      .filter(Boolean);

    return {
      participation,
      contact,
      event,
      photos: matchedPhotos,
    };
  },

  removePhotoFromParticipation(lienId: string): boolean {
    const db = getDb();
    const lien = db.liensPhotos.find((l) => l.id === lienId);
    if (!lien) return false;
    lien.statut = "retire_invite";
    saveDb(db);
    return true;
  },

  getStats(evenementId?: string) {
    const db = getDb();
    const photos = evenementId ? db.photos.filter((p) => p.evenementId === evenementId) : db.photos;
    const participations = evenementId ? db.participations.filter((p) => p.evenementId === evenementId) : db.participations;
    const contacts = db.contacts;
    const marketingOptIns = db.consentements.filter((c) => c.type === "marketing" && c.accepte).length;
    const totalMarketingAsked = db.consentements.filter((c) => c.type === "marketing").length;

    return {
      totalPhotos: photos.length,
      totalGuests: participations.length,
      totalContacts: contacts.length,
      marketingOptInRate: totalMarketingAsked > 0 ? Math.round((marketingOptIns / totalMarketingAsked) * 100) : 0,
    };
  },
};

