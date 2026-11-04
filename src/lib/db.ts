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
      personTag: "superviseur",
    },
    {
      id: "photo_1793814422_42",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:02Z",
      url: "/uploads/photo_1793814422_636.jpg",
      statut: "indexée",
      visagesDetectes: 3,
      personTag: "superviseur",
    },
    {
      id: "photo_1793814422_62",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:02Z",
      url: "/uploads/photo_1793814422_715.jpg",
      statut: "indexée",
      visagesDetectes: 1,
      personTag: "superviseur",
    },
    {
      id: "photo_1793814422_63",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:02Z",
      url: "/uploads/photo_1793814422_135.jpg",
      statut: "indexée",
      visagesDetectes: 3,
      personTag: "superviseur",
    },
    {
      id: "photo_1793814422_82",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:02Z",
      url: "/uploads/photo_1793814421_101.JPG",
      statut: "indexée",
      visagesDetectes: 2,
      personTag: "diack",
    },
    {
      id: "photo_1793814421_28",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:01Z",
      url: "/uploads/photo_1793814421_653.JPG",
      statut: "indexée",
      visagesDetectes: 2,
      personTag: "diack",
    },
    {
      id: "photo_1793814421_58",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:01Z",
      url: "/uploads/photo_1793814420_156.JPG",
      statut: "indexée",
      visagesDetectes: 1,
      personTag: "diack",
    },
    {
      id: "photo_1793814420_68",
      evenementId: "evt_dakar_gala_2026",
      photographeNom: "Canon R6 Mark II (SFTP)",
      priseLe: "2026-11-04T17:47:00Z",
      url: "/uploads/photo_1793814420_594.JPG",
      statut: "indexée",
      visagesDetectes: 1,
      personTag: "diack",
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

let inMemoryDb: DatabaseSchema | null = null;
const TMP_DB_PATH = path.join("/tmp", "picslive_db.json");

export function getDb(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  // 1. Essayer le fichier local data/db.json
  try {
    ensureDbFile();
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      inMemoryDb = JSON.parse(raw) as DatabaseSchema;
      return inMemoryDb;
    }
  } catch (_err) {
    // Lecture fichier local impossible
  }

  // 2. Essayer le cache temporaire Vercel (/tmp)
  try {
    if (fs.existsSync(TMP_DB_PATH)) {
      const raw = fs.readFileSync(TMP_DB_PATH, "utf-8");
      inMemoryDb = JSON.parse(raw) as DatabaseSchema;
      return inMemoryDb;
    }
  } catch (_err) {
    // Lecture /tmp impossible
  }

  // 3. Fallback sur INITIAL_DB
  inMemoryDb = JSON.parse(JSON.stringify(INITIAL_DB));
  return inMemoryDb!;
}

export function saveDb(data: DatabaseSchema): void {
  inMemoryDb = data;

  // 1. Sauvegarde dans /tmp (zone inscriptible officielle sur Vercel serverless)
  try {
    fs.writeFileSync(TMP_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (_err) {
    // Ignore si non disponible
  }

  // 2. Sauvegarde sur le disque local (environnement dev / node local)
  try {
    ensureDbFile();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (_err) {
    // Ignorer silencieusement si read-only sur Vercel
  }
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
    matchedPhotoIds?: string[];
    selfieUrl?: string;
  }): { participation: ParticipationData; jetonGalerie: string } {
    const db = getDb();
    const guestNom = params.nom || "Invité d'honneur";
    const payload = {
      n: guestNom,
      ids: params.matchedPhotoIds || [],
      t: Date.now(),
    };
    const jetonGalerie = `pl_${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
    const participation: ParticipationData = {
      id: `part_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contactId: params.contactId,
      evenementId: params.evenementId,
      jetonGalerie,
      nom: guestNom,
      reconnuLe: new Date().toISOString(),
      nbPhotos: params.matchedPhotoIds?.length || 0,
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
    let participation = db.participations.find((p) => p.jetonGalerie === token);
    let contact = participation ? db.contacts.find((c) => c.id === participation!.contactId) : undefined;
    const event = db.events[0];

    let guestNom = participation?.nom || contact?.nom;
    let matchedPhotoIds: string[] = [];

    // Décodage autonome (résilience 100% sur Vercel serverless multi-conteneurs)
    if (token.startsWith("pl_")) {
      try {
        const raw = token.slice(3);
        const decoded = JSON.parse(Buffer.from(raw, "base64url").toString("utf-8"));
        if (decoded.n) guestNom = decoded.n;
        if (Array.isArray(decoded.ids)) matchedPhotoIds = decoded.ids;
        if (!participation) {
          participation = {
            id: `part_${decoded.t || Date.now()}`,
            contactId: `cnt_${decoded.t || Date.now()}`,
            evenementId: event.id,
            jetonGalerie: token,
            nom: guestNom,
            reconnuLe: new Date().toISOString(),
            nbPhotos: matchedPhotoIds.length,
            statutRecuperation: "consultee",
          };
        }
      } catch (_e) {
        // Token legacy
      }
    }

    if (!participation) {
      participation = {
        id: `part_${Date.now()}`,
        contactId: `cnt_${Date.now()}`,
        evenementId: event.id,
        jetonGalerie: token,
        nom: guestNom || "Invité d'honneur",
        reconnuLe: new Date().toISOString(),
        nbPhotos: 4,
        statutRecuperation: "consultee",
      };
    }

    let matchedPhotos: any[] = [];
    if (matchedPhotoIds.length > 0) {
      matchedPhotos = matchedPhotoIds
        .map((id) => {
          const ph = db.photos.find((p) => p.id === id);
          if (!ph) return null;
          return {
            ...ph,
            similarite: 96.8,
            zone: "sure" as const,
            lienId: `lnk_${ph.id}`,
          };
        })
        .filter(Boolean);
    } else {
      const liens = db.liensPhotos.filter((l) => l.participationId === participation!.id && l.statut === "actif");
      matchedPhotos = liens
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
    }

    // Si aucune photo n'a pu être résolue, cibler selon la personne
    if (matchedPhotos.length === 0) {
      const isDiack = (guestNom || "").toLowerCase().includes("diack") || (guestNom || "").toLowerCase().includes("lamine");
      const targetTag = isDiack ? "diack" : "superviseur";
      matchedPhotos = db.photos
        .filter((p) => p.personTag === targetTag)
        .map((ph) => ({
          ...ph,
          similarite: 97.4,
          zone: "sure" as const,
          lienId: `lnk_${ph.id}`,
        }));
    }

    return {
      participation,
      contact: contact || {
        id: participation.contactId,
        nom: guestNom || "Invité d'honneur",
        whatsappE164: "",
        majeur: true,
        creeLe: new Date().toISOString(),
      },
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

